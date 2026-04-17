import React, { memo } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

const SudokuCell = memo(({
  value,
  notes,
  isInitial,
  isSelected,
  isPeer,
  isSameNumber,
  isError,
  onPress,
  colors,
  size,
}) => {
  let bgColor = colors.surface;
  if (isSelected) bgColor = colors.selectedCell;
  else if (isError) bgColor = colors.errorLight;
  else if (isSameNumber) bgColor = colors.sameNumberHighlight;
  else if (isPeer) bgColor = colors.peerHighlight;

  let textColor = colors.text;
  if (isSelected) textColor = colors.selectedCellText;
  else if (isError && !isInitial) textColor = colors.error;
  else if (!isInitial && value !== 0) textColor = colors.primary;

  const noteSize = size / 3;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: bgColor,
        },
      ]}
    >
      {value !== 0 ? (
        <Text
          style={[
            styles.cellText,
            {
              color: textColor,
              fontSize: size * 0.5,
              fontWeight: isInitial ? '700' : '500',
            },
          ]}
        >
          {value}
        </Text>
      ) : notes && notes.length > 0 ? (
        <View style={styles.notesContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <View key={n} style={[styles.noteCell, { width: noteSize, height: noteSize }]}>
              {notes.includes(n) && (
                <Text style={[styles.noteText, { color: colors.noteText, fontSize: noteSize * 0.7 }]}>
                  {n}
                </Text>
              )}
            </View>
          ))}
        </View>
      ) : null}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    textAlign: 'center',
  },
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteText: {
    textAlign: 'center',
  },
});

SudokuCell.displayName = 'SudokuCell';
export default SudokuCell;
