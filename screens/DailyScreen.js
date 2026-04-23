import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useTheme } from '../hooks/useTheme';
import { useGameStore } from '../store/gameStore';
import { unflattenGrid } from '../utils/sudokuGenerator';
import HowToPlayModal from '../components/HowToPlayModal';


export default function DailyScreen({ navigation }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [dailyPuzzle, setDailyPuzzle] = useState(null);
  const stats = useGameStore(s => s.stats);
  const startGame = useGameStore(s => s.startGame);

  const today = dayjs().format('YYYY-MM-DD');
  const displayDate = dayjs().format('dddd, MMMM D');

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'dailyPuzzles', today));
      if (snap.exists()) {
        setDailyPuzzle(snap.data());
      } else {
        setDailyPuzzle(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDaily();
    }, [today])
  );

  const handlePlay = () => {
    if (!dailyPuzzle) return;
    startGame({
      puzzle: unflattenGrid(dailyPuzzle.puzzle),
      solution: unflattenGrid(dailyPuzzle.solution),
      difficulty: dailyPuzzle.difficulty,
      mode: 'daily',
      date: today,
    });
    navigation.navigate('Game');
  };

  const isCompleted = stats.dailyHistory && stats.dailyHistory[today]?.completed;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
  <View>
    <Text style={[styles.title, { color: colors.text }]}>Sudoku Daily</Text>
    <Text style={[styles.date, { color: colors.textSecondary }]}>{displayDate}</Text>
  </View>
  <TouchableOpacity
    onPress={() => setShowHelp(true)}
    style={[styles.helpBtn, { backgroundColor: colors.surface }]}
  >
    <Text style={[styles.helpBtnText, { color: colors.primary }]}>?</Text>
  </TouchableOpacity>
</View>

<HowToPlayModal visible={showHelp} onClose={() => setShowHelp(false)} />

      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Daily Challenge</Text>
        <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
          Same puzzle for everyone, every day
        </Text>

        <View style={styles.cardContent}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : dailyPuzzle ? (
            <>
              <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {dailyPuzzle.difficulty.toUpperCase()}
                </Text>
              </View>

              {isCompleted ? (
                <View style={styles.completedContainer}>
                  <Text style={[styles.completedText, { color: colors.success }]}>✅ Completed</Text>
                  <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                    Time: {Math.floor(stats.dailyHistory[today].time / 60)}:{(stats.dailyHistory[today].time % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.playBtn, { backgroundColor: colors.primary }]}
                  onPress={handlePlay}
                >
                  <Text style={styles.playBtnText}>Play Today's Puzzle</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>No daily puzzle available for today.</Text>
              <TouchableOpacity onPress={fetchDaily} style={styles.retryBtn}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.streakCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Your Streak</Text>
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <Text style={[styles.streakValue, { color: colors.primary }]}>{stats.currentStreak}</Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Current</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.streakItem}>
            <Text style={[styles.streakValue, { color: colors.warning }]}>{stats.bestStreak}</Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Best</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.streakItem}>
            <Text style={[styles.streakValue, { color: colors.success }]}>{stats.gamesWon}</Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Won</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
  marginTop: 12,
  marginBottom: 24,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
  title: { fontSize: 32, fontWeight: '800' },
  date: { fontSize: 16, marginTop: 4, fontWeight: '500' },
  card: {
    padding: 24,
    borderRadius: 24,
    elevation: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 20, fontWeight: '700' },
  cardSub: { fontSize: 14, marginTop: 4, marginBottom: 20 },
  cardContent: { alignItems: 'center', minHeight: 120, justifyContent: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 20 },
  badgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  playBtn: { width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  playBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  completedContainer: { alignItems: 'center' },
  completedText: { fontSize: 18, fontWeight: '700' },
  timeText: { fontSize: 14, marginTop: 4 },
  errorContainer: { alignItems: 'center' },
  errorText: { textAlign: 'center', fontSize: 14, marginBottom: 12 },
  retryBtn: { padding: 10, backgroundColor: '#EBF2FF', borderRadius: 8, paddingHorizontal: 20 },
  streakCard: {
    padding: 24,
    borderRadius: 24,
    elevation: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8,
  },
  streakRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, alignItems: 'center' },
  streakItem: { alignItems: 'center', flex: 1 },
  streakValue: { fontSize: 28, fontWeight: '800' },
  streakLabel: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  divider: { width: 1, height: 40, backgroundColor: '#E2E8F0' },

  helpBtn: {
  width: 38,
  height: 38,
  borderRadius: 19,
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 2,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
},
helpBtnText: {
  fontSize: 18,
  fontWeight: '800',
},
});
