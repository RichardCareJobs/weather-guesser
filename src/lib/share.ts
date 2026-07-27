import type { Guess, GameMode } from '../types';

export function buildShareText(
  guesses: Guess[],
  won: boolean,
  maxGuesses: number,
  mode: GameMode,
  dateKey?: string,
): string {
  const squares = guesses.map((g) => (g.correct ? '🟩' : '🟥')).join('');
  const title =
    mode === 'daily' && dateKey
      ? `Weather Guesser ${dateKey}`
      : 'Weather Guesser (practice)';
  const score = won ? `${guesses.length}/${maxGuesses}` : `X/${maxGuesses}`;
  return `${title} — ${score}\n${squares}`;
}
