import { renderHook, act } from '@testing-library/react-native';
import { useGameStore } from '../store/gameStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Game Store', () => {
  beforeEach(() => {
    useGameStore.getState().clearGame();
  });

  test('initializes with default state', () => {
    const state = useGameStore.getState();
    expect(state.board.length).toBe(9);
    expect(state.isRunning).toBe(false);
    expect(state.mistakes).toBe(0);
  });

  test('startGame sets up correctly', () => {
    const puzzle = Array.from({ length: 9 }, () => Array(9).fill(0));
    puzzle[0][0] = 5;
    const solution = Array.from({ length: 9 }, () => Array(9).fill(5));

    act(() => {
      useGameStore.getState().startGame({
        puzzle,
        solution,
        difficulty: 'medium',
        mode: 'random',
      });
    });

    const state = useGameStore.getState();
    expect(state.difficulty).toBe('medium');
    expect(state.isRunning).toBe(true);
    expect(state.initialCells[0][0]).toBe(1);
    expect(state.initialCells[0][1]).toBe(0);
  });

  test('inputNumber updates board and handles mistakes', () => {
    const puzzle = Array.from({ length: 9 }, () => Array(9).fill(0));
    const solution = Array.from({ length: 9 }, () => Array(9).fill(5));

    act(() => {
      useGameStore.getState().startGame({ puzzle, solution, difficulty: 'easy' });
      useGameStore.getState().selectCell(0, 0);
    });

    // Correct input
    act(() => {
      useGameStore.getState().inputNumber(5, true);
    });
    expect(useGameStore.getState().board[0][0]).toBe(5);
    expect(useGameStore.getState().mistakes).toBe(0);

    // Incorrect input
    act(() => {
      useGameStore.getState().selectCell(0, 1);
      useGameStore.getState().inputNumber(1, true);
    });
    expect(useGameStore.getState().board[0][1]).toBe(1);
    expect(useGameStore.getState().mistakes).toBe(1);
  });
});
