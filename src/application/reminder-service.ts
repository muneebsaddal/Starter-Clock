import type { Feeding, Reminder } from "@/domain/models";
import type { Clock, NotificationPort, StarterRepository } from "./ports";

export class ReminderService {
  constructor(
    private readonly repository: StarterRepository,
    private readonly notifications: NotificationPort,
    private readonly clock: Clock,
  ) {}

  async sync(feeding: Feeding, starterName: string, requestPermission = true): Promise<void> {
    const current = feeding.reminder;
    await this.cancelKnown(current);
    if (!current.enabled) {
      await this.update(feeding.id, current, { status: "disabled" });
      return;
    }
    if (current.targetAtMs <= this.clock.now()) {
      await this.update(feeding.id, current, { status: "expired" });
      return;
    }
    try {
      await this.notifications.prepare();
      let permission = await this.notifications.getPermission();
      if (permission === "undetermined" && requestPermission) permission = await this.notifications.requestPermission();
      if (permission === "undetermined") {
        await this.update(feeding.id, current, { status: "pending" });
        return;
      }
      if (permission !== "granted") {
        await this.update(feeding.id, current, { status: "denied", errorCode: "NOTIFICATION_DENIED" });
        return;
      }
      const notificationId = await this.notifications.schedule({ feedingId: feeding.id, starterName, targetAtMs: current.targetAtMs });
      await this.update(feeding.id, current, { status: "scheduled", notificationId });
    } catch {
      await this.update(feeding.id, current, { status: "failed", errorCode: "NOTIFICATION_SCHEDULE_FAILED" });
    }
  }

  async cancel(reminder: Reminder): Promise<void> { await this.cancelKnown(reminder); }

  async reconcile(): Promise<void> {
    let scheduled: Awaited<ReturnType<NotificationPort["listScheduled"]>>;
    try {
      await this.notifications.prepare();
      scheduled = await this.notifications.listScheduled();
    } catch { return; }
    const feedings = await this.repository.listReminderFeedings();
    const ownedIds = new Set(feedings.flatMap((feeding) => feeding.reminder.notificationId ? [feeding.reminder.notificationId] : []));
    await Promise.all(scheduled.filter((entry) => entry.feedingId && !ownedIds.has(entry.id)).map((entry) => this.notifications.cancel(entry.id).catch(() => undefined)));
    for (const feeding of feedings) {
      const starter = await this.repository.getStarter(feeding.starterId);
      if (starter) await this.sync(feeding, starter.name, false);
    }
  }

  private async cancelKnown(reminder: Reminder) {
    if (!reminder.notificationId) return;
    try { await this.notifications.cancel(reminder.notificationId); } catch { /* reconciliation retries external cleanup */ }
  }

  private async update(feedingId: string, current: Reminder, change: Partial<Reminder>) {
    const next: Reminder = {
      enabled: current.enabled,
      status: change.status ?? current.status,
      targetAtMs: current.targetAtMs,
      updatedAtMs: this.clock.now(),
      ...(change.notificationId === undefined ? {} : { notificationId: change.notificationId }),
      ...(change.errorCode === undefined ? {} : { errorCode: change.errorCode }),
    };
    await this.repository.updateReminder(feedingId, next);
  }
}
