import * as Crypto from "expo-crypto";
import * as SQLite from "expo-sqlite";
import { TrackingService } from "@/application/tracking-service";
import { SQLiteStarterRepository, type AppDatabase } from "./sqlite-repository";
import { ManagedPhotoStore } from "../files/photo-store.native";

let servicePromise: Promise<TrackingService> | null = null;

export function getTrackingService() {
  servicePromise ??= createService();
  return servicePromise;
}

async function createService() {
  const database = await SQLite.openDatabaseAsync("starter-clock.db");
  const service = new TrackingService(
    new SQLiteStarterRepository(database as AppDatabase),
    { now: Date.now },
    { next: () => Crypto.randomUUID() },
    new ManagedPhotoStore(),
  );
  await service.initialize();
  return service;
}
