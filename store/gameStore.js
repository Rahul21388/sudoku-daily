import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GAME_KEY = '@sudoku_game';
const STATS_KEY = '@sudoku_stats';

const emptyGrid = () => Array.from({ length: 9 }, () => Array(9).fill(0));
const emptyNotes = () => Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));

const defaultGame = {
  puzzle: emptyGrid(),
  solution: emptyGrid(),
  board: emptyGrid(),
  notes: emptyNotes(),
  initialCells: emptyGrid(), // 1 = given clue
  selectedCell: null, // { row, col }
  mistakes: 0,
  maxMistakes: 3,
  hintsUsed: 0,
  maxHints: 3,
  timer: 0,
  isRunning: false,
  isPaused: false,
  isComplete: false,
  isFailed: false,
  notesMode: false,
  difficulty: 'medium',
  mode: 'random', // 'daily' | 'random'
  date: null,
};

const defaultStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalTime: 0,
  bestTimes: {
    easy: null,
    medium: null,
    hard: null,
    expert: null,
  },
  dailyHistory: {}, // { 'YYYY-MM-DD': { completed, time, mistakes, difficulty } }
  recentGames: [], // last 50 games
};

export const useGameStore = create((set, get) => ({
  ...defaultGame,
  stats: defaultStats,
  statsLoaded: false,

  // Load persisted game state
  loadGame: async () => {
    try {
      const raw = await AsyncStorage.getItem(GAME_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({ ...parsed, isRunning: false, isPaused: true });
        return true;
      }
    } catch {}
    return false;
  },

  // Save game state
  saveGame: async () => {
    const state = get();
    const toSave = {};
    for (const k of Object.keys(defaultGame)) {
      toSave[k] = state[k];
    }
    await AsyncStorage.setItem(GAME_KEY, JSON.stringify(toSave));
  },

  clearGame: async () => {
    set({ ...defaultGame });
    await AsyncStorage.removeItem(GAME_KEY);
  },

  // Initialize a new game
  startGame: ({ puzzle, solution, difficulty, mode, date }) => {
    const initialCells = puzzle.map(row => row.map(cell => (cell !== 0 ? 1 : 0)));
    const board = puzzle.map(row => [...row]);
    set({
      puzzle: puzzle.map(r => [...r]),
      solution: solution.map(r => [...r]),
      board,
      notes: emptyNotes(),
      initialCells,
      selectedCell: null,
      mistakes: 0,
      maxMistakes: 3,
      hintsUsed: 0,
      maxHints: 3,
      timer: 0,
      isRunning: true,
      isPaused: false,
      isComplete: false,
      isFailed: false,
      notesMode: false,
      difficulty,
      mode,
      date,
    });
  },

  selectCell: (row, col) => {
    set({ selectedCell: { row, col } });
  },

  toggleNotesMode: () => {
    set(state => ({ notesMode: !state.notesMode }));
  },

  inputNumber: (num, mistakesLimitEnabled) => {
    const state = get();
    const { selectedCell, board, solution, initialCells, notes, notesMode, isComplete, isFailed } = state;
    if (!selectedCell || isComplete || isFailed) return;
    const { row, col } = selectedCell;
    if (initialCells[row][col] === 1) return;

    if (notesMode) {
      const newNotes = notes.map(r => r.map(c => [...c]));
      const cellNotes = newNotes[row][col];
      const idx = cellNotes.indexOf(num);
      if (idx >= 0) {
        cellNotes.splice(idx, 1);
      } else {
        cellNotes.push(num);
        cellNotes.sort();
      }
      // Clear the cell value when adding notes
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = 0;
      set({ notes: newNotes, board: newBoard });
    } else {
      const newBoard = board.map(r => [...r]);
      const newNotes = notes.map(r => r.map(c => [...c]));

      // Clear notes on this cell
      newNotes[row][col] = [];

      if (num === solution[row][col]) {
        newBoard[row][col] = num;

        // Auto-remove notes from peers if enabled
        if (state.autoRemoveNotes !== false) {
          // Same row
          for (let c = 0; c < 9; c++) {
            newNotes[row][c] = newNotes[row][c].filter(n => n !== num);
          }
          // Same col
          for (let r = 0; r < 9; r++) {
            newNotes[r][col] = newNotes[r][col].filter(n => n !== num);
          }
          // Same box
          const boxRow = Math.floor(row / 3) * 3;
          const boxCol = Math.floor(col / 3) * 3;
          for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
              newNotes[r][c] = newNotes[r][c].filter(n => n !== num);
            }
          }
        }

        // Check completion
        let complete = true;
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (newBoard[r][c] !== solution[r][c]) {
              complete = false;
              break;
            }
          }
          if (!complete) break;
        }

        set({ board: newBoard, notes: newNotes, isComplete: complete, isRunning: !complete });
      } else {
        // Wrong answer
        newBoard[row][col] = num;
        const newMistakes = state.mistakes + 1;
        const failed = mistakesLimitEnabled && newMistakes >= state.maxMistakes;
        set({
          board: newBoard,
          notes: newNotes,
          mistakes: newMistakes,
          isFailed: failed,
          isRunning: !failed,
        });
      }
    }
    // Save after each move
    setTimeout(() => get().saveGame(), 100);
  },

  eraseCell: () => {
    const state = get();
    const { selectedCell, board, initialCells, notes, isComplete, isFailed } = state;
    if (!selectedCell || isComplete || isFailed) return;
    const { row, col } = selectedCell;
    if (initialCells[row][col] === 1) return;

    const newBoard = board.map(r => [...r]);
    const newNotes = notes.map(r => r.map(c => [...c]));
    newBoard[row][col] = 0;
    newNotes[row][col] = [];
    set({ board: newBoard, notes: newNotes });
    setTimeout(() => get().saveGame(), 100);
  },

  useHint: () => {
    const state = get();
    const { selectedCell, board, solution, initialCells, hintsUsed, maxHints, isComplete, isFailed } = state;
    if (isComplete || isFailed || hintsUsed >= maxHints) return false;

    let row, col;
    if (selectedCell && initialCells[selectedCell.row][selectedCell.col] === 0 && board[selectedCell.row][selectedCell.col] !== solution[selectedCell.row][selectedCell.col]) {
      row = selectedCell.row;
      col = selectedCell.col;
    } else {
      // Find a random empty/wrong cell
      const candidates = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (initialCells[r][c] === 0 && board[r][c] !== solution[r][c]) {
            candidates.push([r, c]);
          }
        }
      }
      if (candidates.length === 0) return false;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      row = pick[0];
      col = pick[1];
    }

    const newBoard = board.map(r => [...r]);
    const newNotes = state.notes.map(r => r.map(c => [...c]));
    newBoard[row][col] = solution[row][col];
    newNotes[row][col] = [];

    // Check completion
    let complete = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (newBoard[r][c] !== solution[r][c]) {
          complete = false;
          break;
        }
      }
      if (!complete) break;
    }

    set({
      board: newBoard,
      notes: newNotes,
      hintsUsed: hintsUsed + 1,
      selectedCell: { row, col },
      isComplete: complete,
      isRunning: !complete,
    });
    setTimeout(() => get().saveGame(), 100);
    return true;
  },

  tick: () => {
    const state = get();
    if (state.isRunning && !state.isPaused) {
      set({ timer: state.timer + 1 });
    }
  },

  pauseGame: () => set({ isPaused: true, isRunning: false }),
  resumeGame: () => set({ isPaused: false, isRunning: true }),

  // Stats
  loadStats: async () => {
    try {
      const raw = await AsyncStorage.getItem(STATS_KEY);
      if (raw) {
        set({ stats: JSON.parse(raw), statsLoaded: true });
      } else {
        set({ statsLoaded: true });
      }
    } catch {
      set({ statsLoaded: true });
    }
  },

  recordGameResult: async (won) => {
    const state = get();
    const { stats, timer, mistakes, difficulty, mode, date } = state;

    const newStats = { ...stats };
    newStats.gamesPlayed++;

    if (won) {
      newStats.gamesWon++;
      newStats.currentStreak++;
      newStats.totalTime += timer;
      if (newStats.currentStreak > newStats.bestStreak) {
        newStats.bestStreak = newStats.currentStreak;
      }
      const bestTimes = { ...newStats.bestTimes };
      if (!bestTimes[difficulty] || timer < bestTimes[difficulty]) {
        bestTimes[difficulty] = timer;
      }
      newStats.bestTimes = bestTimes;
    } else {
      newStats.currentStreak = 0;
    }

    if (mode === 'daily' && date) {
      newStats.dailyHistory = {
        ...newStats.dailyHistory,
        [date]: { completed: won, time: timer, mistakes, difficulty },
      };
    }

    const gameRecord = {
      date: new Date().toISOString(),
      difficulty,
      mode,
      won,
      time: timer,
      mistakes,
    };
    newStats.recentGames = [gameRecord, ...(newStats.recentGames || [])].slice(0, 50);

    set({ stats: newStats, statsLoaded: true });
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
  },
}));
