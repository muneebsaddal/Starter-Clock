import React from "react";
import { act, create, type ReactTestInstance } from "react-test-renderer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { estimatePeak } from "@/domain/peak-model";

vi.mock("@/ui/components/bottom-navigation.native", () => ({ BottomNavigation: () => React.createElement("Navigation", { accessibilityLabel: "Primary navigation" }) }));
vi.mock("@/ui/components/feeding-modal.native", () => ({ FeedingModal: () => null }));
vi.mock("@/ui/components/pro-modal.native", () => ({ ProModal: () => null }));
vi.mock("@/ui/use-now", () => ({ useNow: () => Date.parse("2026-06-21T09:00:00Z") }));

const fedAtMs = Date.parse("2026-06-21T08:00:00Z");
const starter = { id: "11111111-1111-4111-8111-111111111111", name: "Mabel", status: "active" as const, createdAtMs: 1, updatedAtMs: 1 };
const feeding = {
  id: "22222222-2222-4222-8222-222222222222", starterId: starter.id, fedAtMs, entryZone: "UTC", entryOffsetMinutes: 0,
  starterTenthsGrams: 250, flourTenthsGrams: 500, waterTenthsGrams: 500, flourType: "white" as const, temperatureTenthsC: 240,
  reminder: { enabled: true, status: "pending" as const, targetAtMs: fedAtMs + 6 * 3_600_000, updatedAtMs: fedAtMs },
  estimate: estimatePeak({ fedAtMs, starterGrams: 25, flourGrams: 50, waterGrams: 50, flourType: "white", temperatureC: 24 }), createdAtMs: fedAtMs, updatedAtMs: fedAtMs,
};
const tracking = {
  selectedStarter: starter,
  feedings: [] as typeof feeding[],
  entitlement: { level: "free" as "free" | "pro" },
  hasMoreFeedings: false,
  loadingMoreFeedings: false,
  loadMoreFeedings: vi.fn(async () => undefined),
};
vi.mock("@/ui/tracking-context", () => ({ useTracking: () => tracking }));

import { HistoryScreen } from "@/ui/screens/history-screen.native";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("History screen contract", () => {
  beforeEach(() => {
    tracking.feedings = [];
    tracking.entitlement.level = "free";
    tracking.hasMoreFeedings = false;
    tracking.loadingMoreFeedings = false;
    tracking.loadMoreFeedings.mockClear();
  });

  it("keeps the empty and Free boundary inside a virtualized list", () => {
    const root = renderScreen();
    expect(root.findAll((node) => String(node.type) === "SectionList")).toHaveLength(1);
    expect(hasText(root, "No feedings yet.")).toBe(true);
    expect(hasText(root, "Showing the 30 most recent feedings on Free. Unlock complete retained history.")).toBe(true);
  });

  it("renders an accessible row and loads the next Pro page near the end", async () => {
    tracking.feedings = [feeding];
    tracking.entitlement.level = "pro";
    tracking.hasMoreFeedings = true;
    const root = renderScreen();
    expect(root.findAll((node) => String(node.type) === "Pressable" && node.props.accessibilityLabel?.startsWith("Open feeding from"))).toHaveLength(1);
    await act(async () => { root.find((node) => String(node.type) === "SectionList").props.onEndReached(); });
    expect(tracking.loadMoreFeedings).toHaveBeenCalledOnce();
  });
});

function renderScreen() {
  let tree: ReturnType<typeof create> | undefined;
  act(() => { tree = create(<HistoryScreen />); });
  return tree!.root;
}

function hasText(root: ReactTestInstance, text: string) {
  return root.findAll((node) => String(node.type) === "Text" && node.children.includes(text)).length > 0;
}
