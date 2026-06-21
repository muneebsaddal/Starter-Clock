import type { Feeding, PeakEstimate } from "./models";

export type PeakState = "before" | "in_window" | "past";

export function peakState(estimate: PeakEstimate, nowMs: number): PeakState {
  if (nowMs < estimate.earliestAtMs) return "before";
  if (nowMs <= estimate.latestAtMs) return "in_window";
  return "past";
}

export function formatRatio(feeding: Pick<Feeding, "starterTenthsGrams" | "flourTenthsGrams" | "waterTenthsGrams">) {
  const starter = feeding.starterTenthsGrams;
  return `1:${formatNumber(feeding.flourTenthsGrams / starter)}:${formatNumber(feeding.waterTenthsGrams / starter)}`;
}

export function formatHydration(feeding: Pick<Feeding, "flourTenthsGrams" | "waterTenthsGrams">) {
  return `${formatNumber((feeding.waterTenthsGrams / feeding.flourTenthsGrams) * 100, 1)}%`;
}

export function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(value);
}

export function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(timestamp);
}

export function formatPeakWindow(estimate: PeakEstimate, nowMs: number) {
  const sameDay = new Date(estimate.earliestAtMs).toDateString() === new Date(nowMs).toDateString();
  const date = sameDay ? "Today" : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(estimate.earliestAtMs);
  return `${date}, ${formatTime(estimate.earliestAtMs)}–${formatTime(estimate.latestAtMs)}`;
}

export function describePeakState(estimate: PeakEstimate, starterName: string, nowMs: number) {
  const state = peakState(estimate, nowMs);
  if (state === "in_window") return { label: "In peak window", detail: `${starterName} may be near peak now` };
  const anchor = state === "before" ? estimate.earliestAtMs : estimate.latestAtMs;
  const minutes = Math.max(1, Math.round(Math.abs(anchor - nowMs) / 60_000));
  const duration = minutes >= 60 ? `${Math.floor(minutes / 60)} hr ${minutes % 60} min` : `${minutes} min`;
  return state === "before"
    ? { label: "Before peak window", detail: `Starts in about ${duration}` }
    : { label: "Past peak window", detail: `Window ended about ${duration} ago` };
}
