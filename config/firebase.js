import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAjk4DMH5F5f0x5Fa3lKhl-uBLHWNs2AMo",
  authDomain: "sudoku-daily-69601.firebaseapp.com",
  projectId: "sudoku-daily-69601",
  storageBucket: "sudoku-daily-69601.firebasestorage.app",
  messagingSenderId: "541122112779",
  appId: "1:541122112779:web:e8ed448c10c5250b8a460e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
