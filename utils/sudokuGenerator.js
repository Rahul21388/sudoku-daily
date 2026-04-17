// Sudoku puzzle generator - generates valid puzzles with unique solutions

const EMPTY = 0;

function createEmptyGrid() {
  return Array.from({ length: 9 }, () => Array(9).fill(EMPTY));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(grid, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false;
    if (grid[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (grid[i][j] === num) return false;
    }
  }
  return true;
}

function solveSudoku(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === EMPTY) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) return true;
            grid[row][col] = EMPTY;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function countSolutions(grid, limit = 2) {
  let count = 0;
  function solve(g) {
    if (count >= limit) return;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (g[row][col] === EMPTY) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(g, row, col, num)) {
              g[row][col] = num;
              solve(g);
              g[row][col] = EMPTY;
            }
          }
          return;
        }
      }
    }
    count++;
  }
  solve(grid);
  return count;
}

function generateFullGrid() {
  const grid = createEmptyGrid();
  solveSudoku(grid);
  return grid;
}

const DIFFICULTY_CLUES = {
  easy: { min: 36, max: 42 },
  medium: { min: 30, max: 35 },
  hard: { min: 25, max: 29 },
  expert: { min: 20, max: 24 },
};

export function generatePuzzle(difficulty = 'medium') {
  const solution = generateFullGrid();
  const puzzle = solution.map(row => [...row]);

  const { min, max } = DIFFICULTY_CLUES[difficulty] || DIFFICULTY_CLUES.medium;
  const targetClues = min + Math.floor(Math.random() * (max - min + 1));
  const cellsToRemove = 81 - targetClues;

  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
  );

  let removed = 0;
  for (const [row, col] of positions) {
    if (removed >= cellsToRemove) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = EMPTY;

    const testGrid = puzzle.map(r => [...r]);
    if (countSolutions(testGrid) === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return {
    puzzle: puzzle.map(r => [...r]),
    solution: solution.map(r => [...r]),
    difficulty,
    clues: 81 - removed,
  };
}

export function flattenGrid(grid) {
  return grid.map(row => row.join('')).join('');
}

export function unflattenGrid(str) {
  const grid = [];
  for (let i = 0; i < 9; i++) {
    const row = [];
    for (let j = 0; j < 9; j++) {
      row.push(parseInt(str[i * 9 + j], 10));
    }
    grid.push(row);
  }
  return grid;
}
