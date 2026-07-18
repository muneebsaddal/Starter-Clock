import { describe, expect, it, vi } from "vitest";
import { ReminderService } from "@/application/reminder-service";
import type { NotificationPermission, NotificationPort, StarterRepository } from "@/application/ports";
import type { Feeding, Reminder } from "@/domain/models";

const now = Date.parse("2026-06-22T08:00:00Z");
const reminder = (overrides: Partial<Reminder> = {}): Reminder => ({ enabled: true, status: "pending", targetAtMs: now + 3_600_000, updatedAtMs: now, ...overrides });
const feeding = (value = reminder()): Feeding => ({ id: "22222222-2222-4222-8222-222222222222", starterId: "11111111-1111-4111-8111-111111111111", fedAtMs: now, entryZone: "UTC", entryOffsetMinutes: 0, starterTenthsGrams: 250, flourTenthsGrams: 500, waterTenthsGrams: 500, reminder: value, estimate: { modelVersion: "baseline-v1", earliestAtMs: now + 3_600_000, midpointAtMs: now + 4_000_000, latestAtMs: now + 5_000_000, mode: "widened", factors: [], missingInputs: [], personalization: { applied: false, validObservationCount: 0, reason: "not_enough_observations" } }, createdAtMs: now, updatedAtMs: now });

function setup(permission: NotificationPermission = "granted") {
  let saved: Reminder | undefined;
  const repository = {
    updateReminder: vi.fn(async (_id: string, value: Reminder) => { saved = value; }),
    expirePastReminders: vi.fn(async () => undefined),
    listReminderFeedings: vi.fn(async () => []),
    getStarter: vi.fn(async () => ({ id: "11111111-1111-4111-8111-111111111111", name: "Mabel", status: "active" as const, createdAtMs: now, updatedAtMs: now })),
  } as unknown as StarterRepository;
  const notifications: NotificationPort = {
    prepare: vi.fn(async () => undefined), getPermission: vi.fn(async () => permission), requestPermission: vi.fn(async () => permission),
    schedule: vi.fn(async () => "native-2"), cancel: vi.fn(async () => undefined), listScheduled: vi.fn(async () => []),
  };
  return { repository, notifications, service: new ReminderService(repository, notifications, { now: () => now }), saved: () => saved };
}

describe("reminder scheduling policy", () => {
  it("schedules only after permission and replaces the previous native request", async () => {
    const test = setup(); await test.service.sync(feeding(reminder({ status: "scheduled", notificationId: "native-1" })), "Mabel");
    expect(test.notifications.cancel).toHaveBeenCalledWith("native-1"); expect(test.notifications.schedule).toHaveBeenCalledOnce(); expect(test.saved()).toMatchObject({ status: "scheduled", notificationId: "native-2" });
  });
  it("keeps intent recoverable when permission is denied", async () => {
    const test = setup("denied"); await test.service.sync(feeding(), "Mabel");
    expect(test.notifications.schedule).not.toHaveBeenCalled(); expect(test.saved()).toMatchObject({ enabled: true, status: "denied", errorCode: "NOTIFICATION_DENIED" });
  });
  it("expires past targets and disables opted-out reminders", async () => {
    const test = setup(); await test.service.sync(feeding(reminder({ targetAtMs: now - 1 })), "Mabel"); expect(test.saved()?.status).toBe("expired");
    await test.service.sync(feeding(reminder({ enabled: false })), "Mabel"); expect(test.saved()?.status).toBe("disabled");
  });
  it("does not prompt during launch reconciliation", async () => {
    const test = setup("undetermined"); vi.mocked(test.repository.listReminderFeedings).mockResolvedValue([feeding()]);
    await test.service.reconcile(); expect(test.repository.expirePastReminders).toHaveBeenCalledWith(now); expect(test.notifications.requestPermission).not.toHaveBeenCalled(); expect(test.saved()?.status).toBe("pending");
  });
  it("keeps a valid scheduled request instead of replacing it at launch", async () => {
    const test = setup();
    const scheduled = feeding(reminder({ status: "scheduled", notificationId: "native-1" }));
    vi.mocked(test.repository.listReminderFeedings).mockResolvedValue([scheduled]);
    vi.mocked(test.notifications.listScheduled).mockResolvedValue([{ id: "native-1", feedingId: scheduled.id }]);
    await test.service.reconcile();
    expect(test.notifications.cancel).not.toHaveBeenCalled();
    expect(test.notifications.schedule).not.toHaveBeenCalled();
    expect(test.repository.updateReminder).not.toHaveBeenCalled();
  });
});
