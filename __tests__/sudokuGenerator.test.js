import { generatePuzzle, flattenGrid, unflattenGrid } from '../utils/sudokuGenerator';

describe('Sudoku Generator', () => {
  test('generates a valid 9x9 grid', () => {
    const { puzzle, solution } = generatePuzzle('easy');
    expect(puzzle.length).toBe(9);
    expect(puzzle[0].length).toBe(9);
    expect(solution.length).toBe(9);
    expect(solution[0].length).toBe(9);
  });

  test('solution grid is completely filled', () => {
    const { solution } = generatePuzzle('medium');
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        expect(solution[r][c]).toBeGreaterThan(0);
        expect(solution[r][c]).toBeLessThanOrEqual(9);
      }
    }
  });

  test('puzzle matches solution in non-zero cells', () => {
    const { puzzle, solution } = generatePuzzle('hard');
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] !== 0) {
          expect(puzzle[r][c]).toBe(solution[r][c]);
        }
      }
    }
  });

  test('flatten and unflatten work correctly', () => {
    const { puzzle } = generatePuzzle('expert');
    const flat = flattenGrid(puzzle);
    expect(flat.length).toBe(81);
    const unflat = unflattenGrid(flat);
    expect(unflat).toEqual(puzzle);
  });
});
