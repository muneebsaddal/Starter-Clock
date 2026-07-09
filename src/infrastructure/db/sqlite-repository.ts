import type { EntitlementCache, Feeding, PeakEstimate, Photo, Reminder, Starter, StarterStatus } from "@/domain/models";
import type { StarterClockExport, StarterRepository } from "@/application/ports";
import { z } from "zod";
import { migrateDatabase, SCHEMA_VERSION, type MigrationDatabase } from "./migrations";

type BindValue = string | number | null;
interface SqlExecutor {
  runAsync(sql: string, ...params: BindValue[]): Promise<unknown>;
  getFirstAsync<T>(sql: string, ...params: BindValue[]): Promise<T | null>;
  getAllAsync<T>(sql: string, ...params: BindValue[]): Promise<T[]>;
}

export interface AppDatabase extends SqlExecutor {
  execAsync(sql: string): Promise<void>;
  withExclusiveTransactionAsync(task: (transaction: SqlExecutor & { execAsync(sql: string): Promise<void> }) => Promise<void>): Promise<void>;
}

const starterRowSchema = z.object({
  id: z.string().uuid(), name: z.string(), status: z.enum(["active", "archived"]), created_at_ms: z.number(), updated_at_ms: z.number(),
});

const feedingRowSchema = z.object({
  id: z.string().uuid(), starter_id: z.string().uuid(), fed_at_ms: z.number(), entry_zone: z.string(), entry_offset_minutes: z.number(),
  starter_tenths_g: z.number(), flour_tenths_g: z.number(), water_tenths_g: z.number(), flour_type: z.enum(["white", "whole_wheat", "rye", "blend", "other"]).nullable(),
  temperature_tenths_c: z.number().nullable(), notes: z.string().nullable(), created_at_ms: z.number(), updated_at_ms: z.number(), model_version: z.literal("baseline-v1"),
  earliest_at_ms: z.number(), midpoint_at_ms: z.number(), latest_at_ms: z.number(), mode: z.enum(["baseline", "widened", "personalized"]), factors_json: z.string(),
  missing_inputs_json: z.string(), personalization_json: z.string(), observed_at_ms: z.number().nullable(), relative_path: z.string().nullable(), mime_type: z.string().nullable(), byte_size: z.number().nullable(),
  reminder_enabled: z.number().int().min(0).max(1), reminder_status: z.enum(["disabled", "pending", "scheduled", "denied", "failed", "expired"]),
  reminder_target_at_ms: z.number(), notification_id: z.string().nullable(), reminder_error_code: z.enum(["NOTIFICATION_DENIED", "NOTIFICATION_UNAVAILABLE", "NOTIFICATION_SCHEDULE_FAILED"]).nullable(), reminder_updated_at_ms: z.number(),
});

const entitlementRowSchema = z.object({ product_id: z.string().min(1), state: z.enum(["free", "pro"]), store: z.enum(["ios", "android", "unknown"]), last_verified_at_ms: z.number().nullable() });

const feedingSelect = `
  SELECT f.*, e.model_version, e.earliest_at_ms, e.midpoint_at_ms, e.latest_at_ms,
    e.mode, e.factors_json, e.missing_inputs_json, e.personalization_json,
    o.observed_at_ms, p.relative_path, p.mime_type, p.byte_size,
    r.enabled AS reminder_enabled, r.status AS reminder_status, r.target_at_ms AS reminder_target_at_ms,
    r.notification_id, r.error_code AS reminder_error_code, r.updated_at_ms AS reminder_updated_at_ms
  FROM feedings f
  JOIN peak_estimates e ON e.feeding_id = f.id
  LEFT JOIN peak_observations o ON o.feeding_id = f.id
  LEFT JOIN photos p ON p.feeding_id = f.id
  JOIN reminders r ON r.feeding_id = f.id`;

export class SQLiteStarterRepository implements StarterRepository {
  constructor(private readonly database: AppDatabase, private readonly now: () => number = Date.now) {}

  initialize() { return migrateDatabase(this.database as unknown as MigrationDatabase, this.now()); }

