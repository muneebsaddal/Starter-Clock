import type { EntitlementCache, EntitlementLevel, EntitlementStore, Feeding, Photo, Reminder, Starter, StarterStatus } from "@/domain/models";

export interface Clock { now(): number }
export interface IdGenerator { next(): string }

export interface StarterRepository {
  initialize(): Promise<void>;
  listStarters(status?: StarterStatus): Promise<Starter[]>;
  getStarter(id: string): Promise<Starter | null>;
  saveStarter(starter: Starter): Promise<void>;
  deleteStarter(id: string): Promise<void>;
  listFeedings(starterId: string, limit?: number): Promise<Feeding[]>;
  getFeeding(id: string): Promise<Feeding | null>;
  saveFeeding(feeding: Feeding): Promise<void>;
  deleteFeeding(id: string): Promise<void>;
  savePhoto(feedingId: string, photo: Photo | null): Promise<void>;
  updateReminder(feedingId: string, reminder: Reminder): Promise<void>;
  listReminderFeedings(): Promise<Feeding[]>;
  getReminderDefault(): Promise<boolean>;
  setReminderDefault(enabled: boolean): Promise<void>;
  getSelectedStarterId(): Promise<string | null>;
  setSelectedStarterId(id: string | null): Promise<void>;
  getEntitlementCache(): Promise<EntitlementCache>;
  saveEntitlementCache(cache: EntitlementCache): Promise<void>;
  exportAllData(): Promise<StarterClockExport>;
  deleteAllData(): Promise<void>;
}

export interface StarterClockExport {
  format: "starter-clock-export/v1";
  exportedAtMs: number;
  schemaVersion: number;
  modelVersions: string[];
  preferences: {
    selectedStarterId: string | null;
    reminderDefault: boolean;
  };
  starters: Starter[];
  feedings: ExportedFeeding[];
}

export type ExportedFeeding = Omit<Feeding, "reminder"> & {
  reminder: Omit<Reminder, "notificationId">;
};

export interface PhotoCandidate { uri: string; mimeType: string; byteSize: number }
export interface PhotoStore {
  select(): Promise<PhotoCandidate | null>;
  stage(candidate: PhotoCandidate, feedingId: string): Promise<{ temporaryPath: string; finalPath: string }>;
  commit(temporaryPath: string, finalPath: string): Promise<Photo>;
  remove(relativePath: string): Promise<void>;
}

export type NotificationPermission = "granted" | "denied" | "undetermined";
export interface NotificationRequest { feedingId: string; starterName: string; targetAtMs: number }
export interface ScheduledNotification { id: string; feedingId?: string }
export interface NotificationPort {
  prepare(): Promise<void>;
  getPermission(): Promise<NotificationPermission>;
  requestPermission(): Promise<NotificationPermission>;
  schedule(request: NotificationRequest): Promise<string>;
  cancel(notificationId: string): Promise<void>;
  listScheduled(): Promise<ScheduledNotification[]>;
}

export type StorePurchaseResult =
  | { state: "purchased"; store: EntitlementStore }
  | { state: "pending" | "cancelled" | "failed" };
export interface PurchasePort {
  getEntitlement(): Promise<{ level: EntitlementLevel; store: EntitlementStore }>;
  purchaseLifetime(): Promise<StorePurchaseResult>;
}
