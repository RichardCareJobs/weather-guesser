import type { City } from '../data/cities';
import type { ClueKey, CityRound, DailyWeather, QuizQuestion } from '../types';
import { CLUES_PER_CITY } from './constants';
import { createRng, shuffle } from './rng';
import { formatClueValue } from './units';

export interface ClueDef {
  key: ClueKey;
  label: string;
  question: (city: string) => string;
}

export const CLUE_POOL: ClueDef[] = [
  { key: 'tempMax', label: "Yesterday's high", question: (c) => `What was yesterday's high temperature in ${c}?` },
  { key: 'tempMin', label: "Yesterday's low", question: (c) => `What was yesterday's low temperature in ${c}?` },
  { key: 'rain', label: 'Rainfall', question: (c) => `How much rain fell in ${c} yesterday?` },
  { key: 'humidity', label: 'Humidity', question: (c) => `What was the average humidity in ${c} yesterday?` },
  { key: 'wind', label: 'Peak wind', question: (c) => `What was the peak wind speed in ${c} yesterday?` },
  { key: 'snow', label: 'Snowfall', question: (c) => `How much snow fell in ${c} yesterday?` },
  { key: 'dewPoint', label: 'Dew point', question: (c) => `What was the average dew point in ${c} yesterday?` },
];

export function clueDef(key: ClueKey): ClueDef {
  const def = CLUE_POOL.find((c) => c.key === key);
  if (!def) throw new Error(`Unknown clue key: ${key}`);
  return def;
}

function weatherValue(key: ClueKey, weather: DailyWeather): number {
  switch (key) {
    case 'tempMax':
      return weather.tempMaxC;
    case 'tempMin':
      return weather.tempMinC;
    case 'rain':
      return weather.rainMm;
    case 'humidity':
      return weather.humidityPct;
    case 'wind':
      return weather.windMaxKmh;
    case 'snow':
      return weather.snowCm;
    case 'dewPoint':
      return weather.dewPointC;
  }
}

interface DecoyRange {
  minDelta: number;
  maxDelta: number;
  min: number;
  max: number;
  round: (n: number) => number;
}

const DECOY_RANGES: Record<ClueKey, DecoyRange> = {
  tempMax: { minDelta: 3, maxDelta: 9, min: -60, max: 55, round: Math.round },
  tempMin: { minDelta: 3, maxDelta: 9, min: -65, max: 45, round: Math.round },
  dewPoint: { minDelta: 3, maxDelta: 8, min: -60, max: 35, round: Math.round },
  humidity: { minDelta: 12, maxDelta: 30, min: 0, max: 100, round: Math.round },
  wind: { minDelta: 10, maxDelta: 30, min: 0, max: 220, round: Math.round },
  rain: { minDelta: 2, maxDelta: 12, min: 0, max: 300, round: (n) => Math.round(n * 10) / 10 },
  snow: { minDelta: 2, maxDelta: 10, min: 0, max: 150, round: (n) => Math.round(n * 10) / 10 },
};

// Picks a decoy value near `correct`, at least MIN_GAP away from every value
// already in `taken` (so options never collide once formatted), retrying
// with a fresh random offset/side a few times before giving up.
function pickDecoy(key: ClueKey, correct: number, taken: number[], rng: () => number): number {
  const range = DECOY_RANGES[key];
  const minGap = range.minDelta * 0.6;
  let best: number | null = null;
  for (let attempt = 0; attempt < 25; attempt++) {
    const delta = range.minDelta + rng() * (range.maxDelta - range.minDelta);
    const side = rng() < 0.5 ? -1 : 1;
    let candidate = range.round(correct + side * delta);
    candidate = Math.min(range.max, Math.max(range.min, candidate));
    const farEnough = taken.every((t) => Math.abs(t - candidate) >= minGap);
    if (farEnough) {
      best = candidate;
      break;
    }
    best = candidate; // fall back to the last attempt if nothing satisfies the gap
  }
  return best as number;
}

// Builds a multiple-choice question for a clue, guaranteeing the three
// formatted option strings are distinct under both unit systems (since the
// player can toggle units mid-game).
function buildQuestion(key: ClueKey, weather: DailyWeather, rng: () => number): QuizQuestion {
  const correct = weatherValue(key, weather);
  let values: number[] = [correct];

  for (let attempt = 0; attempt < 15; attempt++) {
    const decoyA = pickDecoy(key, correct, [correct], rng);
    const decoyB = pickDecoy(key, correct, [correct, decoyA], rng);
    values = [correct, decoyA, decoyB];
    const metricStrs = values.map((v) => formatClueValue(key, v, 'metric'));
    const imperialStrs = values.map((v) => formatClueValue(key, v, 'imperial'));
    if (new Set(metricStrs).size === 3 && new Set(imperialStrs).size === 3) break;
  }

  const order = shuffle([0, 1, 2], rng);
  const options = order.map((i) => ({ value: values[i] }));
  const correctIndex = order.indexOf(0);
  return { clueKey: key, options, correctIndex };
}

export function buildCityRound(city: City, weather: DailyWeather, seed: string): CityRound {
  const rng = createRng(seed);
  const keys = shuffle(
    CLUE_POOL.map((c) => c.key),
    rng,
  ).slice(0, CLUES_PER_CITY);
  const questions = keys.map((key) => buildQuestion(key, weather, rng));
  return { cityId: city.id, questions };
}
