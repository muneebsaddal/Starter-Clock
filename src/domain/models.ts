export type StarterStatus = "active" | "archived";
export type FlourType = "white" | "whole_wheat" | "rye" | "blend" | "other";

export interface Starter {
  id: string;
  name: string;
  status: StarterStatus;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface Feeding {
  id: string;
  starterId: string;
  fedAtMs: number;
  entryZone: string;
  entryOffsetMinutes: number;
  starterTenthsGrams: number;
  flourTenthsGrams: number;
  waterTenthsGrams: number;
  flourType?: FlourType;
  temperatureTenthsC?: number;
  notes?: string;
  photo?: Photo;
  observation?: PeakObservationRecord;
  estimate: PeakEstimate;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface Photo {
  relativePath: string;
  mimeType: string;
  byteSize: number;
}

export interface PeakObservationRecord {
  observedAtMs: number;
}

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
  modelVersion: "baseline-v1";
  earliestAtMs: number;
  midpointAtMs: number;
  latestAtMs: number;
  mode: "baseline" | "widened" | "personalized";
  factors: EstimateFactor[];
  missingInputs: ("temperature" | "flour_type")[];
  personalization: {
    applied: boolean;
    validObservationCount: number;
    reason: "applied" | "not_enough_observations" | "observations_too_variable";
  };
}

export interface PeakObservation {
  predictedMidpointHours: number;
  observedElapsedHours: number;
}
