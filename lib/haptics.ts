import * as Haptics from 'expo-haptics';

export function tap(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function success(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function error(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export function celebration(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setTimeout(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 100);
  setTimeout(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 220);
}
