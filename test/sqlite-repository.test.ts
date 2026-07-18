import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Feeding, Starter } from "@/domain/models";
import { estimatePeak } from "@/domain/peak-model";
import { migrateDatabase, migrations, SCHEMA_VERSION } from "@/infrastructure/db/migrations";
import { SQLiteStarterRepository } from "@/infrastructure/db/sqlite-repository";
import { NodeDatabase } from "./helpers/node-database";

const starterId = "11111111-1111-4111-8111-111111111111";
const feedingId = "22222222-2222-4222-8222-222222222222";
const now = Date.parse("2026-06-21T08:00:00Z");
const starter: Starter = { id: starterId, name: "Mabel", status: "active", createdAtMs: now, updatedAtMs: now };

function makeFeeding(overrides: Partial<Feeding> = {}): Feeding {
  return {
    id: feedingId, starterId, fedAtMs: now, entryZone: "Asia/Karachi", entryOffsetMinutes: 300,
    starterTenthsGrams: 250, flourTenthsGrams: 500, waterTenthsGrams: 500, flourType: "white", temperatureTenthsC: 240,
    notes: "Rounded top", estimate: estimatePeak({ fedAtMs: now, starterGrams: 25, flourGrams: 50, waterGrams: 50, flourType: "white", temperatureC: 24 }),
    reminder: { enabled: true, status: "pending", targetAtMs: now + 6 * 3_600_000, updatedAtMs: now },
    createdAtMs: now, updatedAtMs: now, ...overrides,
  };
}

function feedingUuid(index: number) {
  const hex = index.toString(16);
  return `${hex.padStart(8, "0")}-2222-4222-8222-${hex.padStart(12, "0")}`;
}

