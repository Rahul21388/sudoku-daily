import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useMiniSudokuStore } from '../store/miniSudokuStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BOARD_SIZE = Math.min(SCREEN_WIDTH * 0.92, 360);
const CELL_SIZE = BOARD_SIZE / 6;

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─────────────────────────────────────────────────────────
// Cell
// Box layout: 2 rows × 3 cols per box
//   Thick vertical divider:   after col 2  (col === 2)
//   Thick horizontal divider: after row 1 and row 3
// ─────────────────────────────────────────────────────────
function Cell({ row, col, value, isGiven, isSelected, isHighlighted, isConflict, isPeerHighlight, notes, onPress, colors }) {
  // Box shading
  const boxRow = Math.floor(row / 2);
  const boxCol = Math.floor(col / 3);
  const isEvenBox = (boxRow + boxCol) % 2 === 0;

  let bgColor = isEvenBox ? colors.background : (colors.surface ?? colors.background);
  if (isSelected)                        bgColor = colors.primary;
  else if (isConflict)                   bgColor = '#FF444433';
  else if (isHighlighted || isPeerHighlight) bgColor = colors.primaryLight ?? colors.primary + '22';

  const textColor = isSelected   ? '#FFFFFF'
    : isConflict                 ? '#FF4444'
    : isGiven                    ? colors.text
    : colors.primary;

  const noteSet = notes instanceof Set ? notes : new Set();

  // Border after col 2 = thick vertical box divider
  const rightBorderWidth  = col === 2 ? 2.5 : col < 5 ? 0.5 : 0;
  const rightBorderColor  = col === 2 ? colors.text : colors.border;
  // Border after row 1 and row 3 = thick horizontal box divider
  const bottomBorderWidth = (row === 1 || row === 3) ? 2.5 : row < 5 ? 0.5 : 0;
  const bottomBorderColor = (row === 1 || row === 3) ? colors.text : colors.border;

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: bgColor,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: rightBorderWidth,
        borderRightColor: rightBorderColor,
        borderBottomWidth: bottomBorderWidth,
        borderBottomColor: bottomBorderColor,
      }}
    >
      {value !== 0 ? (
        <Text style={{ fontSize: CELL_SIZE * 0.42, fontWeight: isGiven ? '700' : '500', color: textColor }}>
          {value}
        </Text>
      ) : noteSet.size > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: CELL_SIZE - 4, padding: 1 }}>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <Text key={n} style={{
              width: (CELL_SIZE - 6) / 3,
              fontSize: CELL_SIZE * 0.18,
              textAlign: 'center',
              color: noteSet.has(n) ? (colors.textMuted ?? colors.text + 'AA') : 'transparent',
            }}>
              {n}
            </Text>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────
