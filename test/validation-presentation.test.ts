import { describe, expect, it } from "vitest";
import { gramsToTenths, starterNameSchema } from "@/domain/validation";
import { describePeakState, formatHydration, formatPeakWindow, formatRatio, peakState } from "@/domain/presentation";
import { estimatePeak } from "@/domain/peak-model";

describe("boundary validation", () => {
  it("normalizes names and exact tenths", () => { expect(starterNameSchema.parse("  Mabel  ")).toBe("Mabel"); expect(gramsToTenths("12.34")).toBe(123); });
  it("rejects empty, long and invalid quantities", () => { expect(() => starterNameSchema.parse("   ")).toThrow(); expect(() => starterNameSchema.parse("x".repeat(41))).toThrow(); expect(() => gramsToTenths("0")).toThrow(); expect(() => gramsToTenths("nope")).toThrow(); });
});

describe("localized presentation", () => {
  const fedAt = Date.parse("2026-06-21T08:00:00Z"); const estimate = estimatePeak({ fedAtMs: fedAt, starterGrams: 25, flourGrams: 50, waterGrams: 50, flourType: "white", temperatureC: 24 });
  it("derives before, in and past states from absolute instants", () => { expect(peakState(estimate, fedAt)).toBe("before"); expect(peakState(estimate, estimate.midpointAtMs)).toBe("in_window"); expect(peakState(estimate, estimate.latestAtMs + 1)).toBe("past"); });
  it("describes timing without false precision", () => { expect(describePeakState(estimate, "Mabel", fedAt).label).toBe("Before peak window"); expect(describePeakState(estimate, "Mabel", estimate.midpointAtMs).detail).toContain("may be near peak"); expect(describePeakState(estimate, "Mabel", estimate.latestAtMs + 3_600_000).detail).toContain("ended about"); });
  it("formats derived values only for display", () => { expect(formatRatio({ starterTenthsGrams: 200, flourTenthsGrams: 500, waterTenthsGrams: 400 })).toContain("1:2.5:2"); expect(formatHydration({ flourTenthsGrams: 800, waterTenthsGrams: 600 })).toBe("75%"); expect(formatPeakWindow(estimate, fedAt)).toMatch(/Today/); });
});
