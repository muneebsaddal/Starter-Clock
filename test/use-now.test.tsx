import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNow } from "@/ui/use-now";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("useNow", () => {
  let tree: ReactTestRenderer | undefined;

  afterEach(() => {
    act(() => tree?.unmount());
    tree = undefined;
    vi.useRealTimers();
  });

  it("keeps a stable snapshot between minute ticks", () => {
    vi.useFakeTimers();
    vi.setSystemTime("2026-06-22T10:00:00Z");
    const snapshots: number[] = [];

    function Probe() {
      snapshots.push(useNow());
      return null;
    }

    act(() => { tree = create(<Probe />); });
    expect(snapshots).toEqual([Date.parse("2026-06-22T10:00:00Z")]);

    vi.setSystemTime("2026-06-22T10:01:00Z");
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(snapshots.at(-1)).toBe(Date.parse("2026-06-22T10:02:00Z"));
    expect(snapshots).toHaveLength(2);
  });
});
