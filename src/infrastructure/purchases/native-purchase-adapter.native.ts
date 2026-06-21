import { Platform } from "react-native";
import {
  ErrorCode,
  endConnection,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  type EventSubscription,
  type Purchase,
  type PurchaseError,
} from "react-native-iap";
import type { PurchasePort, StorePurchaseResult } from "@/application/ports";
import { LIFETIME_PRO_PRODUCT_ID } from "@/application/entitlement-service";
import { z } from "zod";

const ownedPurchaseSchema = z.object({ productId: z.literal(LIFETIME_PRO_PRODUCT_ID), purchaseState: z.literal("purchased") });
const purchaseUpdateSchema = z.object({ productId: z.literal(LIFETIME_PRO_PRODUCT_ID), purchaseState: z.enum(["pending", "purchased", "unknown"]) });

export class NativePurchaseAdapter implements PurchasePort {
  private connected = false;
  private updateSubscription: EventSubscription | null = null;
  private errorSubscription: EventSubscription | null = null;
  private pending: { resolve(result: StorePurchaseResult): void; timer: ReturnType<typeof setTimeout> } | null = null;

  async getEntitlement() {
    await this.connect();
    const purchases = await getAvailablePurchases({ onlyIncludeActiveItemsIOS: true });
    const purchase = purchases.find((item) => ownedPurchaseSchema.safeParse(item).success);
    if (purchase) await this.finish(purchase);
    return { level: purchase ? "pro" as const : "free" as const, store: platformStore() };
  }

  async purchaseLifetime(): Promise<StorePurchaseResult> {
    try { await this.connect(); } catch { return { state: "failed" }; }
    let products: Awaited<ReturnType<typeof fetchProducts>>;
    try { products = await fetchProducts({ skus: [LIFETIME_PRO_PRODUCT_ID], type: "in-app" }); } catch { return { state: "failed" }; }
    if (!products?.some((product) => product.id === LIFETIME_PRO_PRODUCT_ID)) return { state: "failed" };
    if (this.pending) return { state: "failed" };
    const result = new Promise<StorePurchaseResult>((resolve) => {
      const timer = setTimeout(() => this.settle({ state: "pending" }), 90_000);
      this.pending = { resolve, timer };
    });
    try {
      await requestPurchase({ type: "in-app", request: { apple: { sku: LIFETIME_PRO_PRODUCT_ID }, google: { skus: [LIFETIME_PRO_PRODUCT_ID] } } });
    } catch (error) {
      this.handleError(error as PurchaseError);
    }
    return result;
  }

  async disconnect() {
    this.updateSubscription?.remove(); this.errorSubscription?.remove();
    this.updateSubscription = null; this.errorSubscription = null;
    if (this.connected) await endConnection();
    this.connected = false;
  }

  private async connect() {
    if (this.connected) return;
    await initConnection();
    this.updateSubscription = purchaseUpdatedListener((purchase) => { void this.handlePurchase(purchase); });
    this.errorSubscription = purchaseErrorListener((error) => this.handleError(error));
    this.connected = true;
  }

  private async handlePurchase(purchase: Purchase) {
    const parsed = purchaseUpdateSchema.safeParse(purchase);
    if (!parsed.success) { if (purchase.productId === LIFETIME_PRO_PRODUCT_ID) this.settle({ state: "failed" }); return; }
    if (parsed.data.purchaseState === "pending") { this.settle({ state: "pending" }); return; }
    if (parsed.data.purchaseState !== "purchased") { this.settle({ state: "failed" }); return; }
    try {
      await this.finish(purchase);
      this.settle({ state: "purchased", store: platformStore() });
    } catch { this.settle({ state: "failed" }); }
  }

  private finish(purchase: Purchase) { return finishTransaction({ purchase, isConsumable: false }); }

  private handleError(error: PurchaseError) {
    if (error.code === ErrorCode.UserCancelled) this.settle({ state: "cancelled" });
    else if (error.code === ErrorCode.Pending || error.code === ErrorCode.DeferredPayment) this.settle({ state: "pending" });
    else this.settle({ state: "failed" });
  }

  private settle(result: StorePurchaseResult) {
    if (!this.pending) return;
    clearTimeout(this.pending.timer);
    const { resolve } = this.pending;
    this.pending = null;
    resolve(result);
  }
}

function platformStore() { return Platform.OS === "ios" ? "ios" as const : Platform.OS === "android" ? "android" as const : "unknown" as const; }
