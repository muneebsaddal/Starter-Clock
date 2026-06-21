import type { Feeding, PeakObservation, Photo, Starter } from "@/domain/models";
import { estimatePeak } from "@/domain/peak-model";
import { feedingDraftSchema, starterNameSchema, type FeedingDraft } from "@/domain/validation";
import type { Clock, IdGenerator, PhotoStore, StarterRepository } from "./ports";

export class TrackingService {
  constructor(
    private readonly repository: StarterRepository,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    private readonly photoStore?: PhotoStore,
  ) {}

  initialize() { return this.repository.initialize(); }
  listStarters() { return this.repository.listStarters(); }
  listFeedings(starterId: string, limit = 30) { return this.repository.listFeedings(starterId, limit); }
  getFeeding(id: string) { return this.repository.getFeeding(id); }

  async createStarter(nameInput: string) {
    if ((await this.repository.listStarters("active")).length >= 1) throw new Error("FREE_STARTER_LIMIT");
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
      estimate,
      createdAtMs: existing?.createdAtMs ?? now,
      updatedAtMs: now,
    };
    await this.repository.saveFeeding(feeding);
    return feeding;
  }

  async deleteFeeding(id: string) {
    const feeding = await this.requireFeeding(id);
    await this.repository.deleteFeeding(id);
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
  };
}
