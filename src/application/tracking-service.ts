import type { Feeding, PeakObservation, Photo, Starter } from "@/domain/models";
import { estimatePeak } from "@/domain/peak-model";
import { feedingDraftSchema, starterNameSchema, type FeedingDraft } from "@/domain/validation";
import type { Clock, IdGenerator, PhotoStore, StarterRepository } from "./ports";
import type { ReminderService } from "./reminder-service";
import type { EntitlementService } from "./entitlement-service";

export class TrackingService {
  constructor(
    private readonly repository: StarterRepository,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    private readonly photoStore?: PhotoStore,
    private readonly reminders?: ReminderService,
    private readonly entitlements?: EntitlementService,
  ) {}

  async initialize() {
    await this.repository.initialize();
    await this.reconcileCapabilities();
  }
  async reconcileCapabilities() { await Promise.all([this.reminders?.reconcile().catch(() => undefined), this.entitlements?.refresh()]); }
  listStarters() { return this.repository.listStarters(); }
  async listFeedings(starterId: string, limit?: number) {
    const pro = (await this.getEntitlement()).level === "pro";
    return this.repository.listFeedings(starterId, pro ? limit : Math.min(limit ?? 30, 30));
  }
  getFeeding(id: string) { return this.repository.getFeeding(id); }
  getReminderDefault() { return this.repository.getReminderDefault(); }
  getSelectedStarterId() { return this.repository.getSelectedStarterId(); }
  setSelectedStarterId(id: string | null) { return this.repository.setSelectedStarterId(id); }

  async getEntitlement() {
    return this.entitlements?.getCached() ?? { productId: "starter_clock_pro_lifetime", level: "free" as const, store: "unknown" as const, lastVerifiedAtMs: null, offline: false };
  }
  async refreshEntitlement() { return this.entitlements?.refresh() ?? this.getEntitlement(); }
  async purchaseLifetime() {
    if (!this.entitlements) return { state: "failed" as const };
    return this.entitlements.purchaseLifetime();
  }
  async restorePurchases() { return this.entitlements?.restorePurchases() ?? this.getEntitlement(); }

  async createStarter(nameInput: string) {
    if ((await this.getEntitlement()).level !== "pro" && (await this.repository.listStarters("active")).length >= 1) throw new Error("FREE_STARTER_LIMIT");
    const name = starterNameSchema.parse(nameInput);
    const now = this.clock.now();
    const starter: Starter = { id: this.ids.next(), name, status: "active", createdAtMs: now, updatedAtMs: now };
    await this.repository.saveStarter(starter);
    return starter;
  }

  async renameStarter(id: string, nameInput: string) {
    const starter = await this.requireStarter(id);
    const updated = { ...starter, name: starterNameSchema.parse(nameInput), updatedAtMs: this.clock.now() };
    await this.repository.saveStarter(updated);
    return updated;
  }

  async setStarterArchived(id: string, archived: boolean) {
    const starter = await this.requireStarter(id);
    const updated: Starter = { ...starter, status: archived ? "archived" : "active", updatedAtMs: this.clock.now() };
    await this.repository.saveStarter(updated);
    return updated;
  }

  async deleteStarter(id: string) {
    const photos = (await this.repository.listFeedings(id)).flatMap((feeding) => feeding.photo ? [feeding.photo.relativePath] : []);
    await this.repository.deleteStarter(id);
    await this.removePhotosBestEffort(photos);
  }