// Board — renders as 6 explicit rows (no flexWrap)
// ─────────────────────────────────────────────────────────
function Board({ board, puzzle, selectedCell, conflicts, notes, onCellPress, colors }) {
  const selRow = selectedCell?.row ?? -1;
  const selCol = selectedCell?.col ?? -1;
  const selVal = selRow >= 0 ? board[selRow][selCol] : 0;
  const getBox = (r, c) => Math.floor(r / 2) * 2 + Math.floor(c / 3);

  return (
    <View style={{ borderWidth: 2.5, borderColor: colors.text, borderRadius: 4, overflow: 'hidden' }}>
      {board.map((rowData, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {rowData.map((val, c) => {
            const isSelected     = r === selRow && c === selCol;
            const sameBox        = selRow >= 0 && getBox(r, c) === getBox(selRow, selCol);
            const isHighlighted  = !isSelected && (r === selRow || c === selCol || sameBox);
            const isPeerHighlight = !isSelected && selVal !== 0 && val === selVal;
            const isConflict     = conflicts.has(`${r},${c}`);
            const isGiven        = puzzle[r][c] !== 0;

            return (
              <Cell
                key={c}
                row={r} col={c}
                value={val}
                isGiven={isGiven}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                isConflict={isConflict}
                isPeerHighlight={isPeerHighlight}
                notes={notes[`${r},${c}`]}
                onPress={() => onCellPress(r, c)}
                colors={colors}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Number Pad
// ─────────────────────────────────────────────────────────
function NumberPad({ onPress, colors }) {
  return (
    <View style={styles.numPad}>
      {[1, 2, 3, 4, 5, 6].map(n => (
        <TouchableOpacity
          key={n}
          style={[styles.numBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => onPress(n)}
          activeOpacity={0.7}
        >
          <Text style={[styles.numBtnText, { color: colors.text }]}>{n}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────
export default function MiniSudokuScreen() {
  const { colors } = useTheme();
  const {
    puzzle, board, notes,
    selectedCell, isNoteMode, conflicts, isComplete, isLoading,
    elapsedSeconds, mistakeCount, hintsUsed,
    startNewGame, selectCell, inputNumber, eraseCell,
    toggleNoteMode, useHint, tickTimer, resetGame,
  } = useMiniSudokuStore();

  useEffect(() => {
    const isEmpty = board.flat().every(v => v === 0);
    if (isEmpty) startNewGame();
  }, []);

  useEffect(() => {
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCellPress = useCallback((r, c) => {
    if (selectedCell?.row === r && selectedCell?.col === c) {
      useMiniSudokuStore.getState().clearSelection();
    } else {
      selectCell(r, c);
    }
  }, [selectedCell]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textMuted ?? colors.text, marginTop: 12, fontSize: 14 }}>
            Generating puzzle…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Mini Sudoku</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted ?? colors.text + '88' }]}>
            6×6 · Fill 1–6 in each row, column & box
          </Text>
        </View>
        <TouchableOpacity style={[styles.newGameBtn, { backgroundColor: colors.primary }]} onPress={startNewGame}>
          <Text style={styles.newGameBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={[styles.statsRow, { borderColor: colors.border }]}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted ?? colors.text + '88'} />
          <Text style={[styles.statText, { color: colors.text }]}>{formatTime(elapsedSeconds)}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="close-circle-outline" size={14} color={colors.textMuted ?? colors.text + '88'} />
          <Text style={[styles.statText, { color: colors.text }]}>{mistakeCount} {mistakeCount === 1 ? 'mistake' : 'mistakes'}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="bulb-outline" size={14} color={colors.textMuted ?? colors.text + '88'} />
          <Text style={[styles.statText, { color: colors.text }]}>{hintsUsed} {hintsUsed === 1 ? 'hint' : 'hints'}</Text>
        </View>
      </View>

      {/* Completion Banner */}
      {isComplete && (
        <View style={[styles.completeBanner, { backgroundColor: colors.primary + '22', borderColor: colors.primary }]}>
          <Text style={[styles.completeText, { color: colors.primary }]}>🎉 Solved in {formatTime(elapsedSeconds)}!</Text>
          <TouchableOpacity onPress={startNewGame}>
            <Text style={[styles.playAgainText, { color: colors.primary }]}>Play Again →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Board */}
      <View style={styles.boardContainer}>
        <Board
          board={board}
          puzzle={puzzle}
          selectedCell={selectedCell}
          conflicts={conflicts}
          notes={notes}
          onCellPress={handleCellPress}
          colors={colors}
        />
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={eraseCell}>
          <Ionicons name="backspace-outline" size={22} color={colors.text} />
          <Text style={[styles.toolLabel, { color: colors.textMuted ?? colors.text + '88' }]}>Erase</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolBtn, isNoteMode && { backgroundColor: colors.primary + '22', borderRadius: 10 }]}
          onPress={toggleNoteMode}
        >
          <Ionicons name="pencil-outline" size={22} color={isNoteMode ? colors.primary : colors.text} />
          <Text style={[styles.toolLabel, { color: isNoteMode ? colors.primary : (colors.textMuted ?? colors.text + '88') }]}>
            Notes {isNoteMode ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolBtn} onPress={useHint}>
          <Ionicons name="bulb-outline" size={22} color={colors.text} />
          <Text style={[styles.toolLabel, { color: colors.textMuted ?? colors.text + '88' }]}>Hint</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolBtn} onPress={resetGame}>
          <Ionicons name="refresh-outline" size={22} color={colors.text} />
          <Text style={[styles.toolLabel, { color: colors.textMuted ?? colors.text + '88' }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Number Pad */}
      <NumberPad onPress={inputNumber} colors={colors} />

      <View style={{ height: 12 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title:           { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  subtitle:        { fontSize: 12, marginTop: 2 },
  newGameBtn:      { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  newGameBtnText:  { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 13, fontWeight: '500' },

  completeBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completeText:  { fontSize: 15, fontWeight: '600' },
  playAgainText: { fontSize: 14, fontWeight: '600' },

  boardContainer: { alignItems: 'center', marginBottom: 20 },

  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  toolBtn:   { alignItems: 'center', gap: 4, padding: 8, minWidth: 64 },
  toolLabel: { fontSize: 11, fontWeight: '500' },

  numPad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 8,
  },
  numBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 52,
  },
  numBtnText: { fontSize: 20, fontWeight: '600' },
});