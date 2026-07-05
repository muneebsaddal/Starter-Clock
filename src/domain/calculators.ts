import { calculateFeedingRatio, calculateHydrationPercent } from "./peak-model";
import { formatNumber } from "./presentation";

export interface CalculatorFieldResult {
  value: string;
  error?: string | undefined;
}

export interface FeedingRatioCalculatorResult {
  starter: CalculatorFieldResult;
  flour: CalculatorFieldResult;
  water: CalculatorFieldResult;
  ratio?: string | undefined;
  hydration?: string | undefined;
}

export interface HydrationCalculatorResult {
  flour: CalculatorFieldResult;
  water: CalculatorFieldResult;
  hydration?: string | undefined;
}

export function calculateFeedingRatioView(input: {
  starter: string;
  flour: string;
  water: string;
}): FeedingRatioCalculatorResult {
  const starter = parsePositiveGrams(input.starter, "starter");
  const flour = parsePositiveGrams(input.flour, "flour");
  const water = parsePositiveGrams(input.water, "water");
  const result: FeedingRatioCalculatorResult = {
    starter: { value: input.starter, error: starter.error },
    flour: { value: input.flour, error: flour.error },
    water: { value: input.water, error: water.error },
  };

  if (starter.value === undefined || flour.value === undefined || water.value === undefined) return result;

  const ratio = calculateFeedingRatio({ starterGrams: starter.value, flourGrams: flour.value, waterGrams: water.value });
  result.ratio = `${formatNumber(ratio.starter, 0)}:${formatNumber(ratio.flour)}:${formatNumber(ratio.water)}`;
  result.hydration = `${formatNumber(calculateHydrationPercent({ flourGrams: flour.value, waterGrams: water.value }), 1)}%`;
  return result;
}

export function calculateHydrationView(input: { flour: string; water: string }): HydrationCalculatorResult {
  const flour = parsePositiveGrams(input.flour, "flour");
  const water = parsePositiveGrams(input.water, "water");
  const result: HydrationCalculatorResult = {
    flour: { value: input.flour, error: flour.error },
    water: { value: input.water, error: water.error },
  };

  if (flour.value === undefined || water.value === undefined) return result;

  result.hydration = `${formatNumber(calculateHydrationPercent({ flourGrams: flour.value, waterGrams: water.value }), 1)}%`;
  return result;
}

function parsePositiveGrams(value: string, label: string): { value?: number; error?: string } {
  const trimmed = value.trim();
  if (trimmed.length === 0) return { error: `Enter ${label} grams.` };
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return { error: `Use a ${label} amount greater than 0 g.` };
  return { value: parsed };
}
