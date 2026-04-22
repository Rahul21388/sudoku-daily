import React, { memo, useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import SudokuCell from './SudokuCell';

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

  // 9 cells, 8 inner borders (6 thin + 2 thick) + 2 outer thick borders
  // thin borders at col/row 1,2,4,5,7,8 → 6 thin
  // thick borders at col/row 3,6 → 2 thick
  const THIN = 0.5;
  const THICK = 2;
  const innerBorders = THIN * 6 + THICK * 2; // borders between cells
  const outerBorders = THICK * 2;            // left+right outer
  const cellSize = Math.floor((gridSize - innerBorders - outerBorders) / 9);

  const selectedValue = selectedCell
    ? board[selectedCell.row][selectedCell.col]
    : 0;

  const allCells = useMemo(() => {
    const cells = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        cells.push({ row, col });
      }
    }
    return cells;
  }, []);

  // For a given col index (0-8), return right border width
  function rightBorder(col) {
    if (col === 8) return 0;
    if (col === 2 || col === 5) return THICK;
    return THIN;
  }

  // For a given row index (0-8), return bottom border width
  function bottomBorder(row) {
    if (row === 8) return 0;
    if (row === 2 || row === 5) return THICK;
    return THIN;
  }

  return (
    <View style={{
      width: cellSize * 9 + innerBorders + outerBorders,
      alignSelf: 'center',
      borderWidth: THICK,
      borderColor: colors.gridLine,
      borderRadius: 4,
      overflow: 'hidden',
      flexDirection: 'row',
      flexWrap: 'wrap',
    }}>
      {allCells.map(({ row, col }) => {
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

        const rb = rightBorder(col);
        const bb = bottomBorder(row);

        return (
          <View
            key={`cell-${row}-${col}`}
            style={{
              borderRightWidth: rb,
              borderBottomWidth: bb,
              borderRightColor: (col === 2 || col === 5) ? colors.gridLine : colors.gridLineThin,
              borderBottomColor: (row === 2 || row === 5) ? colors.gridLine : colors.gridLineThin,
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
  );
});

SudokuGrid.displayName = 'SudokuGrid';
export default SudokuGrid;