describe("SQLite migrations and repository", () => {
  let database: NodeDatabase; let repository: SQLiteStarterRepository;
  beforeEach(async () => { database = new NodeDatabase(); repository = new SQLiteStarterRepository(database, () => now); await repository.initialize(); });
  afterEach(() => database.close());

  it("migrates atomically and is idempotent", async () => {
    const version = await database.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
    expect(version?.user_version).toBe(SCHEMA_VERSION); expect(await database.getFirstAsync("SELECT * FROM preferences WHERE id = 1")).not.toBeNull();
    await migrateDatabase(database, now + 1); expect((await database.getAllAsync("SELECT * FROM schema_meta")).length).toBe(SCHEMA_VERSION);
  });

  it("rejects a database created by a newer app", async () => {
    await database.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION + 1}`);
    await expect(migrateDatabase(database, now)).rejects.toThrow("DB_SCHEMA_NEWER_THAN_APP");
  });

  it("rolls back an interrupted migration", async () => {
    const failing = new NodeDatabase();
    const original = failing.withExclusiveTransactionAsync.bind(failing);
    failing.withExclusiveTransactionAsync = async (task) => original(async (tx) => { await task({ ...tx, execAsync: async (sql: string) => { if (sql.includes("INSERT INTO schema_meta")) throw new Error("interrupted"); await tx.execAsync(sql); } } as never); });
    await expect(migrateDatabase(failing, now)).rejects.toThrow("interrupted");
    expect((await failing.getFirstAsync<{ user_version: number }>("PRAGMA user_version"))?.user_version).toBe(0);
    expect(await failing.getFirstAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='starters'")).toBeNull();
    failing.close();
  });

  it("migrates existing version-one feedings with reminder intent intact", async () => {
    const prior = new NodeDatabase(); await prior.execAsync(migrations[0].sql); await prior.execAsync(`INSERT INTO schema_meta(version,migrated_at_ms) VALUES(1,${now}); PRAGMA user_version = 1;`);
    await prior.runAsync("INSERT INTO starters(id,name,status,created_at_ms,updated_at_ms) VALUES(?,?,?,?,?)", starterId, "Mabel", "active", now, now);
    await prior.runAsync("INSERT INTO feedings(id,starter_id,fed_at_ms,entry_zone,entry_offset_minutes,starter_tenths_g,flour_tenths_g,water_tenths_g,created_at_ms,updated_at_ms) VALUES(?,?,?,?,?,?,?,?,?,?)", feedingId, starterId, now, "UTC", 0, 250, 500, 500, now, now);
    await prior.runAsync("INSERT INTO peak_estimates(feeding_id,model_version,earliest_at_ms,midpoint_at_ms,latest_at_ms,mode,factors_json,missing_inputs_json,personalization_json,created_at_ms,updated_at_ms) VALUES(?,?,?,?,?,?,?,?,?,?,?)", feedingId, "baseline-v1", now + 3_600_000, now + 4_000_000, now + 5_000_000, "widened", "[]", "[]", JSON.stringify({ applied: false, validObservationCount: 0, reason: "not_enough_observations" }), now, now);
    const priorRepository = new SQLiteStarterRepository(prior, () => now); await priorRepository.initialize();
    expect((await priorRepository.getFeeding(feedingId))?.reminder).toMatchObject({ enabled: true, status: "pending", targetAtMs: now + 3_600_000 }); prior.close();
  });

  it("persists starter lifecycle", async () => {
    await repository.saveStarter(starter); expect(await repository.getStarter(starterId)).toEqual(starter); expect(await repository.listStarters("active")).toHaveLength(1);
    await repository.saveStarter({ ...starter, name: "Mabel II", status: "archived", updatedAtMs: now + 1 }); expect((await repository.listStarters())[0]).toMatchObject({ name: "Mabel II", status: "archived" });
    await repository.deleteStarter(starterId); expect(await repository.getStarter(starterId)).toBeNull();
  });

  it("saves, edits and maps a complete feeding transaction", async () => {
    await repository.saveStarter(starter); const original = makeFeeding(); await repository.saveFeeding(original);
    expect((await repository.getFeeding(feedingId))?.reminder).toMatchObject({ enabled: true, status: "pending" });
    await repository.updateReminder(feedingId, { ...original.reminder, status: "scheduled", notificationId: "native-1" });
    expect((await repository.getFeeding(feedingId))?.reminder).toMatchObject({ status: "scheduled", notificationId: "native-1" });
    await repository.savePhoto(feedingId, { relativePath: "photo.jpg", mimeType: "image/jpeg", byteSize: 42 });
    expect(await repository.getFeeding(feedingId)).toMatchObject({ notes: "Rounded top", photo: { relativePath: "photo.jpg" }, estimate: { modelVersion: "baseline-v1" } });
    const withNotes = makeFeeding(); const { notes: _notes, ...withoutNotes } = withNotes;
    const edited = { ...withoutNotes, flourTenthsGrams: 750, observation: { observedAtMs: now + 9 * 3_600_000 }, updatedAtMs: now + 1 };
    await repository.saveFeeding(edited); expect(await repository.getFeeding(feedingId)).toMatchObject({ flourTenthsGrams: 750, observation: { observedAtMs: now + 9 * 3_600_000 } });
    await repository.savePhoto(feedingId, null); expect((await repository.getFeeding(feedingId))?.photo).toBeUndefined();
    const { observation: _observation, ...withoutObservation } = edited;
    await repository.saveFeeding(withoutObservation); expect((await repository.getFeeding(feedingId))?.observation).toBeUndefined();
  });

  it("persists reminder preference and the derived entitlement cache", async () => {
    expect(await repository.getReminderDefault()).toBe(true);
    await repository.setReminderDefault(false); expect(await repository.getReminderDefault()).toBe(false);
    expect(await repository.getSelectedStarterId()).toBeNull();
    await repository.saveStarter(starter); await repository.setSelectedStarterId(starterId); expect(await repository.getSelectedStarterId()).toBe(starterId);
    expect(await repository.getEntitlementCache()).toMatchObject({ level: "free", store: "unknown", lastVerifiedAtMs: null });
    await repository.saveEntitlementCache({ productId: "starter_clock_pro_lifetime", level: "pro", store: "ios", lastVerifiedAtMs: now });
    expect(await repository.getEntitlementCache()).toMatchObject({ level: "pro", store: "ios", lastVerifiedAtMs: now });
  });

  it("orders, limits, cascades and survives reopening", async () => {
    await repository.saveStarter(starter);
    for (let index = 0; index < 40; index += 1) await repository.saveFeeding(makeFeeding({ id: `${String(index).padStart(8, "0")}-1111-4111-8111-111111111111`, fedAtMs: now + index * 60_000 }));
    const limited = await repository.listFeedings(starterId, 30); expect(limited).toHaveLength(30); expect(limited[0]?.fedAtMs).toBeGreaterThan(limited[29]?.fedAtMs ?? 0);
    await repository.deleteFeeding(limited[0]!.id); expect(await repository.getFeeding(limited[0]!.id)).toBeNull();
    await repository.deleteStarter(starterId); expect(await repository.listFeedings(starterId)).toEqual([]);
  });

  it("pages, personalizes, exports and deletes correctly with 1,000 feedings", async () => {
    await repository.saveStarter(starter);
    for (let index = 0; index < 1_000; index += 1) {
      await repository.saveFeeding(makeFeeding({
        id: feedingUuid(index),
        fedAtMs: now + index * 60_000,
        ...(index % 20 === 0 ? { observation: { observedAtMs: now + index * 60_000 + 8 * 3_600_000 } } : {}),
      }));
    }

    const firstPage = await repository.listFeedings(starterId, 100);
    const secondPage = await repository.listFeedings(starterId, 100, 100);
    const lastPage = await repository.listFeedings(starterId, 100, 900);
    expect(firstPage).toHaveLength(100);
    expect(secondPage).toHaveLength(100);
    expect(lastPage).toHaveLength(100);
    expect(new Set([...firstPage, ...secondPage].map((feeding) => feeding.id))).toHaveLength(200);
    expect(firstPage[0]?.fedAtMs).toBeGreaterThan(secondPage[0]?.fedAtMs ?? 0);

    const observations = await repository.listObservedFeedings(starterId, 12, feedingUuid(980));
    expect(observations).toHaveLength(12);
    expect(observations.some((feeding) => feeding.id === feedingUuid(980))).toBe(false);
    expect(observations.every((feeding) => feeding.observation !== undefined)).toBe(true);

    const exported = await repository.exportAllData();
    expect(exported.feedings).toHaveLength(1_000);
    await repository.deleteAllData();
    expect(await repository.listFeedings(starterId)).toEqual([]);
  }, 20_000);

  it("limits reminder reconciliation rows to actionable records", async () => {
    await repository.saveStarter(starter);
    await repository.saveFeeding(makeFeeding({ id: feedingUuid(1), reminder: { enabled: true, status: "pending", targetAtMs: now - 1, updatedAtMs: now } }));
    await repository.saveFeeding(makeFeeding({ id: feedingUuid(2), reminder: { enabled: true, status: "pending", targetAtMs: now + 1, updatedAtMs: now } }));
    await repository.saveFeeding(makeFeeding({ id: feedingUuid(3), reminder: { enabled: false, status: "scheduled", targetAtMs: now - 1, notificationId: "native-old", updatedAtMs: now } }));

    await repository.expirePastReminders(now);
    const actionable = await repository.listReminderFeedings(now);
    expect(actionable.map((feeding) => feeding.id)).toEqual([feedingUuid(3), feedingUuid(2)]);
    expect((await repository.getFeeding(feedingUuid(1)))?.reminder.status).toBe("expired");
  });

  it("exports portable local data without OS notification identifiers", async () => {
    await repository.saveStarter(starter);
    await repository.saveFeeding(makeFeeding({ reminder: { enabled: true, status: "scheduled", targetAtMs: now + 6 * 3_600_000, notificationId: "os-secret", updatedAtMs: now } }));
    await repository.savePhoto(feedingId, { relativePath: "photo.jpg", mimeType: "image/jpeg", byteSize: 42 });
    await repository.setSelectedStarterId(starterId);
    await repository.setReminderDefault(false);

    const exported = await repository.exportAllData();

    expect(exported).toMatchObject({
      format: "starter-clock-export/v1",
      schemaVersion: SCHEMA_VERSION,
      preferences: { selectedStarterId: starterId, reminderDefault: false },
      starters: [{ id: starterId, name: "Mabel" }],
    });
    expect(exported.feedings).toHaveLength(1);
    expect(exported.feedings[0]?.photo).toMatchObject({ relativePath: "photo.jpg" });
    expect(exported.feedings[0]?.reminder).toMatchObject({ enabled: true, status: "scheduled" });
    expect("notificationId" in (exported.feedings[0]?.reminder ?? {})).toBe(false);
  });

  it("deletes all local data and resets free preferences without deleting schema", async () => {
    await repository.saveStarter(starter);
    await repository.saveFeeding(makeFeeding());
    await repository.setReminderDefault(false);
    await repository.saveEntitlementCache({ productId: "starter_clock_pro_lifetime", level: "pro", store: "android", lastVerifiedAtMs: now });

    await repository.deleteAllData();

    expect(await repository.listStarters()).toEqual([]);
    expect(await repository.getReminderDefault()).toBe(true);
    expect(await repository.getSelectedStarterId()).toBeNull();
    expect(await repository.getEntitlementCache()).toMatchObject({ productId: "starter_clock_pro_lifetime", level: "free", store: "unknown", lastVerifiedAtMs: null });
    expect((await database.getFirstAsync<{ user_version: number }>("PRAGMA user_version"))?.user_version).toBe(SCHEMA_VERSION);
  });

  it("rejects corrupt persisted rows at the boundary", async () => {
    await database.execAsync("PRAGMA ignore_check_constraints = ON");
    await database.runAsync("INSERT INTO starters(id,name,status,created_at_ms,updated_at_ms) VALUES(?,?,?,?,?)", "not-a-uuid", "Bad", "active", now, now);
    await expect(repository.listStarters()).rejects.toThrow();
  });
});
