import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";
import type { NotificationPermission, NotificationPort, NotificationRequest, ScheduledNotification } from "@/application/ports";
import { z } from "zod";

const CHANNEL_ID = "peak-reminders";
const feedingIdSchema = z.uuid();

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export class ExpoNotificationAdapter implements NotificationPort {
  async prepare() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: "Peak reminders",
        description: "Reminders when a starter is expected to enter its peak window.",
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: "default",
      });
    }
  }

  async getPermission(): Promise<NotificationPermission> {
    return mapPermission((await Notifications.getPermissionsAsync()).status);
  }

  async requestPermission(): Promise<NotificationPermission> {
    const proceed = await new Promise<boolean>((resolve) => Alert.alert(
      "Allow peak reminders?",
      "Starter Clock will send one local reminder when your starter enters its estimated peak window. You can change this for every feeding.",
      [{ text: "Not now", style: "cancel", onPress: () => resolve(false) }, { text: "Continue", onPress: () => resolve(true) }],
      { cancelable: false },
    ));
    if (!proceed) return "undetermined";
    return mapPermission((await Notifications.requestPermissionsAsync()).status);
  }

  schedule(request: NotificationRequest) {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: `${request.starterName} may be near peak`,
        body: "Check for maximum rise, a rounded top, and plenty of bubbles.",
        data: { kind: "peak-reminder", feedingId: request.feedingId },
        sound: "default",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: request.targetAtMs, channelId: CHANNEL_ID },
    });
  }

  cancel(notificationId: string) { return Notifications.cancelScheduledNotificationAsync(notificationId); }

  async listScheduled(): Promise<ScheduledNotification[]> {
    return (await Notifications.getAllScheduledNotificationsAsync()).map((entry) => {
      const feedingId = entry.content.data?.feedingId;
      const parsed = feedingIdSchema.safeParse(feedingId);
      return { id: entry.identifier, ...(parsed.success ? { feedingId: parsed.data } : {}) };
    });
  }
}

function mapPermission(status: Notifications.PermissionStatus): NotificationPermission {
  if (status === Notifications.PermissionStatus.GRANTED) return "granted";
  if (status === Notifications.PermissionStatus.DENIED) return "denied";
  return "undetermined";
}
