import { db } from '../config/firebase.js';
import { doc, setDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import { generatePuzzle, flattenGrid } from './sudokuGenerator.js';

const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];

export async function seedPuzzles(days = 30) {
  const today = dayjs();
  const results = [];

  for (let i = 0; i < days; i++) {
    const date = today.add(i, 'day').format('YYYY-MM-DD');
    const difficulty = DIFFICULTIES[i % DIFFICULTIES.length];
    const { puzzle, solution, clues } = generatePuzzle(difficulty);

    const data = {
      date,
      puzzle: flattenGrid(puzzle),
      solution: flattenGrid(solution),
      difficulty,
      clues,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'dailyPuzzles', date), data);
      results.push({ date, difficulty, status: 'ok' });
      console.log(`Seeded puzzle for ${date} (${difficulty})`);
    } catch (err) {
      results.push({ date, difficulty, status: 'error', error: err.message });
      console.error(`Failed to seed ${date}:`, err.message);
    }
  }

  return results;
}