  async listStarters(status?: StarterStatus) {
    const rows = status
      ? await this.database.getAllAsync<unknown>("SELECT * FROM starters WHERE status = ? ORDER BY updated_at_ms DESC", status)
      : await this.database.getAllAsync<unknown>("SELECT * FROM starters ORDER BY updated_at_ms DESC");
    return rows.map(mapStarter);
  }

  async getStarter(id: string) {
    const row = await this.database.getFirstAsync<unknown>("SELECT * FROM starters WHERE id = ?", id);
    return row ? mapStarter(row) : null;
  }

  async saveStarter(starter: Starter) {
    const parsed = starterRowSchema.parse(toStarterRow(starter));
    await this.database.runAsync(
      `INSERT INTO starters(id,name,status,created_at_ms,updated_at_ms) VALUES(?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name,status=excluded.status,updated_at_ms=excluded.updated_at_ms`,
      parsed.id, parsed.name, parsed.status, parsed.created_at_ms, parsed.updated_at_ms,
    );
  }

  async deleteStarter(id: string) { await this.database.runAsync("DELETE FROM starters WHERE id = ?", id); }

  async listFeedings(starterId: string, limit?: number) {
    const appliedLimit = Math.min(limit ?? 10_000, 10_000);
    const rows = await this.database.getAllAsync<unknown>(`${feedingSelect} WHERE f.starter_id = ? ORDER BY f.fed_at_ms DESC LIMIT ?`, starterId, appliedLimit);
    return rows.map(mapFeeding);
  }

  async getFeeding(id: string) {
    const row = await this.database.getFirstAsync<unknown>(`${feedingSelect} WHERE f.id = ?`, id);
    return row ? mapFeeding(row) : null;
  }

  async saveFeeding(feeding: Feeding) {
    await this.database.withExclusiveTransactionAsync(async (tx) => {
      await tx.runAsync(
        `INSERT INTO feedings(id,starter_id,fed_at_ms,entry_zone,entry_offset_minutes,starter_tenths_g,flour_tenths_g,water_tenths_g,flour_type,temperature_tenths_c,notes,created_at_ms,updated_at_ms)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET starter_id=excluded.starter_id,fed_at_ms=excluded.fed_at_ms,entry_zone=excluded.entry_zone,
         entry_offset_minutes=excluded.entry_offset_minutes,starter_tenths_g=excluded.starter_tenths_g,flour_tenths_g=excluded.flour_tenths_g,water_tenths_g=excluded.water_tenths_g,
         flour_type=excluded.flour_type,temperature_tenths_c=excluded.temperature_tenths_c,notes=excluded.notes,updated_at_ms=excluded.updated_at_ms`,
        feeding.id, feeding.starterId, feeding.fedAtMs, feeding.entryZone, feeding.entryOffsetMinutes, feeding.starterTenthsGrams, feeding.flourTenthsGrams,
        feeding.waterTenthsGrams, feeding.flourType ?? null, feeding.temperatureTenthsC ?? null, feeding.notes ?? null, feeding.createdAtMs, feeding.updatedAtMs,
      );
      const estimate = feeding.estimate;
      await tx.runAsync(
        `INSERT INTO peak_estimates(feeding_id,model_version,earliest_at_ms,midpoint_at_ms,latest_at_ms,mode,factors_json,missing_inputs_json,personalization_json,created_at_ms,updated_at_ms)
         VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(feeding_id) DO UPDATE SET model_version=excluded.model_version,earliest_at_ms=excluded.earliest_at_ms,
         midpoint_at_ms=excluded.midpoint_at_ms,latest_at_ms=excluded.latest_at_ms,mode=excluded.mode,factors_json=excluded.factors_json,missing_inputs_json=excluded.missing_inputs_json,
         personalization_json=excluded.personalization_json,updated_at_ms=excluded.updated_at_ms`,
        feeding.id, estimate.modelVersion, estimate.earliestAtMs, estimate.midpointAtMs, estimate.latestAtMs, estimate.mode, JSON.stringify(estimate.factors),
        JSON.stringify(estimate.missingInputs), JSON.stringify(estimate.personalization), feeding.createdAtMs, feeding.updatedAtMs,
      );
      if (feeding.observation) {
        await tx.runAsync(
          `INSERT INTO peak_observations(feeding_id,observed_at_ms,created_at_ms,updated_at_ms) VALUES(?,?,?,?)
           ON CONFLICT(feeding_id) DO UPDATE SET observed_at_ms=excluded.observed_at_ms,updated_at_ms=excluded.updated_at_ms`,
          feeding.id, feeding.observation.observedAtMs, feeding.createdAtMs, feeding.updatedAtMs,
        );
      } else {
        await tx.runAsync("DELETE FROM peak_observations WHERE feeding_id = ?", feeding.id);
      }
      await tx.runAsync(
        `INSERT INTO reminders(feeding_id,enabled,status,target_at_ms,notification_id,error_code,updated_at_ms) VALUES(?,?,?,?,?,?,?)
         ON CONFLICT(feeding_id) DO UPDATE SET enabled=excluded.enabled,status=excluded.status,target_at_ms=excluded.target_at_ms,
         notification_id=excluded.notification_id,error_code=excluded.error_code,updated_at_ms=excluded.updated_at_ms`,
        feeding.id, feeding.reminder.enabled ? 1 : 0, feeding.reminder.status, feeding.reminder.targetAtMs,
        feeding.reminder.notificationId ?? null, feeding.reminder.errorCode ?? null, feeding.reminder.updatedAtMs,
      );
    });
  }

