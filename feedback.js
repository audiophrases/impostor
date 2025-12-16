/**
 * Feedback helpers for language-learning answers.
 *
 * The functions here focus on delivering encouraging, actionable messages
 * for both fill-in-the-blank and multiple-choice questions. They support
 * alternate correct answers (e.g., contractions) and configurable hints
 * for incorrect choices.
 */

function normalizeAnswer(answer) {
  return answer.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Evaluate a fill-in-the-blank response where multiple variants may be acceptable.
 *
 * @param {Object} params
 * @param {string[]} params.correctAnswers - All acceptable answers in preferred order.
 * @param {string} params.studentAnswer - The learner's submission.
 * @returns {{status: 'correct' | 'incorrect', message: string}}
 */
export function evaluateFillBlank({ correctAnswers, studentAnswer }) {
  const normalizedStudent = normalizeAnswer(studentAnswer);
  const normalizedCorrect = correctAnswers.map(normalizeAnswer);

  const matchIndex = normalizedCorrect.findIndex((ans) => ans === normalizedStudent);
  if (matchIndex === -1) {
    return { status: 'incorrect', message: 'Try again.' };
  }

  const usedAnswer = correctAnswers[matchIndex];
  const alternateAnswers = correctAnswers.filter((_, index) => index !== matchIndex);
  const alsoPossible = alternateAnswers.length
    ? ` (Also acceptable: ${alternateAnswers.map((a) => `“${a}”`).join(' or ')}.)`
    : '';

  return { status: 'correct', message: `Correct: ${usedAnswer}.${alsoPossible}` };
}

/**
 * Evaluate a multiple-choice submission and provide a hint when the choice is wrong.
 *
 * @param {Object} params
 * @param {string[]} params.choices - The visible answer options.
 * @param {number} params.correctIndex - Index of the right choice in the choices array.
 * @param {number} params.studentIndex - Index selected by the learner.
 * @param {string} [params.hint] - Optional grammar hint to display on wrong attempts.
 * @returns {{status: 'correct' | 'try-again', message: string}}
 */
export function evaluateMultipleChoice({ choices, correctIndex, studentIndex, hint = '' }) {
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error('choices must be a non-empty array');
  }

  if (correctIndex < 0 || correctIndex >= choices.length) {
    throw new Error('correctIndex must point to an item in choices');
  }

  const studentChoice = choices[studentIndex];
  if (typeof studentChoice === 'undefined') {
    throw new Error('studentIndex must point to an item in choices');
  }

  if (studentIndex === correctIndex) {
    return { status: 'correct', message: `Correct: ${choices[correctIndex]}.` };
  }

  const hintText = hint ? ` Hint: ${hint}` : '';
  return { status: 'try-again', message: `Try again.${hintText}` };
}

// Example usage for the scenarios described:
// 1) Fill-in-the-blank negative verb: both "are not" and "aren't" are valid.
// evaluateFillBlank({
//   correctAnswers: ["are not", "aren't"],
//   studentAnswer: "aren't",
// });
// → { status: 'correct', message: 'Correct: aren\'t. (Also acceptable: “are not”.)' }
//
// 2) MCQ with a subject-verb agreement hint.
// evaluateMultipleChoice({
//   choices: ['She my friend.', 'She is my friend.', 'She are my friend.', 'She am my friend.'],
//   correctIndex: 1,
//   studentIndex: 0,
//   hint: 'He/She/It → is.',
// });
// → { status: 'try-again', message: 'Try again. Hint: He/She/It → is.' }
