import { useState } from 'react';
import type { City } from '../data/cities';
import type { Guess, GameMode } from '../types';
import type { Stats } from '../lib/storage';
import { buildShareText } from '../lib/share';

interface ResultModalProps {
  won: boolean;
  city: City;
  guesses: Guess[];
  maxGuesses: number;
  mode: GameMode;
  dateKey?: string;
  stats: Stats;
  onPlayPractice: () => void;
  onClose: () => void;
}

export default function ResultModal({
  won,
  city,
  guesses,
  maxGuesses,
  mode,
  dateKey,
  stats,
  onPlayPractice,
  onClose,
}: ResultModalProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = buildShareText(guesses, won, maxGuesses, mode, dateKey);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable; ignore silently.
    }
  };

  const winPct = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

  return (
    <div className="wg-modal-backdrop" role="dialog" aria-modal="true">
      <div className="wg-modal">
        <h2>{won ? 'You got it!' : 'Out of guesses'}</h2>
        <p className="wg-modal-city">
          {city.name}, {city.country}
        </p>
        <p className="wg-modal-sub">
          {won
            ? `Solved in ${guesses.length} of ${maxGuesses} guesses.`
            : "Better luck next time."}
        </p>

        {mode === 'daily' && (
          <div className="wg-stats-grid">
            <div>
              <strong>{stats.played}</strong>
              <span>Played</span>
            </div>
            <div>
              <strong>{winPct}</strong>
              <span>Win %</span>
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
