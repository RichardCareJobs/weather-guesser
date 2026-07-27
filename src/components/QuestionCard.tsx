import { useMemo } from 'react';
import type { QuizQuestion, UnitSystem } from '../types';
import type { ClueDef } from '../lib/quiz';
import { formatClueValue } from '../lib/units';
import { randomCorrectMessage, randomIncorrectMessage } from '../lib/messages';

interface QuestionCardProps {
  cityLabel: string;
  clueDef: ClueDef;
  question: QuizQuestion;
  units: UnitSystem;
  selected: number | null;
  onSelect: (index: number) => void;
  onContinue: () => void;
  continueLabel: string;
}

export default function QuestionCard({
  cityLabel,
  clueDef,
  question,
  units,
  selected,
  onSelect,
  onContinue,
  continueLabel,
}: QuestionCardProps) {
  const answered = selected !== null;
  const isCorrect = answered && selected === question.correctIndex;

  const message = useMemo(() => {
    if (!answered) return null;
    return isCorrect ? randomCorrectMessage() : randomIncorrectMessage();
  }, [answered, isCorrect]);

  return (
    <div className="wg-question-card">
      <p className="wg-question-eyebrow">{clueDef.label}</p>
      <h2 className="wg-question-text">{clueDef.question(cityLabel)}</h2>

      <div className="wg-options" role="group" aria-label={clueDef.label}>
        {question.options.map((option, i) => {
          let state = '';
          if (answered) {
            if (i === question.correctIndex) state = 'correct';
            else if (i === selected) state = 'incorrect';
            else state = 'muted';
          }
          return (
            <button
              key={i}
              type="button"
              className={`wg-option ${state}`}
              disabled={answered}
              onClick={() => onSelect(i)}
            >
              {formatClueValue(question.clueKey, option.value, units)}
            </button>
          );
        })}
      </div>

      <div className="wg-feedback" aria-live="polite">
        {message && (
          <p className={`wg-feedback-message ${isCorrect ? 'correct' : 'incorrect'}`}>{message}</p>
        )}
        {answered && (
          <button type="button" className="wg-button wg-continue-button" onClick={onContinue}>
            {continueLabel}
          </button>
        )}
      </div>
    </div>
  );
}