  async saveFeeding(draftInput: FeedingDraft, id?: string) {
    const draft = feedingDraftSchema.parse(draftInput);
    await this.requireStarter(draft.starterId);
    const existing = id ? await this.repository.getFeeding(id) : null;
    const observations = await this.personalizationObservations(draft.starterId, id);
    const estimate = estimatePeak({
      fedAtMs: draft.fedAtMs,
      starterGrams: draft.starterTenthsGrams / 10,
      flourGrams: draft.flourTenthsGrams / 10,
      waterGrams: draft.waterTenthsGrams / 10,
      ...(draft.flourType === undefined ? {} : { flourType: draft.flourType }),
      ...(draft.temperatureTenthsC === undefined ? {} : { temperatureC: draft.temperatureTenthsC / 10 }),
    }, observations);
    const now = this.clock.now();
    const reminderEnabled = draft.reminderEnabled ?? await this.repository.getReminderDefault();
    const feeding: Feeding = {
      id: existing?.id ?? this.ids.next(),
      starterId: draft.starterId,
      fedAtMs: draft.fedAtMs,
      entryZone: draft.entryZone,
      entryOffsetMinutes: draft.entryOffsetMinutes,
      starterTenthsGrams: draft.starterTenthsGrams,
      flourTenthsGrams: draft.flourTenthsGrams,
      waterTenthsGrams: draft.waterTenthsGrams,
      ...(draft.flourType === undefined ? {} : { flourType: draft.flourType }),
      ...(draft.temperatureTenthsC === undefined ? {} : { temperatureTenthsC: draft.temperatureTenthsC }),
      ...(draft.notes === undefined || draft.notes.trim() === "" ? {} : { notes: draft.notes.trim() }),
      ...(existing?.photo === undefined ? {} : { photo: existing.photo }),
      ...(draft.observedAtMs === undefined ? {} : { observation: { observedAtMs: draft.observedAtMs } }),
      reminder: {
        enabled: reminderEnabled,
        status: reminderEnabled ? "pending" : "disabled",
        targetAtMs: estimate.earliestAtMs,
        ...(existing?.reminder.notificationId === undefined ? {} : { notificationId: existing.reminder.notificationId }),
        updatedAtMs: now,
      },
      estimate,
      createdAtMs: existing?.createdAtMs ?? now,
      updatedAtMs: now,
    };
    await this.repository.saveFeeding(feeding);
    await this.repository.setReminderDefault(reminderEnabled);
    if (this.reminders) {
      const starter = await this.requireStarter(feeding.starterId);
      try { await this.reminders.sync(feeding, starter.name); } catch { return feeding; }
      return (await this.repository.getFeeding(feeding.id)) ?? feeding;
    }
    return feeding;
  }

  async deleteFeeding(id: string) {
    const feeding = await this.requireFeeding(id);
    await this.repository.deleteFeeding(id);
    if (this.reminders) await this.reminders.cancel(feeding.reminder);
    await this.removePhotosBestEffort(feeding.photo ? [feeding.photo.relativePath] : []);
  }

  async recordObservedPeak(id: string, observedAtMs: number) {
    const feeding = await this.requireFeeding(id);
    if (!Number.isFinite(observedAtMs) || observedAtMs <= feeding.fedAtMs) throw new RangeError("Observed peak must be after the feeding.");
    return this.saveFeeding({ ...toDraft(feeding), observedAtMs }, id);
  }

  async attachPhoto(id: string, photo: Photo | null) {
    await this.requireFeeding(id);
    await this.repository.savePhoto(id, photo);
  }

  private async personalizationObservations(starterId: string, excludedId?: string): Promise<PeakObservation[]> {
    const feedings = await this.repository.listFeedings(starterId);
    return feedings.flatMap((feeding) => {
      if (feeding.id === excludedId || !feeding.observation) return [];
      return [{
        predictedMidpointHours: (feeding.estimate.midpointAtMs - feeding.fedAtMs) / 3_600_000,
        observedElapsedHours: (feeding.observation.observedAtMs - feeding.fedAtMs) / 3_600_000,
      }];
    });
  }

  private async requireStarter(id: string) {
    const starter = await this.repository.getStarter(id);
    if (!starter) throw new Error("STARTER_NOT_FOUND");
    return starter;
  }

  private async requireFeeding(id: string) {
    const feeding = await this.repository.getFeeding(id);
    if (!feeding) throw new Error("FEEDING_NOT_FOUND");
    return feeding;
  }

  private async removePhotosBestEffort(paths: string[]) {
    if (!this.photoStore) return;
    await Promise.all(paths.map(async (path) => { try { await this.photoStore?.remove(path); } catch { /* retryable orphan cleanup runs at startup in a later capability pass */ } }));
  }
}

export function toDraft(feeding: Feeding): FeedingDraft {
  return {
    starterId: feeding.starterId,
    fedAtMs: feeding.fedAtMs,
    entryZone: feeding.entryZone,
    entryOffsetMinutes: feeding.entryOffsetMinutes,
    starterTenthsGrams: feeding.starterTenthsGrams,
    flourTenthsGrams: feeding.flourTenthsGrams,
    waterTenthsGrams: feeding.waterTenthsGrams,
    ...(feeding.flourType === undefined ? {} : { flourType: feeding.flourType }),
    ...(feeding.temperatureTenthsC === undefined ? {} : { temperatureTenthsC: feeding.temperatureTenthsC }),
    ...(feeding.notes === undefined ? {} : { notes: feeding.notes }),
    ...(feeding.observation === undefined ? {} : { observedAtMs: feeding.observation.observedAtMs }),
    reminderEnabled: feeding.reminder.enabled,
  };
}
