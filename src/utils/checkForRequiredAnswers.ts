import { AnswerHistoryType } from '../types';

export const checkForRequiredAnswers = (answerHistory: AnswerHistoryType, requiredSlideSlugs: string[]): boolean => {
  // Iterate through the list of required slugs
  for (const slug of requiredSlideSlugs) {
    // If the answerHistory doesn't contain a key for this slug, return false
    if (!answerHistory.hasOwnProperty(slug)) {
      return false;
    }
  }
  return true;
}
