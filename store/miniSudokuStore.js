import { create } from 'zustand';
import { generateMiniPuzzle, getMiniConflicts, isMiniPuzzleComplete } from '../utils/miniSudokuGenerator';

const EMPTY_BOARD = Array.from({ length: 6 }, () => Array(6).fill(0));

export const useMiniSudokuStore = create((set, get) => ({
  // Board state
  puzzle: EMPTY_BOARD,       // Original clues (0 = empty)
  board: EMPTY_BOARD,        // Current player board
  solution: EMPTY_BOARD,     // Correct solution
  notes: {},                 // { "r,c": Set of numbers }

  // UI state
  selectedCell: null,        // { row, col } or null
  isNoteMode: false,
  conflicts: new Set(),
  isComplete: false,
  isLoading: false,

  // Timer
  elapsedSeconds: 0,
  timerActive: false,

  // Stats
  mistakeCount: 0,
  hintsUsed: 0,

  // ── Actions ──────────────────────────────────────────────

  startNewGame: () => {
    set({ isLoading: true });

    // Run generator off the synchronous call stack to allow UI to show loader
    setTimeout(() => {
      const { puzzle, solution } = generateMiniPuzzle();
      const board = puzzle.map(row => [...row]);

      set({
        puzzle,
        board,
        solution,
        notes: {},
        selectedCell: null,
        isNoteMode: false,
        conflicts: new Set(),
        isComplete: false,
        isLoading: false,
        elapsedSeconds: 0,
        timerActive: true,
        mistakeCount: 0,
        hintsUsed: 0,
      });
    }, 50);
  },

  selectCell: (row, col) => {
    set({ selectedCell: { row, col } });
  },

  clearSelection: () => {
    set({ selectedCell: null });
  },

  toggleNoteMode: () => {
    set(s => ({ isNoteMode: !s.isNoteMode }));
  },

  inputNumber: (num) => {
    const { selectedCell, puzzle, board, solution, isNoteMode, notes } = get();
    if (!selectedCell) return;

    const { row, col } = selectedCell;

    // Can't modify given clues
    if (puzzle[row][col] !== 0) return;

    if (isNoteMode) {
      const key = `${row},${col}`;
      const existing = new Set(notes[key] || []);
      if (existing.has(num)) {
        existing.delete(num);
      } else {
        existing.add(num);
      }
      set({ notes: { ...notes, [key]: existing } });
      return;
    }

    // Place number
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;

    // Track mistakes
    let mistakeCount = get().mistakeCount;
    if (num !== 0 && solution[row][col] !== num) {
      mistakeCount += 1;
    }

    // Clear notes for this cell when a number is placed
    const newNotes = { ...notes };
    delete newNotes[`${row},${col}`];

    const conflicts = getMiniConflicts(newBoard);
    const isComplete = conflicts.size === 0 && isMiniPuzzleComplete(newBoard);

    set({
      board: newBoard,
      conflicts,
      isComplete,
      mistakeCount,
      notes: newNotes,
      timerActive: isComplete ? false : get().timerActive,
    });
  },

  eraseCell: () => {
    const { selectedCell, puzzle, board, notes } = get();
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    if (puzzle[row][col] !== 0) return; // Can't erase given

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = 0;

    const newNotes = { ...notes };
    delete newNotes[`${row},${col}`];

    const conflicts = getMiniConflicts(newBoard);

    set({ board: newBoard, conflicts, notes: newNotes, isComplete: false });
  },

  useHint: () => {
    const { selectedCell, puzzle, board, solution } = get();
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    if (puzzle[row][col] !== 0) return;
    if (board[row][col] === solution[row][col]) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = solution[row][col];

    const conflicts = getMiniConflicts(newBoard);
    const isComplete = conflicts.size === 0 && isMiniPuzzleComplete(newBoard);

    set({
      board: newBoard,
      conflicts,
      isComplete,
      hintsUsed: get().hintsUsed + 1,
      timerActive: isComplete ? false : get().timerActive,
    });
  },

  tickTimer: () => {
    if (get().timerActive) {
      set(s => ({ elapsedSeconds: s.elapsedSeconds + 1 }));
    }
  },

  pauseTimer: () => set({ timerActive: false }),
  resumeTimer: () => {
    if (!get().isComplete) set({ timerActive: true });
  },

  resetGame: () => {
    const { puzzle } = get();
    const board = puzzle.map(row => [...row]);
    set({
      board,
      notes: {},
      selectedCell: null,
      conflicts: new Set(),
      isComplete: false,
      elapsedSeconds: 0,
      timerActive: true,
      mistakeCount: 0,
    });
  },
}));
