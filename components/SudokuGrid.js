import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SudokuCell from './SudokuCell';

const GRID_PADDING = 2;
const THICK_BORDER = 2;
const THIN_BORDER = 0.5;

const SudokuGrid = memo(({
  board,
  solution,
  initialCells,
  notes,
  selectedCell,
  highlightPeers,
  highlightSameNumber,
  onCellPress,
  colors,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const gridSize = screenWidth - 32;
  const totalBorderWidth = THICK_BORDER * 4 + THIN_BORDER * 6;
  const cellSize = (gridSize - totalBorderWidth - GRID_PADDING * 2) / 9;

  const selectedValue = selectedCell
    ? board[selectedCell.row][selectedCell.col]
    : 0;

  const cells = useMemo(() => {
    const result = [];
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const boxCells = [];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const row = boxRow * 3 + r;
            const col = boxCol * 3 + c;
            boxCells.push({ row, col });
          }
        }
        result.push({ boxRow, boxCol, cells: boxCells });
      }
    }
    return result;
  }, []);

  return (
    <View
      style={[
        styles.grid,
        {
          width: gridSize,
          backgroundColor: colors.gridLine,
          borderColor: colors.gridLine,
          borderWidth: THICK_BORDER,
          borderRadius: 4,
          padding: 0,
        },
      ]}
    >
      <View style={styles.boxesContainer}>
        {cells.map(({ boxRow, boxCol, cells: boxCells }) => (
          <View
            key={`box-${boxRow}-${boxCol}`}
            style={[
              styles.box,
              {
                borderColor: colors.gridLine,
                borderWidth: THICK_BORDER / 2,
              },
            ]}
          >
            {boxCells.map(({ row, col }) => {
              const value = board[row][col];
              const isInitial = initialCells[row][col] === 1;
              const isSelected = selectedCell?.row === row && selectedCell?.col === col;
              const isError = value !== 0 && !isInitial && value !== solution[row][col];

              let isPeer = false;
              let isSameNumber = false;

              if (selectedCell && !isSelected) {
                if (highlightPeers) {
                  isPeer =
                    selectedCell.row === row ||
                    selectedCell.col === col ||
                    (Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
                      Math.floor(selectedCell.col / 3) === Math.floor(col / 3));
                }
                if (highlightSameNumber && selectedValue !== 0 && value === selectedValue) {
                  isSameNumber = true;
                }
              }

              return (
                <View
                  key={`cell-${row}-${col}`}
                  style={{
                    borderColor: colors.gridLineThin,
                    borderWidth: THIN_BORDER,
                  }}
                >
                  <SudokuCell
                    value={value}
                    notes={notes[row][col]}
                    isInitial={isInitial}
                    isSelected={isSelected}
                    isPeer={isPeer}
                    isSameNumber={isSameNumber}
                    isError={isError}
                    onPress={() => onCellPress(row, col)}
                    colors={colors}
                    size={cellSize}
                  />
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    alignSelf: 'center',
    overflow: 'hidden',
  },
  boxesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  box: {
    width: '33.333%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

SudokuGrid.displayName = 'SudokuGrid';
export default SudokuGrid;
