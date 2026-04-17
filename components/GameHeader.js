import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Timer from './Timer';

const GameHeader = memo(({ difficulty, mistakes, maxMistakes, mistakesLimitEnabled, timer, timerVisible, isPaused, onPause, onResume, colors }) => {
  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        <Text style={[styles.difficultyText, { color: colors.primary }]}>{diffLabel}</Text>
        {mistakesLimitEnabled && (
          <Text style={[styles.mistakesText, { color: mistakes > 0 ? colors.error : colors.textSecondary }]}>
            Mistakes: {mistakes}/{maxMistakes}
          </Text>
        )}
      </View>
      <View style={styles.right}>
        {timerVisible && (
          <Timer seconds={timer} color={colors.textSecondary} fontSize={16} />
        )}
        <TouchableOpacity
          onPress={isPaused ? onResume : onPause}
          style={[styles.pauseBtn, { backgroundColor: colors.surfaceVariant }]}
        >
          <Text style={{ color: colors.text, fontSize: 14 }}>
            {isPaused ? '▶' : '⏸'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  left: {},
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mistakesText: {
    fontSize: 12,
    marginTop: 2,
  },
  pauseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

GameHeader.displayName = 'GameHeader';
export default GameHeader;
