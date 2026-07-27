import type { Guess, UnitSystem } from '../types';
import { formatDistance } from '../lib/units';
import { compassDirection } from '../lib/geo';

interface GuessHistoryProps {
  guesses: Guess[];
  units: UnitSystem;
  maxGuesses: number;
}

export default function GuessHistory({ guesses, units, maxGuesses }: GuessHistoryProps) {
  if (guesses.length === 0) return null;
  return (
    <ol className="wg-guess-history">
      {guesses.map((g, i) => (
        <li key={i} className={g.correct ? 'correct' : ''}>
          <span className="wg-guess-num">{i + 1}</span>
          {g.correct ? (
            <span className="wg-guess-result">Correct!</span>
          ) : (
            <span className="wg-guess-result">
              {formatDistance(g.distanceKm, units)} {compassDirection(g.bearingDeg)}
            </span>
          )}
        </li>
      ))}
      {guesses.length < maxGuesses &&
        Array.from({ length: maxGuesses - guesses.length }).map((_, i) => (
          <li key={`empty-${i}`} className="empty">
            <span className="wg-guess-num">{guesses.length + i + 1}</span>
            <span className="wg-guess-result">—</span>
          </li>
        ))}
    </ol>
  );
}
