import { beforeEach, describe, expect, it } from "vitest";
import { TrackingService } from "@/application/tracking-service";
import { SQLiteStarterRepository } from "@/infrastructure/db/sqlite-repository";
import { NodeDatabase } from "./helpers/node-database";
import type { EntitlementService } from "@/application/entitlement-service";
import type { Reminder } from "@/domain/models";

const ids = ["11111111-1111-4111-8111-111111111111", "22222222-2222-4222-8222-222222222222", "33333333-3333-4333-8333-333333333333", "44444444-4444-4444-8444-444444444444", "55555555-5555-4555-8555-555555555555", "66666666-6666-4666-8666-666666666666", "77777777-7777-4777-8777-777777777777"];
const now = Date.parse("2026-06-21T08:00:00Z");

describe("tracking application service", () => {
  let db: NodeDatabase; let service: TrackingService; let nextId: number;
  beforeEach(async () => { db = new NodeDatabase(); nextId = 0; service = new TrackingService(new SQLiteStarterRepository(db, () => now), { now: () => now }, { next: () => ids[nextId++]! }); await service.initialize(); });
  const draft = (starterId: string) => ({ starterId, fedAtMs: now, entryZone: "UTC", entryOffsetMinutes: 0, starterTenthsGrams: 250, flourTenthsGrams: 500, waterTenthsGrams: 500, flourType: "white" as const, temperatureTenthsC: 240 });

  it("creates, trims, renames, archives and deletes a starter", async () => {
    const starter = await service.createStarter("  Mabel "); expect(starter.name).toBe("Mabel");
    expect((await service.renameStarter(starter.id, "Audrey")).name).toBe("Audrey"); expect((await service.setStarterArchived(starter.id, true)).status).toBe("archived");
    await service.deleteStarter(starter.id); expect(await service.listStarters()).toEqual([]);
  });

  it("enforces one active starter on Free", async () => {
    const starter = await service.createStarter("Mabel");
    await expect(service.createStarter("Audrey")).rejects.toThrow("FREE_STARTER_LIMIT");
    await service.setStarterArchived(starter.id, true);
    await expect(service.createStarter("Audrey")).resolves.toMatchObject({ name: "Audrey" });
  });

  it("unlocks multiple active starters only for a verified Pro cache", async () => {
    const proDb = new NodeDatabase(); const repository = new SQLiteStarterRepository(proDb, () => now);
    const proEntitlement = { getCached: async () => ({ productId: "starter_clock_pro_lifetime", level: "pro" as const, store: "ios" as const, lastVerifiedAtMs: now, offline: false }), refresh: async () => ({ productId: "starter_clock_pro_lifetime", level: "pro" as const, store: "ios" as const, lastVerifiedAtMs: now, offline: false }) } as EntitlementService;
    const proService = new TrackingService(repository, { now: () => now }, { next: () => ids[nextId++]! }, undefined, undefined, proEntitlement);
    await proService.initialize(); await proService.createStarter("Mabel"); await expect(proService.createStarter("Audrey")).resolves.toMatchObject({ name: "Audrey" }); proDb.close();
  });

  it("creates and edits a feeding while retaining the original creation time", async () => {
    const starter = await service.createStarter("Mabel"); const feeding = await service.saveFeeding(draft(starter.id));
    const edited = await service.saveFeeding({ ...draft(starter.id), flourTenthsGrams: 750, notes: "  airy  " }, feeding.id);
    expect(edited).toMatchObject({ id: feeding.id, flourTenthsGrams: 750, notes: "airy", createdAtMs: feeding.createdAtMs });
  });

  it("records and removes associated data", async () => {
    const starter = await service.createStarter("Mabel"); const feeding = await service.saveFeeding(draft(starter.id));
    await service.recordObservedPeak(feeding.id, now + 8 * 3_600_000); expect((await service.getFeeding(feeding.id))?.observation).toBeDefined();
    await service.attachPhoto(feeding.id, { relativePath: "one.jpg", mimeType: "image/jpeg", byteSize: 12 }); expect((await service.getFeeding(feeding.id))?.photo).toBeDefined();
    await service.deleteFeeding(feeding.id); expect(await service.getFeeding(feeding.id)).toBeNull();
  });

  it("exports and deletes all local data while cleaning optional capability state", async () => {
    const removedPhotos: string[] = [];
    const cancelledReminders: string[] = [];
    const repository = new SQLiteStarterRepository(db, () => now);
    service = new TrackingService(
      repository,
      { now: () => now },
      { next: () => ids[nextId++]! },
      {
        select: async () => null,
        stage: async () => ({ temporaryPath: "tmp", finalPath: "photo.jpg" }),
        commit: async () => ({ relativePath: "photo.jpg", mimeType: "image/jpeg", byteSize: 12 }),
        remove: async (path) => { removedPhotos.push(path); },
      },
      {
        cancel: async (reminder: Reminder) => { if (reminder.notificationId) cancelledReminders.push(reminder.notificationId); },
        reconcile: async () => undefined,
        sync: async () => undefined,
      } as never,
    );
    const starter = await service.createStarter("Mabel");
    const feeding = await service.saveFeeding(draft(starter.id));
    await repository.updateReminder(feeding.id, { ...feeding.reminder, status: "scheduled", notificationId: "native-1" });
    await service.attachPhoto(feeding.id, { relativePath: "photo.jpg", mimeType: "image/jpeg", byteSize: 12 });

    const exported = await service.exportData();
    expect(exported.feedings[0]?.photo?.relativePath).toBe("photo.jpg");
    expect("notificationId" in (exported.feedings[0]?.reminder ?? {})).toBe(false);

    await service.deleteAllData();
    expect(await service.listStarters()).toEqual([]);
    expect(cancelledReminders).toEqual(["native-1"]);
    expect(removedPhotos).toEqual(["photo.jpg"]);
  });

  it("uses five stable observations before personalizing", async () => {
    const starter = await service.createStarter("Mabel");
    for (let index = 0; index < 5; index += 1) { const feeding = await service.saveFeeding({ ...draft(starter.id), fedAtMs: now + index * 86_400_000 }); await service.recordObservedPeak(feeding.id, feeding.estimate.midpointAtMs + 2 * 3_600_000); }
    const personalized = await service.saveFeeding({ ...draft(starter.id), fedAtMs: now + 6 * 86_400_000 }); expect(personalized.estimate.personalization.applied).toBe(true);
  });

  it("rejects missing records and invalid observations", async () => {
    await expect(service.saveFeeding(draft(ids[0]!))).rejects.toThrow("STARTER_NOT_FOUND");
    await expect(service.renameStarter(ids[0]!, "Nope")).rejects.toThrow("STARTER_NOT_FOUND");
    const starter = await service.createStarter("Mabel"); const feeding = await service.saveFeeding(draft(starter.id));
    await expect(service.recordObservedPeak(feeding.id, now - 1)).rejects.toThrow(); await expect(service.recordObservedPeak(ids[6]!, now + 1)).rejects.toThrow("FEEDING_NOT_FOUND");
  });
});
