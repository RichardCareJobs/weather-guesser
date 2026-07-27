import type { Guess, UnitSystem } from '../types';
import { formatDistance } from '../lib/units';
import { compassDirection, distanceToColor } from '../lib/geo';

interface CompassProps {
  guess: Guess;
  guessNum: number;
  units: UnitSystem;
  winDistanceKm: number;
}

export default function Compass({ guess, guessNum, units, winDistanceKm }: CompassProps) {
  const color = guess.correct ? '#2e7d32' : distanceToColor(guess.distanceKm, winDistanceKm);

  return (
    <div className="wg-compass">
      <svg viewBox="0 0 120 120" className="wg-compass-dial" aria-hidden="true">
        <circle cx="60" cy="60" r="56" className="wg-compass-ring" />
        <text x="60" y="16" className="wg-compass-tick">N</text>
        <text x="106" y="64" className="wg-compass-tick">E</text>
        <text x="60" y="110" className="wg-compass-tick">S</text>
        <text x="14" y="64" className="wg-compass-tick">W</text>
        {!guess.correct && (
          <g transform={`rotate(${guess.bearingDeg} 60 60)`}>
            <polygon points="60,16 52,64 60,56 68,64" fill={color} />
          </g>
        )}
        <circle cx="60" cy="60" r="6" fill={color} />
      </svg>
      <div className="wg-compass-info">
        <span className="wg-compass-guess-num">Guess {guessNum}</span>
        <strong style={{ color }}>
          {guess.correct ? 'Correct!' : `${formatDistance(guess.distanceKm, units)} away`}
        </strong>
        {!guess.correct && (
          <span>Answer is to the {compassDirection(guess.bearingDeg)}</span>
        )}
      </div>
    </div>
  );
}
