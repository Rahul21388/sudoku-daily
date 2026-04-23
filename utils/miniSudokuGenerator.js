/**
 * Mini Sudoku (6x6) Generator & Solver
 * Grid: 6 rows x 6 cols, divided into six 2x3 boxes
 * Numbers: 1–6, each appearing once per row, column, and box
 */

// Returns which 2x3 box a cell belongs to (0–5)
export function getBoxIndex(row, col) {
  return Math.floor(row / 2) * 2 + Math.floor(col / 3);
}

// Returns all cell indices in the same box as (row, col)
function getBoxCells(row, col) {
  const boxRow = Math.floor(row / 2) * 2;
  const boxCol = Math.floor(col / 3) * 3;
  const cells = [];
  for (let r = boxRow; r < boxRow + 2; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      cells.push([r, c]);
    }
  }
  return cells;
}

function isValid(board, row, col, num) {
  // Check row
  for (let c = 0; c < 6; c++) {
    if (board[row][c] === num) return false;
  }
  // Check column
  for (let r = 0; r < 6; r++) {
    if (board[r][col] === num) return false;
  }
  // Check 2x3 box
  const boxCells = getBoxCells(row, col);
  for (const [r, c] of boxCells) {
    if (board[r][c] === num) return false;
  }
  return true;
}

function solve(board) {
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (board[r][c] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6]);
        for (const num of nums) {
          if (isValid(board, r, c, num)) {
            board[r][c] = num;
            if (solve(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Count solutions — stops at 2 to detect uniqueness
function countSolutions(board, limit = 2) {
  let count = 0;
  function bt() {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (board[r][c] === 0) {
          for (let num = 1; num <= 6; num++) {
            if (isValid(board, r, c, num)) {
              board[r][c] = num;
              bt();
              board[r][c] = 0;
              if (count >= limit) return;
            }
          }
          return;
        }
      }
    }
    count++;
  }
  bt();
  return count;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function deepCopy(board) {
  return board.map(row => [...row]);
}

// Generate a complete valid 6x6 board
function generateSolution() {
  const board = Array.from({ length: 6 }, () => Array(6).fill(0));
  solve(board);
  return board;
}

/**
 * Generate a puzzle with a unique solution
 * Removes cells one by one, keeping uniqueness
 * Returns { puzzle: number[][], solution: number[][] }
 */
export function generateMiniPuzzle() {
  const solution = generateSolution();
  const puzzle = deepCopy(solution);

  // All cell positions, shuffled
  const positions = shuffle(
    Array.from({ length: 36 }, (_, i) => [Math.floor(i / 6), i % 6])
  );

  let removed = 0;
  const target = 22; // Remove ~22 cells leaving ~14 givens (good difficulty for 6x6)

  for (const [r, c] of positions) {
    if (removed >= target) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    const copy = deepCopy(puzzle);
    if (countSolutions(copy) === 1) {
      removed++;
    } else {
      puzzle[r][c] = backup; // Restore if uniqueness broken
    }
  }

  return {
    puzzle: puzzle.map(row => [...row]),
    solution: solution.map(row => [...row]),
  };
}

/**
 * Flatten 6x6 board to 1D array of 36 numbers
 */
export function flattenGrid(board) {
  return board.flat();
}

/**
 * Unflatten 1D array back to 6x6 board
 */
export function unflattenGrid(flat) {
  const board = [];
  for (let r = 0; r < 6; r++) {
    board.push(flat.slice(r * 6, r * 6 + 6));
  }
  return board;
}

/**
 * Check if the current board state is complete and correct
 */
export function isMiniPuzzleComplete(board) {
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (board[r][c] === 0) return false;
      if (!isValid(deepCopy(board).map((row, ri) =>
        row.map((v, ci) => (ri === r && ci === c) ? 0 : v)
      ), r, c, board[r][c])) return false;
    }
  }
  return true;
}

/**
 * Get all conflicting cells as Set of "r,c" strings
 */
export function getMiniConflicts(board) {
  const conflicts = new Set();
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const val = board[r][c];
      if (val === 0) continue;

      // Check row
      for (let cc = 0; cc < 6; cc++) {
        if (cc !== c && board[r][cc] === val) {
          conflicts.add(`${r},${c}`);
          conflicts.add(`${r},${cc}`);
        }
      }
      // Check col
      for (let rr = 0; rr < 6; rr++) {
        if (rr !== r && board[rr][c] === val) {
          conflicts.add(`${r},${c}`);
          conflicts.add(`${rr},${c}`);
        }
      }
      // Check box
      const boxCells = getBoxCells(r, c);
      for (const [rr, cc] of boxCells) {
        if ((rr !== r || cc !== c) && board[rr][cc] === val) {
          conflicts.add(`${r},${c}`);
          conflicts.add(`${rr},${cc}`);
        }
      }
    }
  }
  return conflicts;
}
