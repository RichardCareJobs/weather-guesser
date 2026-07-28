import type { GameMode } from '../types';
import { CITIES_PER_ROUND, CLUES_PER_CITY, TOTAL_QUESTIONS } from './constants';

function scoreEmoji(score: number): string {
  if (score === TOTAL_QUESTIONS) return '🌈';
  if (score >= 7) return '☀️';
  if (score >= 4) return '⛅';
  return '🌧️';
}

export function buildShareText(
  answers: boolean[],
  mode: GameMode,
  dateKey?: string,
  url?: string,
): string {
  const rows: string[] = [];
  for (let c = 0; c < CITIES_PER_ROUND; c++) {
    const row = answers
      .slice(c * CLUES_PER_CITY, c * CLUES_PER_CITY + CLUES_PER_CITY)
      .map((a) => (a ? '🟩' : '🟥'))
      .join('');
    rows.push(row);
  }
  const title =
    mode === 'daily' && dateKey ? `Weather Guesser ${dateKey}` : 'Weather Guesser (practice)';
  const score = answers.filter(Boolean).length;
  const link = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const lines = [`${scoreEmoji(score)} ${title} — ${score}/${TOTAL_QUESTIONS}`, rows.join(' ')];
  if (link) lines.push(link);
  return lines.join('\n');
}
