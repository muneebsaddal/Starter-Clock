import { describe, expect, it, vi } from "vitest";
import { EntitlementService } from "@/application/entitlement-service";
import type { PurchasePort, StarterRepository, StorePurchaseResult } from "@/application/ports";
import type { EntitlementCache } from "@/domain/models";

const now = Date.parse("2026-06-22T08:00:00Z");
function setup(result: StorePurchaseResult = { state: "purchased", store: "ios" }) {
  let cache: EntitlementCache = { productId: "starter_clock_pro_lifetime", level: "free", store: "unknown", lastVerifiedAtMs: null };
  const repository = { getEntitlementCache: vi.fn(async () => cache), saveEntitlementCache: vi.fn(async (next: EntitlementCache) => { cache = next; }) } as unknown as StarterRepository;
  const purchases: PurchasePort = { getEntitlement: vi.fn(async () => ({ level: "free" as const, store: "ios" as const })), purchaseLifetime: vi.fn(async () => result) };
  return { service: new EntitlementService(repository, purchases, { now: () => now }), purchases, getCache: () => cache, setCache: (next: EntitlementCache) => { cache = next; } };
}

describe("lifetime entitlement policy", () => {
  it("unlocks only after a completed store purchase", async () => {
    const test = setup(); expect(await test.service.purchaseLifetime()).toMatchObject({ state: "purchased" }); expect(test.getCache()).toMatchObject({ level: "pro", store: "ios", lastVerifiedAtMs: now });
    const pending = setup({ state: "pending" }); await pending.service.purchaseLifetime(); expect(pending.getCache().level).toBe("free");
  });
  it.each(["cancelled", "failed"] as const)("does not unlock after %s", async (state) => {
    const test = setup({ state }); await test.service.purchaseLifetime(); expect(test.getCache().level).toBe("free");
  });
  it("uses the last verified cache when the store is offline", async () => {
    const test = setup(); test.setCache({ productId: "starter_clock_pro_lifetime", level: "pro", store: "ios", lastVerifiedAtMs: now - 1 }); vi.mocked(test.purchases.getEntitlement).mockRejectedValue(new Error("offline"));
    await expect(test.service.refresh()).resolves.toMatchObject({ level: "pro", offline: true });
  });
  it("applies loss or restore only after a successful store refresh", async () => {
    const test = setup(); vi.mocked(test.purchases.getEntitlement).mockResolvedValue({ level: "pro", store: "ios" });
    await expect(test.service.restorePurchases()).resolves.toMatchObject({ level: "pro", offline: false });
    vi.mocked(test.purchases.getEntitlement).mockResolvedValue({ level: "free", store: "ios" });
    await expect(test.service.refresh()).resolves.toMatchObject({ level: "free" });
  });
});
