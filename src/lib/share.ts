import type { GameMode } from '../types';
import { CITIES_PER_ROUND, CLUES_PER_CITY, TOTAL_QUESTIONS } from './constants';

export function buildShareText(
  answers: boolean[],
  mode: GameMode,
  dateKey?: string,
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
  return `${title} — ${score}/${TOTAL_QUESTIONS}\n${rows.join(' ')}`;
}
