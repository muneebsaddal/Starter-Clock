export const PEAK_MODEL_VERSION = "baseline-v1" as const;

export type FlourType = "white" | "whole_wheat" | "rye" | "blend" | "other";

export interface FeedingInput {
  fedAtMs: number;
  starterGrams: number;
  flourGrams: number;
  waterGrams: number;
  flourType?: FlourType;
  temperatureC?: number;
}

export interface PeakObservation {
  predictedMidpointHours: number;
  observedElapsedHours: number;
}

export type EstimateMode = "baseline" | "widened" | "personalized";

export interface EstimateFactor {
  code:
    | "feeding_ratio"
    | "hydration"
    | "temperature"
    | "flour_type"
    | "missing_temperature"
    | "missing_flour_type"
    | "outside_calibration"
    | "starter_history";
  effect: "earlier" | "later" | "wider" | "adjusted" | "neutral";
}

export interface PeakEstimate {
  modelVersion: typeof PEAK_MODEL_VERSION;
  earliestAtMs: number;
  midpointAtMs: number;
  latestAtMs: number;
  mode: EstimateMode;
  factors: EstimateFactor[];
  missingInputs: Array<"temperature" | "flour_type">;
  personalization: {
    applied: boolean;
    validObservationCount: number;
    reason: "applied" | "not_enough_observations" | "observations_too_variable";
  };
}

const HOUR_MS = 60 * 60 * 1000;
const MIN_PERSONALIZATION_OBSERVATIONS = 5;

const flourTimeMultipliers: Record<FlourType, number> = {
  white: 1,
  whole_wheat: 0.9,
  rye: 0.82,
  blend: 0.95,
  other: 1,
};

export function calculateFeedingRatio(input: Pick<FeedingInput, "starterGrams" | "flourGrams" | "waterGrams">) {
  validateAmounts(input);
  return {
    starter: 1,
    flour: input.flourGrams / input.starterGrams,
    water: input.waterGrams / input.starterGrams,
  };
}

export function calculateHydrationPercent(input: Pick<FeedingInput, "flourGrams" | "waterGrams">) {
  validatePositiveFinite("flourGrams", input.flourGrams);
  validatePositiveFinite("waterGrams", input.waterGrams);
  return (input.waterGrams / input.flourGrams) * 100;
}

export function estimatePeak(input: FeedingInput, observations: readonly PeakObservation[] = []): PeakEstimate {
  validateInput(input);

  const flourToStarter = input.flourGrams / input.starterGrams;
  const hydration = calculateHydrationPercent(input);
  const factors: EstimateFactor[] = [
    { code: "feeding_ratio", effect: flourToStarter > 1 ? "later" : flourToStarter < 1 ? "earlier" : "neutral" },
    { code: "hydration", effect: hydration > 110 ? "earlier" : hydration < 90 ? "later" : "neutral" },
  ];
  const missingInputs: PeakEstimate["missingInputs"] = [];
  let outsideCalibration = false;

  const calibratedFlourToStarter = clamp(flourToStarter, 0.25, 20);
  const calibratedHydration = clamp(hydration, 50, 200);
  if (calibratedFlourToStarter !== flourToStarter || calibratedHydration !== hydration) {
    outsideCalibration = true;
  }

  // Product heuristic: 1:1 flour inoculation at 24 C centers near six hours;
  // each doubling of flour adds 1.7 hours before temperature/flour adjustment.
  let midpointHours = Math.max(2, 6 + 1.7 * Math.log2(calibratedFlourToStarter));

  // Q10=2 is a deliberately simple, bounded biological-rate approximation.
  // It is not represented as a validated sourdough growth equation.
  if (input.temperatureC === undefined || input.temperatureC < 10 || input.temperatureC > 35) {
    missingInputs.push("temperature");
    factors.push({ code: "missing_temperature", effect: "wider" });
    if (input.temperatureC !== undefined) outsideCalibration = true;
  } else {
    midpointHours *= 2 ** ((24 - input.temperatureC) / 10);
    factors.push({ code: "temperature", effect: input.temperatureC > 24 ? "earlier" : input.temperatureC < 24 ? "later" : "neutral" });
  }

  midpointHours *= (100 / calibratedHydration) ** 0.15;

  if (input.flourType === undefined) {
    missingInputs.push("flour_type");
    factors.push({ code: "missing_flour_type", effect: "wider" });
  } else {
    midpointHours *= flourTimeMultipliers[input.flourType];
    factors.push({ code: "flour_type", effect: flourTimeMultipliers[input.flourType] < 1 ? "earlier" : "neutral" });
  }

  if (outsideCalibration) factors.push({ code: "outside_calibration", effect: "wider" });

  const personalization = derivePersonalization(observations);
  if (personalization.applied) {
    midpointHours += personalization.offsetHours;
    factors.push({ code: "starter_history", effect: "adjusted" });
  }
  midpointHours = clamp(midpointHours, 2, 36);

  let halfWidthHours = Math.max(0.75, midpointHours * 0.1);
  if (missingInputs.includes("temperature")) halfWidthHours += midpointHours * 0.2;
  if (missingInputs.includes("flour_type")) halfWidthHours += midpointHours * 0.08;
  if (outsideCalibration) halfWidthHours += midpointHours * 0.15;

  const earliestHours = Math.max(1, midpointHours - halfWidthHours);
  const latestHours = Math.min(48, midpointHours + halfWidthHours);
  const toTimestamp = (hours: number) => input.fedAtMs + Math.round(hours * 60) * 60_000;

  return {
    modelVersion: PEAK_MODEL_VERSION,
    earliestAtMs: toTimestamp(earliestHours),
    midpointAtMs: toTimestamp(midpointHours),
    latestAtMs: toTimestamp(latestHours),
    mode: personalization.applied ? "personalized" : missingInputs.length > 0 || outsideCalibration ? "widened" : "baseline",
    factors,
    missingInputs,
    personalization: {
      applied: personalization.applied,
      validObservationCount: personalization.validObservationCount,
      reason: personalization.reason,
    },
  };
}

