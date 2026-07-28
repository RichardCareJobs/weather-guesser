// Simple deterministic string hash (djb2) so a given seed string always
// produces the same sequence of "random" numbers, without needing a backend.
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

// mulberry32: small, fast, good-enough PRNG for gameplay (not crypto).
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function () {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A seeded RNG function, `rng()` returns a float in [0, 1), given a string seed.
export function createRng(seed: string): () => number {
  return mulberry32(hashString(seed));
}

// Fisher-Yates shuffle using a supplied RNG, returns a new array.
export function shuffle<T>(items: T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
