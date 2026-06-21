import React from "react";
import { act, create, type ReactTestInstance } from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { estimatePeak } from "@/domain/peak-model";
import { formatTime } from "@/domain/presentation";

vi.mock("@/ui/components/bottom-navigation.native", () => ({ BottomNavigation: () => React.createElement("Navigation", { accessibilityLabel: "Primary navigation" }) }));
vi.mock("@/ui/components/feeding-modal.native", () => ({ FeedingModal: () => null }));
vi.mock("@/ui/components/starter-modal.native", () => ({ StarterModal: () => null }));
vi.mock("@/ui/use-now", () => ({ useNow: () => Date.parse("2026-06-21T09:00:00Z") }));

const starter = { id: "11111111-1111-4111-8111-111111111111", name: "Mabel", status: "active" as const, createdAtMs: 1, updatedAtMs: 1 };
const tracking = {
  loading: false, error: null as string | null, starters: [starter], selectedStarter: starter, feedings: [] as never[],
  refresh: vi.fn(async () => undefined), clearError: vi.fn(), reactivateStarter: vi.fn(async () => undefined),
};
vi.mock("@/ui/tracking-context", () => ({ useTracking: () => tracking }));

import { TodayScreen } from "@/ui/screens/today-screen.native";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("Today screen contract", () => {
  beforeEach(() => { tracking.error = null; tracking.feedings = []; });

  it("presents one clear first-feeding action for a new starter", () => {
    const root = renderScreen();
    expect(hasText(root, "No feeding logged yet.")).toBe(true);
    expect(hasAccessible(root, "button", "Log first feeding")).toBe(true);
    expect(hasAccessible(root, undefined, "Primary navigation")).toBe(true);
  });

  it("puts the estimated interval and explanation action first after feeding", () => {
    const fedAtMs = Date.parse("2026-06-21T08:00:00Z");
    tracking.feedings = [{
      id: "22222222-2222-4222-8222-222222222222", starterId: starter.id, fedAtMs, entryZone: "UTC", entryOffsetMinutes: 0,
      starterTenthsGrams: 250, flourTenthsGrams: 500, waterTenthsGrams: 500, flourType: "white" as const, temperatureTenthsC: 240,
      reminder: { enabled: true, status: "scheduled" as const, targetAtMs: fedAtMs + 6 * 3_600_000, notificationId: "native-1", updatedAtMs: fedAtMs },
      estimate: estimatePeak({ fedAtMs, starterGrams: 25, flourGrams: 50, waterGrams: 50, flourType: "white", temperatureC: 24 }), createdAtMs: fedAtMs, updatedAtMs: fedAtMs,
    }] as never[];
    const root = renderScreen();
    expect(hasText(root, "Estimated peak")).toBe(true);
    expect(hasAccessible(root, "button", "Explain this peak window")).toBe(true);
    expect(hasAccessible(root, "button", "Manage starter")).toBe(true);
    expect(hasAccessible(root, undefined, `Peak reminder scheduled for ${formatTime(fedAtMs + 6 * 3_600_000)}`)).toBe(true);
  });

  it("keeps storage recovery actionable", () => {
    tracking.error = "Starter Clock couldn’t open local data. Try again.";
    const root = renderScreen();
    expect(root.findAll((node) => node.props.accessibilityRole === "alert").length).toBeGreaterThan(0);
    expect(hasAccessible(root, "button", "Try again")).toBe(true);
  });
});

function renderScreen() {
  let tree: ReturnType<typeof create> | undefined;
  act(() => { tree = create(<TodayScreen />); });
  return tree!.root;
}

function hasText(root: ReactTestInstance, text: string) {
  return root.findAll((node) => String(node.type) === "Text" && node.children.includes(text)).length > 0;
}

function hasAccessible(root: ReactTestInstance, role: string | undefined, label: string) {
  return root.findAll((node) => (role === undefined || node.props.accessibilityRole === role) && (node.props.accessibilityLabel === label || node.children.includes(label))).length > 0;
}