function derivePersonalization(observations: readonly PeakObservation[]) {
  const residuals = observations
    .filter((item) =>
      Number.isFinite(item.predictedMidpointHours) &&
      Number.isFinite(item.observedElapsedHours) &&
      item.predictedMidpointHours >= 2 &&
      item.predictedMidpointHours <= 36 &&
      item.observedElapsedHours >= 2 &&
      item.observedElapsedHours <= 36 &&
      Math.abs(item.observedElapsedHours - item.predictedMidpointHours) <= 12,
    )
    .slice(-12)
    .map((item) => item.observedElapsedHours - item.predictedMidpointHours);

  if (residuals.length < MIN_PERSONALIZATION_OBSERVATIONS) {
    return { applied: false as const, offsetHours: 0, validObservationCount: residuals.length, reason: "not_enough_observations" as const };
  }

  const offsetHours = median(residuals);
  const medianAbsoluteDeviation = median(residuals.map((residual) => Math.abs(residual - offsetHours)));
  if (medianAbsoluteDeviation > 3) {
    return { applied: false as const, offsetHours: 0, validObservationCount: residuals.length, reason: "observations_too_variable" as const };
  }

  return {
    applied: true as const,
    offsetHours: clamp(offsetHours, -4, 4),
    validObservationCount: residuals.length,
    reason: "applied" as const,
  };
}

function median(values: readonly number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const right = sorted[middle];
  if (right === undefined) throw new Error("Cannot calculate a median without values");
  if (sorted.length % 2 === 1) return right;
  const left = sorted[middle - 1];
  if (left === undefined) throw new Error("Cannot calculate a median without values");
  return (left + right) / 2;
}

function validateInput(input: FeedingInput) {
  if (!Number.isFinite(input.fedAtMs)) throw new RangeError("fedAtMs must be a finite absolute timestamp");
  validateAmounts(input);
  if (input.temperatureC !== undefined && (!Number.isFinite(input.temperatureC) || input.temperatureC < -50 || input.temperatureC > 80)) {
    throw new RangeError("temperatureC must be between -50 and 80");
  }
}

function validateAmounts(input: Pick<FeedingInput, "starterGrams" | "flourGrams" | "waterGrams">) {
  validatePositiveFinite("starterGrams", input.starterGrams);
  validatePositiveFinite("flourGrams", input.flourGrams);
  validatePositiveFinite("waterGrams", input.waterGrams);
}

function validatePositiveFinite(name: string, value: number) {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be positive and finite`);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}
