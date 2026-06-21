import { DatabaseSync } from "node:sqlite";
import type { AppDatabase } from "@/infrastructure/db/sqlite-repository";

type BindValue = string | number | null;

export class NodeDatabase implements AppDatabase {
  readonly raw: DatabaseSync;
  constructor(path = ":memory:") { this.raw = new DatabaseSync(path); }
  async execAsync(sql: string) { this.raw.exec(sql); }
  async runAsync(sql: string, ...params: BindValue[]) { this.raw.prepare(sql).run(...params); }
  async getFirstAsync<T>(sql: string, ...params: BindValue[]) { return (this.raw.prepare(sql).get(...params) as T | undefined) ?? null; }
  async getAllAsync<T>(sql: string, ...params: BindValue[]) { return this.raw.prepare(sql).all(...params) as T[]; }
  async withExclusiveTransactionAsync(task: (transaction: NodeDatabase) => Promise<void>) {
    this.raw.exec("BEGIN EXCLUSIVE");
    try { await task(this); this.raw.exec("COMMIT"); }
    catch (error) { this.raw.exec("ROLLBACK"); throw error; }
  }
  close() { this.raw.close(); }
}
