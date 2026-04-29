import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@sudoku_settings';

const defaultSettings = {
  theme: 'system', // 'light' | 'dark' | 'system'
  hapticEnabled: true,
  mistakesLimit: true,
  highlightPeers: true,
  highlightSameNumber: true,
  autoRemoveNotes: true,
  timerVisible: true,
};

export const useSettingsStore = create((set, get) => ({
  ...defaultSettings,
  loaded: false,

  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({ ...parsed, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  updateSetting: async (key, value) => {
    set({ [key]: value });
    const state = get();
    const toSave = {};
    for (const k of Object.keys(defaultSettings)) {
      toSave[k] = state[k];
    }
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
  },

  resetSettings: async () => {
    set({ ...defaultSettings });
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    } catch {
      // Silently fail — in-memory state is already reset
    }
  },
}));