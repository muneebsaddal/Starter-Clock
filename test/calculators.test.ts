import { describe, expect, it } from "vitest";
import { calculateFeedingRatioView, calculateHydrationView } from "@/domain/calculators";

describe("web calculator view models", () => {
  it("calculates feeding ratio and hydration from positive grams", () => {
    const result = calculateFeedingRatioView({ starter: "25", flour: "50", water: "40" });

    expect(result.ratio).toBe("1:2:1.6");
    expect(result.hydration).toBe("80%");
    expect(result.starter.error).toBeUndefined();
  });

  it("validates feeding ratio boundaries without producing stale results", () => {
    const result = calculateFeedingRatioView({ starter: "0", flour: "50", water: "40" });

    expect(result.ratio).toBeUndefined();
    expect(result.hydration).toBeUndefined();
    expect(result.starter.error).toContain("greater than 0");
  });

  it("calculates hydration from flour and water", () => {
    expect(calculateHydrationView({ flour: "80", water: "60" }).hydration).toBe("75%");
  });

  it("requires both hydration inputs", () => {
    const result = calculateHydrationView({ flour: "", water: "60" });

    expect(result.hydration).toBeUndefined();
    expect(result.flour.error).toBe("Enter flour grams.");
  });
});
