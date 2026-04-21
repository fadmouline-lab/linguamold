import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const web = Platform.OS === 'web';

export function tap(): void {
  if (web) return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function success(): void {
  if (web) return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function error(): void {
  if (web) return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export function celebration(): void {
  if (web) return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setTimeout(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 100);
  setTimeout(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 220);
}
