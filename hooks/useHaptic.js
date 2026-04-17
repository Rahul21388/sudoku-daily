import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../store/settingsStore';

export function useHaptic() {
  const hapticEnabled = useSettingsStore(s => s.hapticEnabled);

  return {
    light: () => hapticEnabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    medium: () => hapticEnabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    heavy: () => hapticEnabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
    success: () => hapticEnabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    error: () => hapticEnabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    selection: () => hapticEnabled && Haptics.selectionAsync(),
  };
}
