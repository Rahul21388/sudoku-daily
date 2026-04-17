import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../config/theme';
import { useSettingsStore } from '../store/settingsStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const themeSetting = useSettingsStore(s => s.theme);

  let scheme;
  if (themeSetting === 'system') {
    scheme = systemScheme || 'light';
  } else {
    scheme = themeSetting;
  }

  return {
    colors: scheme === 'dark' ? darkTheme : lightTheme,
    isDark: scheme === 'dark',
    scheme,
  };
}
