import { CITIES_PER_ROUND, CLUES_PER_CITY, TOTAL_QUESTIONS } from '../lib/constants';

interface StatusBarProps {
  cityIndex: number; // 0-based
  clueIndex: number; // 0-based, questions answered so far in this city
  score: number;
}

export default function StatusBar({ cityIndex, clueIndex, score }: StatusBarProps) {
  return (
    <div className="wg-status-bar">
      <div className="wg-status-cities">
        <span className="wg-status-label">
          City {Math.min(cityIndex + 1, CITIES_PER_ROUND)} of {CITIES_PER_ROUND}
        </span>
        <div className="wg-dots" aria-hidden="true">
          {Array.from({ length: CLUES_PER_CITY }).map((_, i) => (
            <span
              key={i}
              className={`wg-dot ${i < clueIndex ? 'done' : i === clueIndex ? 'current' : ''}`}
            />
          ))}
        </div>
      </div>
      <div className="wg-status-score">
        Score <strong>{score}</strong>
        <span className="wg-status-score-total">/{TOTAL_QUESTIONS}</span>
      </div>
    </div>
  );
}
