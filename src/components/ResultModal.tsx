import { useState } from 'react';
import type { City } from '../data/cities';
import type { GameMode } from '../types';
import type { Stats } from '../lib/storage';
import { buildShareText } from '../lib/share';
import { CLUES_PER_CITY, TOTAL_QUESTIONS } from '../lib/constants';

interface ResultModalProps {
  score: number;
  cities: City[];
  answers: boolean[];
  mode: GameMode;
  dateKey?: string;
  stats: Stats;
  onPlayPractice: () => void;
  onClose: () => void;
}

function headline(score: number): string {
  if (score === TOTAL_QUESTIONS) return 'Perfect day!';
  if (score >= 7) return 'Great job!';
  if (score >= 4) return 'Nice work!';
  return 'Better luck tomorrow!';
}

export default function ResultModal({
  score,
  cities,
  answers,
  mode,
  dateKey,
  stats,
  onPlayPractice,
  onClose,
}: ResultModalProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = buildShareText(answers, mode, dateKey);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable; ignore silently.
    }
  };

  const avgScore = stats.played > 0 ? (stats.totalScore / stats.played).toFixed(1) : '0.0';

  return (
    <div className="wg-modal-backdrop" role="dialog" aria-modal="true">
      <div className="wg-modal">
        <h2>{headline(score)}</h2>
        <p className="wg-modal-score">
          {score}/{TOTAL_QUESTIONS}
        </p>

        <ul className="wg-modal-city-list">
          {cities.map((city, c) => {
            const cityCorrect = answers
              .slice(c * CLUES_PER_CITY, c * CLUES_PER_CITY + CLUES_PER_CITY)
              .filter(Boolean).length;
            return (
              <li key={city.id}>
                <span>
                  {city.name}, {city.country}
                </span>
                <span className="wg-modal-city-score">
                  {cityCorrect}/{CLUES_PER_CITY}
                </span>
              </li>
            );
          })}
        </ul>

        {mode === 'daily' && (
          <div className="wg-stats-grid">
            <div>
              <strong>{stats.played}</strong>
              <span>Played</span>
            </div>
            <div>
              <strong>{avgScore}</strong>
              <span>Avg score</span>
            </div>
            <div>
              <strong>{stats.currentStreak}</strong>
              <span>Streak</span>
            </div>
            <div>
              <strong>{stats.maxStreak}</strong>
              <span>Max streak</span>
            </div>
          </div>
        )}

        <div className="wg-modal-actions">
          <button className="wg-button" onClick={handleShare}>
            {copied ? 'Copied!' : 'Share result'}
          </button>
          {mode === 'daily' ? (
            <button className="wg-button secondary" onClick={onPlayPractice}>
              Play practice round
            </button>
          ) : (
            <button className="wg-button secondary" onClick={onPlayPractice}>
              Play another
            </button>
          )}
          <button className="wg-button ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
