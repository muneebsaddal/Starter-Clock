import { describe, expect, it } from "vitest";
import { calculateFeedingRatio, calculateHydrationPercent, estimatePeak, type FeedingInput } from "../src/peak-model.js";

const fedAtMs = Date.parse("2026-06-21T09:00:00.000Z");
const complete: FeedingInput = {
  fedAtMs,
  starterGrams: 25,
  flourGrams: 50,
  waterGrams: 50,
  flourType: "white",
  temperatureC: 24,
};

const hoursAfterFeeding = (timestamp: number) => (timestamp - fedAtMs) / 3_600_000;

describe("feeding arithmetic", () => {
  it("calculates an unrounded starter:flour:water ratio", () => {
    expect(calculateFeedingRatio({ starterGrams: 20, flourGrams: 50, waterGrams: 40 })).toEqual({ starter: 1, flour: 2.5, water: 2 });
  });

  it("calculates hydration from water divided by flour", () => {
    expect(calculateHydrationPercent({ flourGrams: 80, waterGrams: 60 })).toBe(75);
  });

  it("rejects zero, negative, and non-finite amounts", () => {
    expect(() => calculateFeedingRatio({ starterGrams: 0, flourGrams: 50, waterGrams: 50 })).toThrow(RangeError);
    expect(() => calculateHydrationPercent({ flourGrams: -1, waterGrams: 50 })).toThrow(RangeError);
    expect(() => estimatePeak({ ...complete, waterGrams: Number.NaN })).toThrow(RangeError);
  });
});

describe("baseline peak window", () => {
  it("returns a reproducible ordered interval and explainable factors", () => {
    const result = estimatePeak(complete);
    expect(result.mode).toBe("baseline");
    expect(result.earliestAtMs).toBeLessThan(result.midpointAtMs);
    expect(result.midpointAtMs).toBeLessThan(result.latestAtMs);
    expect(result.missingInputs).toEqual([]);
    expect(result.factors.map((factor) => factor.code)).toEqual(["feeding_ratio", "hydration", "temperature", "flour_type"]);
    expect(estimatePeak(complete)).toEqual(result);
  });

  it("moves a colder feeding later than a warmer feeding", () => {
    const cold = estimatePeak({ ...complete, temperatureC: 18 });
    const warm = estimatePeak({ ...complete, temperatureC: 30 });
    expect(cold.midpointAtMs).toBeGreaterThan(warm.midpointAtMs);
  });

  it("moves rye earlier than white while treating other as neutral", () => {
    expect(estimatePeak({ ...complete, flourType: "rye" }).midpointAtMs).toBeLessThan(estimatePeak(complete).midpointAtMs);
    expect(estimatePeak({ ...complete, flourType: "other" }).midpointAtMs).toBe(estimatePeak(complete).midpointAtMs);
  });

  it("responds monotonically to common feeding ratios", () => {
    const oneToOne = estimatePeak({ ...complete, flourGrams: 25, waterGrams: 25 });
    const oneToFive = estimatePeak({ ...complete, flourGrams: 125, waterGrams: 125 });
    expect(oneToFive.midpointAtMs).toBeGreaterThan(oneToOne.midpointAtMs);
  });

  it("applies a bounded hydration effect", () => {
    const stiff = estimatePeak({ ...complete, waterGrams: 30 });
    const liquid = estimatePeak({ ...complete, waterGrams: 75 });
    expect(stiff.midpointAtMs).toBeGreaterThan(liquid.midpointAtMs);
  });

  it("widens the interval and names missing optional inputs", () => {
    const baseline = estimatePeak(complete);
    const { temperatureC: _temperatureC, flourType: _flourType, ...requiredOnly } = complete;
    const missing = estimatePeak(requiredOnly);
    expect(missing.mode).toBe("widened");
    expect(missing.missingInputs).toEqual(["temperature", "flour_type"]);
    expect(missing.latestAtMs - missing.earliestAtMs).toBeGreaterThan(baseline.latestAtMs - baseline.earliestAtMs);
  });

  it("widens rather than extrapolating outside calibrated ranges", () => {
    const result = estimatePeak({ ...complete, flourGrams: 1, waterGrams: 500, temperatureC: 40 });
    expect(result.mode).toBe("widened");
    expect(result.factors).toContainEqual({ code: "outside_calibration", effect: "wider" });
    expect(hoursAfterFeeding(result.earliestAtMs)).toBeGreaterThanOrEqual(1);
    expect(hoursAfterFeeding(result.latestAtMs)).toBeLessThanOrEqual(48);
  });

  it("uses absolute instants across a daylight-saving transition", () => {
    const dstFeeding = { ...complete, fedAtMs: Date.parse("2026-03-08T06:30:00.000Z") };
    const result = estimatePeak(dstFeeding);
    expect(result.midpointAtMs - dstFeeding.fedAtMs).toBe(estimatePeak(complete).midpointAtMs - complete.fedAtMs);
  });

  it("rejects invalid timestamps and impossible recorded temperatures", () => {
    expect(() => estimatePeak({ ...complete, fedAtMs: Number.POSITIVE_INFINITY })).toThrow(RangeError);
    expect(() => estimatePeak({ ...complete, temperatureC: 81 })).toThrow(RangeError);
  });
});

describe("personalization boundary", () => {
  const stable = Array.from({ length: 5 }, (_, index) => ({ predictedMidpointHours: 8 + index * 0.1, observedElapsedHours: 10 + index * 0.1 }));

  it("does not personalize before five valid observations", () => {
    const result = estimatePeak(complete, stable.slice(0, 4));
    expect(result.personalization).toMatchObject({ applied: false, validObservationCount: 4, reason: "not_enough_observations" });
  });

  it("shifts but does not narrow the window for stable history", () => {
    const baseline = estimatePeak(complete);
    const personalized = estimatePeak(complete, stable);
    expect(personalized.mode).toBe("personalized");
    expect(personalized.midpointAtMs).toBe(baseline.midpointAtMs + 2 * 3_600_000);
    expect(personalized.latestAtMs - personalized.earliestAtMs).toBeGreaterThanOrEqual(baseline.latestAtMs - baseline.earliestAtMs);
  });

  it("suppresses personalization when observations are too variable", () => {
    const noisy = [2, 14, 2, 14, 2, 14].map((observedElapsedHours) => ({ predictedMidpointHours: 8, observedElapsedHours }));
    const result = estimatePeak(complete, noisy);
    expect(result.personalization).toMatchObject({ applied: false, reason: "observations_too_variable" });
  });

  it("ignores invalid observations and clamps the learned shift", () => {
    const invalid = { predictedMidpointHours: 8, observedElapsedHours: 30 };
    const largeStable = Array.from({ length: 5 }, () => ({ predictedMidpointHours: 8, observedElapsedHours: 14 }));
    const result = estimatePeak(complete, [invalid, ...largeStable]);
    expect(result.personalization.validObservationCount).toBe(5);
    expect(result.midpointAtMs).toBe(estimatePeak(complete).midpointAtMs + 4 * 3_600_000);
  });
});
