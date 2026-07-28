import type { UnitSystem } from '../types';
import { GREAT_SCORE_THRESHOLD, TOTAL_QUESTIONS } from './constants';

const SETTINGS_KEY = 'weather-guesser:settings';
const STATS_KEY = 'weather-guesser:stats:v2';
const DAILY_STATE_KEY = 'weather-guesser:daily-state:v2';

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
  totalScore: number;
  bestScore: number;
  currentStreak: number;
  maxStreak: number;
  scoreDistribution: number[]; // index = score (0..TOTAL_QUESTIONS)
}

const EMPTY_STATS: Stats = {
  played: 0,
  totalScore: 0,
  bestScore: 0,
  currentStreak: 0,
  maxStreak: 0,
  scoreDistribution: Array(TOTAL_QUESTIONS + 1).fill(0),
};

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...EMPTY_STATS, scoreDistribution: [...EMPTY_STATS.scoreDistribution] };
    const parsed = JSON.parse(raw);
    return { ...EMPTY_STATS, ...parsed };
  } catch {
    return { ...EMPTY_STATS, scoreDistribution: [...EMPTY_STATS.scoreDistribution] };
  }
}

export function recordResult(score: number): Stats {
  const stats = loadStats();
  stats.played += 1;
  stats.totalScore += score;
  stats.bestScore = Math.max(stats.bestScore, score);
  const idx = Math.min(Math.max(score, 0), stats.scoreDistribution.length - 1);
  stats.scoreDistribution[idx] += 1;
  if (score >= GREAT_SCORE_THRESHOLD) {
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

export interface DailyState {
  dateKey: string;
  cityIds: string[];
  answers: boolean[];
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
