import * as Crypto from "expo-crypto";
import * as SQLite from "expo-sqlite";
import { TrackingService } from "@/application/tracking-service";
import { SQLiteStarterRepository, type AppDatabase } from "./sqlite-repository";
import { ManagedPhotoStore } from "../files/photo-store.native";
import { ReminderService } from "@/application/reminder-service";
import { EntitlementService } from "@/application/entitlement-service";
import { ExpoNotificationAdapter } from "../notifications/expo-notification-adapter.native";
import { NativePurchaseAdapter } from "../purchases/native-purchase-adapter.native";

let servicePromise: Promise<TrackingService> | null = null;

export function getTrackingService() {
  servicePromise ??= createService();
  return servicePromise;
}

async function createService() {
  const database = await SQLite.openDatabaseAsync("starter-clock.db");
  const repository = new SQLiteStarterRepository(database as AppDatabase);
  const clock = { now: Date.now };
  const service = new TrackingService(
    repository,
    clock,
    { next: () => Crypto.randomUUID() },
    new ManagedPhotoStore(),
    new ReminderService(repository, new ExpoNotificationAdapter(), clock),
    new EntitlementService(repository, new NativePurchaseAdapter(), clock),
  );
  await service.initialize();
  return service;
}
