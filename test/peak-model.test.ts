import { describe, expect, it } from "vitest";
import { calculateFeedingRatio, calculateHydrationPercent, estimatePeak, type FeedingInput } from "@/domain/peak-model";

const fedAtMs = Date.parse("2026-06-21T09:00:00.000Z");
const complete: FeedingInput = { fedAtMs, starterGrams: 25, flourGrams: 50, waterGrams: 50, flourType: "white", temperatureC: 24 };
const hoursAfterFeeding = (timestamp: number) => (timestamp - fedAtMs) / 3_600_000;

describe("feeding arithmetic", () => {
  it("calculates ratio and hydration without source rounding", () => {
    expect(calculateFeedingRatio({ starterGrams: 20, flourGrams: 50, waterGrams: 40 })).toEqual({ starter: 1, flour: 2.5, water: 2 });
    expect(calculateHydrationPercent({ flourGrams: 80, waterGrams: 60 })).toBe(75);
  });
  it("rejects invalid amounts", () => {
    expect(() => calculateFeedingRatio({ starterGrams: 0, flourGrams: 50, waterGrams: 50 })).toThrow(RangeError);
    expect(() => calculateHydrationPercent({ flourGrams: -1, waterGrams: 50 })).toThrow(RangeError);
    expect(() => estimatePeak({ ...complete, waterGrams: Number.NaN })).toThrow(RangeError);
  });
});

describe("baseline peak window", () => {
  it("returns a reproducible, ordered and explained interval", () => {
    const result = estimatePeak(complete);
    expect(result.mode).toBe("baseline"); expect(result.earliestAtMs).toBeLessThan(result.midpointAtMs); expect(result.midpointAtMs).toBeLessThan(result.latestAtMs);
    expect(result.missingInputs).toEqual([]); expect(result.factors.map((factor) => factor.code)).toEqual(["feeding_ratio", "hydration", "temperature", "flour_type"]); expect(estimatePeak(complete)).toEqual(result);
  });
  it("responds monotonically to temperature, flour, ratio and hydration", () => {
    expect(estimatePeak({ ...complete, temperatureC: 18 }).midpointAtMs).toBeGreaterThan(estimatePeak({ ...complete, temperatureC: 30 }).midpointAtMs);
    expect(estimatePeak({ ...complete, flourType: "rye" }).midpointAtMs).toBeLessThan(estimatePeak(complete).midpointAtMs);
    expect(estimatePeak({ ...complete, flourType: "other" }).midpointAtMs).toBe(estimatePeak(complete).midpointAtMs);
    expect(estimatePeak({ ...complete, flourGrams: 125, waterGrams: 125 }).midpointAtMs).toBeGreaterThan(estimatePeak({ ...complete, flourGrams: 25, waterGrams: 25 }).midpointAtMs);
    expect(estimatePeak({ ...complete, waterGrams: 30 }).midpointAtMs).toBeGreaterThan(estimatePeak({ ...complete, waterGrams: 75 }).midpointAtMs);
  });
  it("widens and names missing inputs", () => {
    const { temperatureC: _, flourType: __, ...requiredOnly } = complete;
    const missing = estimatePeak(requiredOnly); const baseline = estimatePeak(complete);
    expect(missing.mode).toBe("widened"); expect(missing.missingInputs).toEqual(["temperature", "flour_type"]); expect(missing.latestAtMs - missing.earliestAtMs).toBeGreaterThan(baseline.latestAtMs - baseline.earliestAtMs);
  });
  it("widens rather than extrapolating outside calibration", () => {
    const result = estimatePeak({ ...complete, flourGrams: 1, waterGrams: 500, temperatureC: 40 });
    expect(result.factors).toContainEqual({ code: "outside_calibration", effect: "wider" }); expect(hoursAfterFeeding(result.earliestAtMs)).toBeGreaterThanOrEqual(1); expect(hoursAfterFeeding(result.latestAtMs)).toBeLessThanOrEqual(48);
  });
  it("uses absolute instants through DST and rejects invalid input", () => {
    const dst = { ...complete, fedAtMs: Date.parse("2026-03-08T06:30:00.000Z") };
    expect(estimatePeak(dst).midpointAtMs - dst.fedAtMs).toBe(estimatePeak(complete).midpointAtMs - complete.fedAtMs);
    expect(() => estimatePeak({ ...complete, fedAtMs: Infinity })).toThrow(RangeError); expect(() => estimatePeak({ ...complete, temperatureC: 81 })).toThrow(RangeError);
  });
});

describe("personalization", () => {
  const stable = Array.from({ length: 5 }, (_, index) => ({ predictedMidpointHours: 8 + index * 0.1, observedElapsedHours: 10 + index * 0.1 }));
  it("waits for five eligible observations", () => { expect(estimatePeak(complete, stable.slice(0, 4)).personalization).toMatchObject({ applied: false, validObservationCount: 4 }); });
  it("shifts without narrowing stable history", () => {
    const baseline = estimatePeak(complete); const personalized = estimatePeak(complete, stable);
    expect(personalized.mode).toBe("personalized"); expect(personalized.midpointAtMs).toBe(baseline.midpointAtMs + 2 * 3_600_000); expect(personalized.latestAtMs - personalized.earliestAtMs).toBeGreaterThanOrEqual(baseline.latestAtMs - baseline.earliestAtMs);
  });
  it("suppresses variable observations and clamps shift", () => {
    const noisy = [2, 14, 2, 14, 2, 14].map((observedElapsedHours) => ({ predictedMidpointHours: 8, observedElapsedHours }));
    expect(estimatePeak(complete, noisy).personalization.reason).toBe("observations_too_variable");
    const invalid = { predictedMidpointHours: 8, observedElapsedHours: 30 }; const large = Array.from({ length: 5 }, () => ({ predictedMidpointHours: 8, observedElapsedHours: 14 }));
    expect(estimatePeak(complete, [invalid, ...large]).midpointAtMs).toBe(estimatePeak(complete).midpointAtMs + 4 * 3_600_000);
  });
});
