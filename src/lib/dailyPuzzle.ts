import { CITIES, type City } from '../data/cities';
import { createRng, shuffle } from './rng';
import { CITIES_PER_ROUND } from './constants';

// YYYY-MM-DD in the browser's local calendar, used as the puzzle "day".
export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function pickDistinct(rng: () => number, count: number): City[] {
  return shuffle(CITIES, rng).slice(0, count);
}

// The same calendar date always maps to the same set of cities for every
// player, without needing a backend.
export function citiesForDate(dateKey: string, count = CITIES_PER_ROUND): City[] {
  const rng = createRng(`weather-guesser:cities:${dateKey}`);
  return pickDistinct(rng, count);
}

export function randomCities(count = CITIES_PER_ROUND): City[] {
  const rng = Math.random;
  return pickDistinct(rng, count);
}
