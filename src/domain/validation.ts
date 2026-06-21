import { z } from "zod";

export const starterNameSchema = z.string().trim().min(1, "Enter a name for your starter.").max(40, "Use 40 characters or fewer.");

const positiveTenths = z.number().int().positive();

export const feedingDraftSchema = z.object({
  starterId: z.uuid(),
  fedAtMs: z.number().int().finite(),
  entryZone: z.string().min(1),
  entryOffsetMinutes: z.number().int().min(-840).max(840),
  starterTenthsGrams: positiveTenths,
  flourTenthsGrams: positiveTenths,
  waterTenthsGrams: positiveTenths,
  flourType: z.enum(["white", "whole_wheat", "rye", "blend", "other"]).optional(),
  temperatureTenthsC: z.number().int().min(-500).max(800).optional(),
  notes: z.string().max(500).optional(),
  observedAtMs: z.number().int().finite().optional(),
});

export type FeedingDraft = z.infer<typeof feedingDraftSchema>;

export function gramsToTenths(value: string): number {
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed) || parsed <= 0) throw new RangeError("Enter an amount greater than 0 g.");
  return Math.round(parsed * 10);
}
