const CORRECT_MESSAGES = [
  'Nice! Spot on.',
  "You've got a feel for this!",
  'Correct — nailed it!',
  'Yes! Great guess.',
  'Right on the money!',
];

const INCORRECT_MESSAGES = [
  'Not quite — nice try though.',
  'So close! Here was the right answer.',
  "Missed it, but you'll get the next one.",
  'Not this time — the correct answer is highlighted.',
  'Close guess! Here was the real answer.',
];

export function randomCorrectMessage(): string {
  return CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];
}

export function randomIncorrectMessage(): string {
  return INCORRECT_MESSAGES[Math.floor(Math.random() * INCORRECT_MESSAGES.length)];
}
