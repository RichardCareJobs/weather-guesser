import type { UnitSystem, Guess } from '../types';
import { CLUE_ORDER } from '../types';

const SETTINGS_KEY = 'weather-guesser:settings';
const STATS_KEY = 'weather-guesser:stats';
const DAILY_STATE_KEY = 'weather-guesser:daily-state';

export interface Settings {
  units: UnitSystem;
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { units: 'metric' };
    return { units: 'metric', ...JSON.parse(raw) };
  } catch {
    return { units: 'metric' };
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export interface Stats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[]; // index = guesses used - 1, length CLUE_ORDER.length
}

const EMPTY_STATS: Stats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: Array(CLUE_ORDER.length).fill(0),
};

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...EMPTY_STATS, guessDistribution: [...EMPTY_STATS.guessDistribution] };
    const parsed = JSON.parse(raw);
    return { ...EMPTY_STATS, ...parsed };
  } catch {
    return { ...EMPTY_STATS, guessDistribution: [...EMPTY_STATS.guessDistribution] };
  }
}

export function recordResult(won: boolean, guessesUsed: number): Stats {
  const stats = loadStats();
  stats.played += 1;
  if (won) {
    stats.won += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    const idx = Math.min(guessesUsed - 1, stats.guessDistribution.length - 1);
    stats.guessDistribution[idx] += 1;
  } else {
    stats.currentStreak = 0;
  }
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

export interface DailyState {
  dateKey: string;
  cityId: string;
  guesses: Guess[];
  status: 'playing' | 'won' | 'lost';
}

export function loadDailyState(): DailyState | null {
  try {
    const raw = localStorage.getItem(DAILY_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDailyState(state: DailyState): void {
  localStorage.setItem(DAILY_STATE_KEY, JSON.stringify(state));
}
