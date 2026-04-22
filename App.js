import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useSettingsStore } from './store/settingsStore';
import { useGameStore } from './store/gameStore';
import { useTheme } from './hooks/useTheme';
import AppNavigator from './navigation/AppNavigator';

function AppContent() {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={false}
      />
      <AppNavigator />
    </View>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const loadSettings = useSettingsStore(s => s.loadSettings);
  const loadStats = useGameStore(s => s.loadStats);

  useEffect(() => {
    async function init() {
      await Promise.all([loadSettings(), loadStats()]);
      setReady(true);
    }
    init();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Sudoku Daily</Text>
      </View>
    );
  }

  return <AppContent />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 16,
  },
});
