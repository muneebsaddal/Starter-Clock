import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Feeding, Starter } from "@/domain/models";
import { estimatePeak } from "@/domain/peak-model";
import { migrateDatabase, SCHEMA_VERSION } from "@/infrastructure/db/migrations";
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
    createdAtMs: now, updatedAtMs: now, ...overrides,
  };
}

describe("SQLite migrations and repository", () => {
  let database: NodeDatabase; let repository: SQLiteStarterRepository;
  beforeEach(async () => { database = new NodeDatabase(); repository = new SQLiteStarterRepository(database, () => now); await repository.initialize(); });
  afterEach(() => database.close());

  it("migrates atomically and is idempotent", async () => {
    const version = await database.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
    expect(version?.user_version).toBe(SCHEMA_VERSION); expect(await database.getFirstAsync("SELECT * FROM preferences WHERE id = 1")).not.toBeNull();
    await migrateDatabase(database, now + 1); expect((await database.getAllAsync("SELECT * FROM schema_meta")).length).toBe(1);
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

  it("persists starter lifecycle", async () => {
    await repository.saveStarter(starter); expect(await repository.getStarter(starterId)).toEqual(starter); expect(await repository.listStarters("active")).toHaveLength(1);
    await repository.saveStarter({ ...starter, name: "Mabel II", status: "archived", updatedAtMs: now + 1 }); expect((await repository.listStarters())[0]).toMatchObject({ name: "Mabel II", status: "archived" });
    await repository.deleteStarter(starterId); expect(await repository.getStarter(starterId)).toBeNull();
  });

  it("saves, edits and maps a complete feeding transaction", async () => {
    await repository.saveStarter(starter); const original = makeFeeding(); await repository.saveFeeding(original);
    await repository.savePhoto(feedingId, { relativePath: "photo.jpg", mimeType: "image/jpeg", byteSize: 42 });
    expect(await repository.getFeeding(feedingId)).toMatchObject({ notes: "Rounded top", photo: { relativePath: "photo.jpg" }, estimate: { modelVersion: "baseline-v1" } });
    const withNotes = makeFeeding(); const { notes: _notes, ...withoutNotes } = withNotes;
    const edited = { ...withoutNotes, flourTenthsGrams: 750, observation: { observedAtMs: now + 9 * 3_600_000 }, updatedAtMs: now + 1 };
    await repository.saveFeeding(edited); expect(await repository.getFeeding(feedingId)).toMatchObject({ flourTenthsGrams: 750, observation: { observedAtMs: now + 9 * 3_600_000 } });
    await repository.savePhoto(feedingId, null); expect((await repository.getFeeding(feedingId))?.photo).toBeUndefined();
    const { observation: _observation, ...withoutObservation } = edited;
    await repository.saveFeeding(withoutObservation); expect((await repository.getFeeding(feedingId))?.observation).toBeUndefined();
  });

  it("orders, limits, cascades and survives reopening", async () => {
    await repository.saveStarter(starter);
    for (let index = 0; index < 40; index += 1) await repository.saveFeeding(makeFeeding({ id: `${String(index).padStart(8, "0")}-1111-4111-8111-111111111111`, fedAtMs: now + index * 60_000 }));
    const limited = await repository.listFeedings(starterId, 30); expect(limited).toHaveLength(30); expect(limited[0]?.fedAtMs).toBeGreaterThan(limited[29]?.fedAtMs ?? 0);
    await repository.deleteFeeding(limited[0]!.id); expect(await repository.getFeeding(limited[0]!.id)).toBeNull();
    await repository.deleteStarter(starterId); expect(await repository.listFeedings(starterId)).toEqual([]);
  });

  it("rejects corrupt persisted rows at the boundary", async () => {
    await database.execAsync("PRAGMA ignore_check_constraints = ON");
    await database.runAsync("INSERT INTO starters(id,name,status,created_at_ms,updated_at_ms) VALUES(?,?,?,?,?)", "not-a-uuid", "Bad", "active", now, now);
    await expect(repository.listStarters()).rejects.toThrow();
  });
});
