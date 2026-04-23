import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useGameStore } from '../store/gameStore';

export default function StatsScreen() {
  const { colors } = useTheme();
  const stats = useGameStore(s => s.stats);

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const avgTime = stats.gamesWon > 0
    ? Math.round(stats.totalTime / stats.gamesWon)
    : 0;

  const formatTime = (secs) => {
    if (!secs) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>

        <View style={styles.statsGrid}>
          {[
            { value: stats.gamesPlayed, label: 'Played' },
            { value: `${winRate}%`, label: 'Win Rate' },
            { value: stats.currentStreak, label: 'Streak' },
            { value: stats.bestStreak, label: 'Best Streak' },
          ].map((item, idx) => (
            <View
              key={idx}
              style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}
            >
              <Text style={[styles.statValue, { color: colors.primary }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Best Times</Text>
          {['easy', 'medium', 'hard', 'expert'].map(diff => (
            <View key={diff} style={[styles.bestRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.bestDiff, { color: colors.text }]}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </Text>
              <Text style={[styles.bestTime, { color: colors.primary }]}>
                {formatTime(stats.bestTimes[diff])}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Average Time</Text>
          <Text style={[styles.avgTime, { color: colors.primary }]}>{formatTime(avgTime)}</Text>
          <Text style={[styles.avgLabel, { color: colors.textSecondary }]}>per completed game</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 24, marginTop: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4, fontWeight: '500' },
  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  bestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  bestDiff: { fontSize: 15, fontWeight: '500' },
  bestTime: { fontSize: 15, fontWeight: '700' },
  avgTime: { fontSize: 32, fontWeight: '800', textAlign: 'center' },
  avgLabel: { fontSize: 13, textAlign: 'center', marginTop: 4 },
});
