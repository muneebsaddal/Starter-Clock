import type { EntitlementCache } from "@/domain/models";
import type { Clock, PurchasePort, StarterRepository, StorePurchaseResult } from "./ports";

export const LIFETIME_PRO_PRODUCT_ID = "starter_clock_pro_lifetime";

export interface EntitlementSnapshot extends EntitlementCache { offline: boolean }

export class EntitlementService {
  constructor(
    private readonly repository: StarterRepository,
    private readonly purchases: PurchasePort,
    private readonly clock: Clock,
  ) {}

  async getCached(): Promise<EntitlementSnapshot> {
    return { ...(await this.repository.getEntitlementCache()), offline: false };
  }

  async refresh(): Promise<EntitlementSnapshot> {
    const cached = await this.repository.getEntitlementCache();
    try {
      const current = await this.purchases.getEntitlement();
      const verified: EntitlementCache = { productId: LIFETIME_PRO_PRODUCT_ID, level: current.level, store: current.store, lastVerifiedAtMs: this.clock.now() };
      await this.repository.saveEntitlementCache(verified);
      return { ...verified, offline: false };
    } catch {
      return { ...cached, offline: true };
    }
  }

  async purchaseLifetime(): Promise<StorePurchaseResult> {
    const result = await this.purchases.purchaseLifetime();
    if (result.state === "purchased") {
      await this.repository.saveEntitlementCache({ productId: LIFETIME_PRO_PRODUCT_ID, level: "pro", store: result.store, lastVerifiedAtMs: this.clock.now() });
    }
    return result;
  }

  restorePurchases(): Promise<EntitlementSnapshot> { return this.refresh(); }
}
