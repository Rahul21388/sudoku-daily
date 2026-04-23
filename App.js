import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useSettingsStore } from './store/settingsStore';
import { useGameStore } from './store/gameStore';
import { useTheme } from './hooks/useTheme';
import AppNavigator from './navigation/AppNavigator';

function AppContent() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent />
      <AppNavigator />
    </>
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
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Sudoku Daily</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
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