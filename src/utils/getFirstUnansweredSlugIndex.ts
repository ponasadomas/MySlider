import { AnswerHistoryType } from '../types';

// Helper function to get the first unanswered question in the sliderFlow
type GetFirstUnansweredSlugIndex = (
  sliderFlow: string[],
  answerHistory: AnswerHistoryType
) => number;
export const getFirstUnansweredSlugIndex: GetFirstUnansweredSlugIndex = (
  sliderFlow,
  answerHistory
) => {
  const firstUnansweredQuestionIndex = sliderFlow.findIndex(
    (slideSlug: string) => !(slideSlug in answerHistory)
  );

  return firstUnansweredQuestionIndex === -1
    ? sliderFlow.length - 1
    : firstUnansweredQuestionIndex;
};
