import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, AppState, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useHaptic } from '../hooks/useHaptic';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import SudokuGrid from '../components/SudokuGrid';
import NumberPad from '../components/NumberPad';
import GameHeader from '../components/GameHeader';

export default function GameScreen({ navigation }) {
  const { colors } = useTheme();
  const haptic = useHaptic();
  const timerRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  const board = useGameStore(s => s.board);
  const solution = useGameStore(s => s.solution);
  const initialCells = useGameStore(s => s.initialCells);
  const notes = useGameStore(s => s.notes);
  const selectedCell = useGameStore(s => s.selectedCell);
  const mistakes = useGameStore(s => s.mistakes);
  const maxMistakes = useGameStore(s => s.maxMistakes);
  const hintsUsed = useGameStore(s => s.hintsUsed);
  const maxHints = useGameStore(s => s.maxHints);
  const timer = useGameStore(s => s.timer);
  const isRunning = useGameStore(s => s.isRunning);
  const isPaused = useGameStore(s => s.isPaused);
  const isComplete = useGameStore(s => s.isComplete);
  const isFailed = useGameStore(s => s.isFailed);
  const notesMode = useGameStore(s => s.notesMode);
  const difficulty = useGameStore(s => s.difficulty);

  const selectCell = useGameStore(s => s.selectCell);
  const inputNumber = useGameStore(s => s.inputNumber);
  const eraseCell = useGameStore(s => s.eraseCell);
  const useHintAction = useGameStore(s => s.useHint);
  const toggleNotesMode = useGameStore(s => s.toggleNotesMode);
  const tick = useGameStore(s => s.tick);
  const pauseGame = useGameStore(s => s.pauseGame);
  const resumeGame = useGameStore(s => s.resumeGame);
  const recordGameResult = useGameStore(s => s.recordGameResult);
  const clearGame = useGameStore(s => s.clearGame);

  const mistakesLimitEnabled = useSettingsStore(s => s.mistakesLimit);
  const highlightPeers = useSettingsStore(s => s.highlightPeers);
  const highlightSameNumber = useSettingsStore(s => s.highlightSameNumber);
  const timerVisible = useSettingsStore(s => s.timerVisible);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [tick]);

  // App state - pause on background
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (appStateRef.current.match(/active/) && nextState.match(/inactive|background/)) {
        pauseGame();
      }
      appStateRef.current = nextState;
    });
    return () => sub?.remove();
  }, [pauseGame]);

  // Handle back button — fixed for RN 0.81 (subscription pattern)
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        pauseGame();
        Alert.alert(
          'Leave Game',
          'Your progress will be saved.',
          [
            { text: 'Stay', style: 'cancel', onPress: resumeGame },
            { text: 'Leave', onPress: () => navigation.goBack() },
          ]
        );
        return true;
      });
      return () => subscription.remove();
    }, [pauseGame, resumeGame, navigation])
  );

  // Game completion
  useEffect(() => {
    if (isComplete) {
      haptic.success();
      recordGameResult(true);
    }
  }, [isComplete]);

  useEffect(() => {
    if (isFailed) {
      haptic.error();
      recordGameResult(false);
    }
  }, [isFailed]);

  const handleCellPress = (row, col) => {
    haptic.selection();
    selectCell(row, col);
  };

  const handleNumber = (num) => {
    haptic.light();
    inputNumber(num, mistakesLimitEnabled);
  };

  const handleErase = () => {
    haptic.light();
    eraseCell();
  };

  const handleHint = () => {
    const used = useHintAction();
    if (used) haptic.medium();
  };

  const handleNotes = () => {
    haptic.selection();
    toggleNotesMode();
  };

  const handleNewGame = () => {
    clearGame();
    navigation.goBack();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isComplete || isFailed) {
    return (
      <View style={[styles.overlay, { backgroundColor: colors.background }]}>
        <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.resultEmoji}>{isComplete ? '🎉' : '😞'}</Text>
          <Text style={[styles.resultTitle, { color: colors.text }]}>
            {isComplete ? 'Congratulations!' : 'Game Over'}
          </Text>
          <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
            {isComplete
              ? `You solved the ${difficulty} puzzle!`
              : `You ran out of chances.`}
          </Text>
          <View style={styles.resultStats}>
            <View style={styles.resultStat}>
              <Text style={[styles.resultStatValue, { color: colors.primary }]}>
                {formatTime(timer)}
              </Text>
              <Text style={[styles.resultStatLabel, { color: colors.textMuted }]}>Time</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={[styles.resultStatValue, { color: colors.error }]}>
                {mistakes}
              </Text>
              <Text style={[styles.resultStatLabel, { color: colors.textMuted }]}>Mistakes</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={[styles.resultStatValue, { color: colors.warning }]}>
                {hintsUsed}
              </Text>
              <Text style={[styles.resultStatLabel, { color: colors.textMuted }]}>Hints</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.newGameBtn, { backgroundColor: colors.primary }]}
            onPress={handleNewGame}
          >
            <Text style={styles.newGameBtnText}>New Game</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isPaused) {
    return (
      <View style={[styles.overlay, { backgroundColor: colors.background }]}>
        <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.resultEmoji}>⏸️</Text>
          <Text style={[styles.resultTitle, { color: colors.text }]}>Game Paused</Text>
          <TouchableOpacity
            style={[styles.newGameBtn, { backgroundColor: colors.primary }]}
            onPress={resumeGame}
          >
            <Text style={styles.newGameBtnText}>Resume</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GameHeader
        difficulty={difficulty}
        mistakes={mistakes}
        maxMistakes={maxMistakes}
        mistakesLimitEnabled={mistakesLimitEnabled}
        timer={timer}
        timerVisible={timerVisible}
        isPaused={isPaused}
        onPause={pauseGame}
        onResume={resumeGame}
        colors={colors}
      />

      <View style={styles.gridContainer}>
        <SudokuGrid
          board={board}
          solution={solution}
          initialCells={initialCells}
          notes={notes}
          selectedCell={selectedCell}
          highlightPeers={highlightPeers}
          highlightSameNumber={highlightSameNumber}
          onCellPress={handleCellPress}
          colors={colors}
        />
      </View>

      <NumberPad
        onNumber={handleNumber}
        onErase={handleErase}
        onHint={handleHint}
        onNotes={handleNotes}
        notesMode={notesMode}
        hintsRemaining={maxHints - hintsUsed}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 48 },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    zIndex: 10,
  },
  resultCard: {
    width: '100%',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  resultEmoji: { fontSize: 48, marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  resultSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  resultStats: { flexDirection: 'row', gap: 32, marginBottom: 24 },
  resultStat: { alignItems: 'center' },
  resultStatValue: { fontSize: 24, fontWeight: '700' },
  resultStatLabel: { fontSize: 11, marginTop: 4 },
  newGameBtn: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },
  newGameBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});