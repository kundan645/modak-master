import { LeaderboardEntry } from '../types';

const STORAGE_KEY_LEADERBOARD = 'modak_master_leaderboard_v1';
const STORAGE_KEY_USERNAME = 'modak_master_username';

export const DEFAULT_DEVOTEE_NAME = 'Devotee';

// Pre-seeded festive high scores for atmosphere and healthy competition
const SEED_ENTRIES: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    username: 'Aarav Sharma',
    score: 1250,
    date: 'Sep 19, 2026',
    rankTitle: 'Supreme Modak Master 🌟',
    normalModaks: 72,
    goldenModaks: 9,
    maxCombo: 18,
    festivalLevel: 5,
  },
  {
    id: 'seed-2',
    username: 'Priya Kulkarni',
    score: 980,
    date: 'Sep 19, 2026',
    rankTitle: 'Devotee of Bappa 🕉️',
    normalModaks: 58,
    goldenModaks: 6,
    maxCombo: 14,
    festivalLevel: 4,
  },
  {
    id: 'seed-3',
    username: 'Rohan Patil',
    score: 760,
    date: 'Sep 18, 2026',
    rankTitle: 'Devotee of Bappa 🕉️',
    normalModaks: 46,
    goldenModaks: 5,
    maxCombo: 11,
    festivalLevel: 4,
  },
  {
    id: 'seed-4',
    username: 'Ananya Deshmukh',
    score: 540,
    date: 'Sep 18, 2026',
    rankTitle: 'Modak Sevak 🍬',
    normalModaks: 35,
    goldenModaks: 3,
    maxCombo: 8,
    festivalLevel: 3,
  },
  {
    id: 'seed-5',
    username: 'Aditya Joshi',
    score: 380,
    date: 'Sep 17, 2026',
    rankTitle: 'Modak Sevak 🍬',
    normalModaks: 26,
    goldenModaks: 2,
    maxCombo: 6,
    festivalLevel: 2,
  },
];

export const getStoredUsername = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USERNAME);
    if (saved && saved.trim().length > 0) {
      return saved.trim().slice(0, 18);
    }
  } catch {
    // fallback
  }
  return DEFAULT_DEVOTEE_NAME;
};

export const setStoredUsername = (name: string): string => {
  const clean = name.trim().slice(0, 18) || DEFAULT_DEVOTEE_NAME;
  try {
    localStorage.setItem(STORAGE_KEY_USERNAME, clean);
  } catch {
    // fallback
  }
  return clean;
};

export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => b.score - a.score);
      }
    }
  } catch {
    // fallback
  }
  // Initialize with seed entries
  saveLeaderboard(SEED_ENTRIES);
  return SEED_ENTRIES;
};

export const saveLeaderboard = (entries: LeaderboardEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(entries));
  } catch {
    // fallback
  }
};

export const addLeaderboardScore = (
  entryData: Omit<LeaderboardEntry, 'id' | 'date'>
): { entries: LeaderboardEntry[]; newRankIndex: number } => {
  const currentList = getLeaderboard();
  const todayStr = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const newEntry: LeaderboardEntry = {
    ...entryData,
    id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    date: todayStr,
  };

  const updatedList = [...currentList, newEntry].sort((a, b) => b.score - a.score);
  // Keep top 30
  const trimmed = updatedList.slice(0, 30);
  saveLeaderboard(trimmed);

  const newRankIndex = trimmed.findIndex((e) => e.id === newEntry.id);
  return { entries: trimmed, newRankIndex };
};

export const resetLeaderboard = (): LeaderboardEntry[] => {
  saveLeaderboard(SEED_ENTRIES);
  return SEED_ENTRIES;
};
