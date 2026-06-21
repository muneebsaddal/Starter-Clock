export const SCHEMA_VERSION = 2;

export const migrations = [
  {
    version: 1,
    name: "001_initial",
    sql: `
      CREATE TABLE starters (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 40),
        status TEXT NOT NULL CHECK(status IN ('active','archived')),
        created_at_ms INTEGER NOT NULL,
        updated_at_ms INTEGER NOT NULL
      );
      CREATE TABLE feedings (
        id TEXT PRIMARY KEY NOT NULL,
        starter_id TEXT NOT NULL REFERENCES starters(id) ON DELETE CASCADE,
        fed_at_ms INTEGER NOT NULL,
        entry_zone TEXT NOT NULL,
        entry_offset_minutes INTEGER NOT NULL,
        starter_tenths_g INTEGER NOT NULL CHECK(starter_tenths_g > 0),
        flour_tenths_g INTEGER NOT NULL CHECK(flour_tenths_g > 0),
        water_tenths_g INTEGER NOT NULL CHECK(water_tenths_g > 0),
        flour_type TEXT CHECK(flour_type IN ('white','whole_wheat','rye','blend','other')),
        temperature_tenths_c INTEGER,
        notes TEXT,
        created_at_ms INTEGER NOT NULL,
        updated_at_ms INTEGER NOT NULL
      );
      CREATE INDEX feedings_starter_date ON feedings(starter_id, fed_at_ms DESC);
      CREATE TABLE peak_estimates (
        feeding_id TEXT PRIMARY KEY NOT NULL REFERENCES feedings(id) ON DELETE CASCADE,
        model_version TEXT NOT NULL,
        earliest_at_ms INTEGER NOT NULL,
        midpoint_at_ms INTEGER NOT NULL,
        latest_at_ms INTEGER NOT NULL,
        mode TEXT NOT NULL,
        factors_json TEXT NOT NULL,
        missing_inputs_json TEXT NOT NULL,
        personalization_json TEXT NOT NULL,
        created_at_ms INTEGER NOT NULL,
        updated_at_ms INTEGER NOT NULL
      );
      CREATE TABLE peak_observations (
        feeding_id TEXT PRIMARY KEY NOT NULL REFERENCES feedings(id) ON DELETE CASCADE,
        observed_at_ms INTEGER NOT NULL,
        created_at_ms INTEGER NOT NULL,
        updated_at_ms INTEGER NOT NULL
      );
      CREATE TABLE photos (
        feeding_id TEXT PRIMARY KEY NOT NULL REFERENCES feedings(id) ON DELETE CASCADE,
        relative_path TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        byte_size INTEGER NOT NULL CHECK(byte_size >= 0),
        created_at_ms INTEGER NOT NULL,
        updated_at_ms INTEGER NOT NULL
      );
      CREATE TABLE preferences (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        selected_starter_id TEXT REFERENCES starters(id) ON DELETE SET NULL,
        temperature_unit TEXT NOT NULL DEFAULT 'c' CHECK(temperature_unit IN ('c','f')),
        appearance TEXT NOT NULL DEFAULT 'system' CHECK(appearance IN ('system','light','dark')),
        reminder_default INTEGER NOT NULL DEFAULT 1 CHECK(reminder_default IN (0,1))
      );
      INSERT INTO preferences(id) VALUES(1);
      CREATE TABLE schema_meta (
        version INTEGER PRIMARY KEY,
        migrated_at_ms INTEGER NOT NULL
      );
    `,
  },
  {
    version: 2,
    name: "002_reminders_entitlement",
    sql: `
      CREATE TABLE reminders (
        feeding_id TEXT PRIMARY KEY NOT NULL REFERENCES feedings(id) ON DELETE CASCADE,
        enabled INTEGER NOT NULL CHECK(enabled IN (0,1)),
        status TEXT NOT NULL CHECK(status IN ('disabled','pending','scheduled','denied','failed','expired')),
        target_at_ms INTEGER NOT NULL,
        notification_id TEXT,
        error_code TEXT CHECK(error_code IN ('NOTIFICATION_DENIED','NOTIFICATION_UNAVAILABLE','NOTIFICATION_SCHEDULE_FAILED')),
        updated_at_ms INTEGER NOT NULL
      );
      INSERT INTO reminders(feeding_id, enabled, status, target_at_ms, updated_at_ms)
        SELECT f.id, 1, 'pending', e.earliest_at_ms, f.updated_at_ms
        FROM feedings f JOIN peak_estimates e ON e.feeding_id = f.id;
      CREATE TABLE entitlement_cache (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        product_id TEXT NOT NULL,
        state TEXT NOT NULL CHECK(state IN ('free','pro')),
        store TEXT NOT NULL CHECK(store IN ('ios','android','unknown')),
        last_verified_at_ms INTEGER
      );
      INSERT INTO entitlement_cache(id, product_id, state, store, last_verified_at_ms)
        VALUES(1, 'starter_clock_pro_lifetime', 'free', 'unknown', NULL);
    `,
  },
] as const;

export interface MigrationDatabase {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(sql: string): Promise<T | null>;
  withExclusiveTransactionAsync(task: (transaction: { execAsync(sql: string): Promise<void> }) => Promise<void>): Promise<void>;
}

export async function migrateDatabase(database: MigrationDatabase, nowMs: number) {
  await database.execAsync("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
  const row = await database.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const current = row?.user_version ?? 0;
  if (current > SCHEMA_VERSION) throw new Error("DB_SCHEMA_NEWER_THAN_APP");
  for (const migration of migrations) {
    if (migration.version <= current) continue;
    await database.withExclusiveTransactionAsync(async (transaction) => {
      await transaction.execAsync(migration.sql);
      await transaction.execAsync(`INSERT INTO schema_meta(version, migrated_at_ms) VALUES(${migration.version}, ${nowMs});`);
      await transaction.execAsync(`PRAGMA user_version = ${migration.version};`);
    });
  }
}