  async deleteFeeding(id: string) { await this.database.runAsync("DELETE FROM feedings WHERE id = ?", id); }

  async savePhoto(feedingId: string, photo: Photo | null) {
    if (!photo) { await this.database.runAsync("DELETE FROM photos WHERE feeding_id = ?", feedingId); return; }
    const now = this.now();
    await this.database.runAsync(
      `INSERT INTO photos(feeding_id,relative_path,mime_type,byte_size,created_at_ms,updated_at_ms) VALUES(?,?,?,?,?,?)
       ON CONFLICT(feeding_id) DO UPDATE SET relative_path=excluded.relative_path,mime_type=excluded.mime_type,byte_size=excluded.byte_size,updated_at_ms=excluded.updated_at_ms`,
      feedingId, photo.relativePath, photo.mimeType, photo.byteSize, now, now,
    );
  }

  async updateReminder(feedingId: string, reminder: Reminder) {
    await this.database.runAsync(
      `UPDATE reminders SET enabled=?,status=?,target_at_ms=?,notification_id=?,error_code=?,updated_at_ms=? WHERE feeding_id=?`,
      reminder.enabled ? 1 : 0, reminder.status, reminder.targetAtMs, reminder.notificationId ?? null, reminder.errorCode ?? null, reminder.updatedAtMs, feedingId,
    );
  }

  async listReminderFeedings() {
    const rows = await this.database.getAllAsync<unknown>(`${feedingSelect} ORDER BY f.fed_at_ms DESC`);
    return rows.map(mapFeeding);
  }

  async getReminderDefault() {
    const row = await this.database.getFirstAsync<{ reminder_default: number }>("SELECT reminder_default FROM preferences WHERE id = 1");
    return row?.reminder_default !== 0;
  }

  async setReminderDefault(enabled: boolean) { await this.database.runAsync("UPDATE preferences SET reminder_default = ? WHERE id = 1", enabled ? 1 : 0); }

  async getSelectedStarterId() {
    const row = await this.database.getFirstAsync<{ selected_starter_id: string | null }>("SELECT selected_starter_id FROM preferences WHERE id = 1");
    return row?.selected_starter_id ?? null;
  }

  async setSelectedStarterId(id: string | null) { await this.database.runAsync("UPDATE preferences SET selected_starter_id = ? WHERE id = 1", id); }

  async getEntitlementCache(): Promise<EntitlementCache> {
    const row = entitlementRowSchema.parse(await this.database.getFirstAsync<unknown>("SELECT product_id,state,store,last_verified_at_ms FROM entitlement_cache WHERE id = 1"));
    return { productId: row.product_id, level: row.state, store: row.store, lastVerifiedAtMs: row.last_verified_at_ms };
  }

  async saveEntitlementCache(cache: EntitlementCache) {
    await this.database.runAsync("UPDATE entitlement_cache SET product_id=?,state=?,store=?,last_verified_at_ms=? WHERE id=1", cache.productId, cache.level, cache.store, cache.lastVerifiedAtMs);
  }

