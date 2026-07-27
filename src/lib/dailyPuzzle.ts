import { CITIES, type City } from '../data/cities';

// Simple deterministic string hash (djb2) so the same calendar date always
// maps to the same city for every player, without needing a backend.
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

// YYYY-MM-DD in the browser's local calendar, used as the puzzle "day".
export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function cityForDate(dateKey: string): City {
  const index = hashString(dateKey) % CITIES.length;
  return CITIES[index];
}

export function randomCity(excludeId?: string): City {
  let city: City;
  do {
    city = CITIES[Math.floor(Math.random() * CITIES.length)];
  } while (CITIES.length > 1 && city.id === excludeId);
  return city;
}
