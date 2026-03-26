import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForNotifications(): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== 'granted') return null;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

export async function scheduleStreakReminder(
  t: (key: string) => string,
  hour: number,
  minute: number,
  streak: number
): Promise<string | null> {
  await cancelAllNotifications();
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: t('profile.notifications'),
      body: t('notifications.streak_body').replace('{streak}', String(streak)),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return id;
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