  async exportAllData(): Promise<StarterClockExport> {
    const starters = await this.listStarters();
    const feedings = (await Promise.all(starters.map((starter) => this.listFeedings(starter.id)))).flat();
    return {
      format: "starter-clock-export/v1",
      exportedAtMs: this.now(),
      schemaVersion: SCHEMA_VERSION,
      modelVersions: Array.from(new Set(feedings.map((feeding) => feeding.estimate.modelVersion))).sort(),
      preferences: {
        selectedStarterId: await this.getSelectedStarterId(),
        reminderDefault: await this.getReminderDefault(),
      },
      starters,
      feedings: feedings.map((feeding) => {
        const { notificationId: _notificationId, ...reminder } = feeding.reminder;
        return { ...feeding, reminder };
      }),
    };
  }

  async deleteAllData() {
    await this.database.withExclusiveTransactionAsync(async (tx) => {
      await tx.runAsync("DELETE FROM starters");
      await tx.runAsync("DELETE FROM preferences");
      await tx.runAsync("INSERT INTO preferences(id) VALUES(1)");
      await tx.runAsync("DELETE FROM entitlement_cache");
      await tx.runAsync(
        "INSERT INTO entitlement_cache(id, product_id, state, store, last_verified_at_ms) VALUES(1, ?, 'free', 'unknown', NULL)",
        "starter_clock_pro_lifetime",
      );
    });
  }
}

function mapStarter(row: unknown): Starter {
  const parsed = starterRowSchema.parse(row);
  return { id: parsed.id, name: parsed.name, status: parsed.status, createdAtMs: parsed.created_at_ms, updatedAtMs: parsed.updated_at_ms };
}

function toStarterRow(starter: Starter) {
  return { id: starter.id, name: starter.name, status: starter.status, created_at_ms: starter.createdAtMs, updated_at_ms: starter.updatedAtMs };
}

function mapFeeding(row: unknown): Feeding {
  const parsed = feedingRowSchema.parse(row);
  const estimate: PeakEstimate = {
    modelVersion: parsed.model_version,
    earliestAtMs: parsed.earliest_at_ms,
    midpointAtMs: parsed.midpoint_at_ms,
    latestAtMs: parsed.latest_at_ms,
    mode: parsed.mode,
    factors: JSON.parse(parsed.factors_json) as PeakEstimate["factors"],
    missingInputs: JSON.parse(parsed.missing_inputs_json) as PeakEstimate["missingInputs"],
    personalization: JSON.parse(parsed.personalization_json) as PeakEstimate["personalization"],
  };
  return {
    id: parsed.id, starterId: parsed.starter_id, fedAtMs: parsed.fed_at_ms, entryZone: parsed.entry_zone, entryOffsetMinutes: parsed.entry_offset_minutes,
    starterTenthsGrams: parsed.starter_tenths_g, flourTenthsGrams: parsed.flour_tenths_g, waterTenthsGrams: parsed.water_tenths_g,
    ...(parsed.flour_type === null ? {} : { flourType: parsed.flour_type }),
    ...(parsed.temperature_tenths_c === null ? {} : { temperatureTenthsC: parsed.temperature_tenths_c }),
    ...(parsed.notes === null ? {} : { notes: parsed.notes }),
    ...(parsed.observed_at_ms === null ? {} : { observation: { observedAtMs: parsed.observed_at_ms } }),
    ...(parsed.relative_path === null || parsed.mime_type === null || parsed.byte_size === null ? {} : { photo: { relativePath: parsed.relative_path, mimeType: parsed.mime_type, byteSize: parsed.byte_size } }),
    reminder: {
      enabled: parsed.reminder_enabled === 1, status: parsed.reminder_status, targetAtMs: parsed.reminder_target_at_ms, updatedAtMs: parsed.reminder_updated_at_ms,
      ...(parsed.notification_id === null ? {} : { notificationId: parsed.notification_id }),
      ...(parsed.reminder_error_code === null ? {} : { errorCode: parsed.reminder_error_code }),
    },
    estimate, createdAtMs: parsed.created_at_ms, updatedAtMs: parsed.updated_at_ms,
  };
}
