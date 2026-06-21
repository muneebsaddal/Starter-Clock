import type { TrackingService } from "@/application/tracking-service";

export async function getTrackingService(): Promise<TrackingService> {
  throw new Error("MOBILE_TRACKING_UNAVAILABLE_ON_WEB");
}
