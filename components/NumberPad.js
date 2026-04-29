import React, { memo, useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Derive which digits have been placed exactly 9 times
const getCompletedDigits = (board) => {
  if (!board) return new Set();
  const counts = {};
  for (const row of board) {
    for (const cell of row) {
      if (cell && cell >= 1 && cell <= 9) {
        counts[cell] = (counts[cell] || 0) + 1;
      }
    }
  }
  return new Set(Object.keys(counts).filter(d => counts[d] === 9).map(Number));
};

const NumberPad = memo(({ onNumber, onErase, onHint, onNotes, notesMode, hintsRemaining, colors, board }) => {
  const insets = useSafeAreaInsets();

  const completedDigits = useMemo(() => getCompletedDigits(board), [board]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.numbersRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const isCompleted = completedDigits.has(num);
          return (
            <TouchableOpacity
              key={num}
              style={[
                styles.numBtn,
                { backgroundColor: isCompleted ? colors.numPadBg : colors.numPadBg },
                isCompleted && styles.numBtnCompleted,
              ]}
              onPress={() => !isCompleted && onNumber(num)}
              activeOpacity={isCompleted ? 1 : 0.6}
            >
              <Text style={[
                styles.numText,
                { color: isCompleted ? colors.textSecondary : colors.numPadText },
                isCompleted && styles.numTextCompleted,
              ]}>
                {num}
              </Text>
              {isCompleted && (
                <Text style={[styles.completedTick, { color: colors.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.numPadBg }]}
          onPress={onErase}
          activeOpacity={0.6}
        >
          <Text style={[styles.actionIcon, { color: colors.textSecondary }]}>⌫</Text>
          <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Erase</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: notesMode ? colors.primary : colors.numPadBg },
          ]}
          onPress={onNotes}
          activeOpacity={0.6}
        >
          <Text style={[styles.actionIcon, { color: notesMode ? colors.selectedCellText : colors.textSecondary }]}>
            ✏️
          </Text>
          <Text style={[styles.actionLabel, { color: notesMode ? colors.selectedCellText : colors.textSecondary }]}>
            Notes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: colors.numPadBg, opacity: hintsRemaining > 0 ? 1 : 0.4 },
          ]}
          onPress={onHint}
          disabled={hintsRemaining <= 0}
          activeOpacity={0.6}
        >
          <Text style={[styles.actionIcon, { color: colors.warning }]}>💡</Text>
          <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>
            Hint ({hintsRemaining})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  numBtn: {
    width: 36,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  numBtnCompleted: {
    opacity: 0.35,
  },
  numText: {
    fontSize: 22,
    fontWeight: '600',
  },
  numTextCompleted: {
    fontSize: 18,
  },
  completedTick: {
    position: 'absolute',
    top: 2,
    right: 3,
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});

NumberPad.displayName = 'NumberPad';
export default NumberPad;