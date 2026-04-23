import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useGameStore } from '../store/gameStore';
import { generatePuzzle } from '../utils/sudokuGenerator';

const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];

export default function PlayScreen({ navigation }) {
  const { colors } = useTheme();
  const [difficulty, setDifficulty] = useState('medium');
  const startGame = useGameStore(s => s.startGame);

  const handleStart = () => {
    const { puzzle, solution } = generatePuzzle(difficulty);
    startGame({
      puzzle,
      solution,
      difficulty,
      mode: 'random',
      date: null,
    });
    navigation.navigate('Game');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>New Game</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select your difficulty level</Text>

      <View style={styles.options}>
        {DIFFICULTIES.map(diff => (
          <TouchableOpacity
            key={diff}
            style={[
              styles.option,
              { backgroundColor: colors.surface, borderColor: colors.border },
              difficulty === diff && { borderColor: colors.primary, borderWidth: 2 }
            ]}
            onPress={() => setDifficulty(diff)}
          >
            <Text style={[
              styles.optionText,
              { color: colors.text },
              difficulty === diff && { color: colors.primary, fontWeight: '700' }
            ]}>
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </Text>
            {difficulty === diff && <Text style={{ fontSize: 18 }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: colors.primary }]}
        onPress={handleStart}
      >
        <Text style={styles.startBtnText}>Start Puzzle</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginTop: 8, marginBottom: 40 },
  options: { gap: 12, marginBottom: 40 },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionText: { fontSize: 18, fontWeight: '500' },
  startBtn: { paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  startBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
