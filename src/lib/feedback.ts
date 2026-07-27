import type { Guess } from '../types';

const CORRECT_MESSAGES = ['Bullseye!', 'Nailed it!', 'Spot on!'];
const CLOSE_MESSAGES = ['So close!', 'Red hot!', 'Almost there!'];
const WARM_MESSAGES = ['Getting warmer', "You're in the ballpark", 'Closing in'];
const COOL_MESSAGES = ['Not quite there yet', 'Still searching', 'Keep guessing'];
const COLD_MESSAGES = ['Way off track', "That's a stretch", 'Miles away (literally)'];
const ARCTIC_MESSAGES = ['Wrong hemisphere?', 'Ever heard of a globe?', 'Practically a different planet'];

function pick(messages: string[], seed: number): string {
  return messages[seed % messages.length];
}

// A dynamic, tone-matched replacement for a static "Latest guess" heading -
// encouraging when the guess is close, gently teasing when it's way off.
export function guessFeedbackHeading(guess: Guess, winDistanceKm: number, seed: number): string {
  if (guess.correct) return pick(CORRECT_MESSAGES, seed);
  const d = guess.distanceKm;
  if (d <= winDistanceKm * 2.5) return pick(CLOSE_MESSAGES, seed);
  if (d <= 750) return pick(WARM_MESSAGES, seed);
  if (d <= 2500) return pick(COOL_MESSAGES, seed);
  if (d <= 6000) return pick(COLD_MESSAGES, seed);
  return pick(ARCTIC_MESSAGES, seed);
}
