import type { Feeding, Photo, Starter, StarterStatus } from "@/domain/models";

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
}

export interface PhotoCandidate { uri: string; mimeType: string; byteSize: number }
export interface PhotoStore {
  select(): Promise<PhotoCandidate | null>;
  stage(candidate: PhotoCandidate, feedingId: string): Promise<{ temporaryPath: string; finalPath: string }>;
  commit(temporaryPath: string, finalPath: string): Promise<Photo>;
  remove(relativePath: string): Promise<void>;
}
