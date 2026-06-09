import { useSliderContext } from '../core/useSliderContext';
import { SliderAnswersType } from '../types';

export type AnswerValueType = string | string[];

export type UpdateSliderAnswersType = (
  slideSlug: string,
  answerValue: AnswerValueType
) => SliderAnswersType;

export const useUpdateSliderAnswers = () => {
  const { sliderSettings, sliderAnswers, setSliderAnswers } = useSliderContext();

  const updateSliderAnswers: UpdateSliderAnswersType = (
    slideSlug,
    answerValue
  ) => {
    let updatedSliderAnswers = sliderAnswers;

    // An empty string or empty array means "nothing answered yet" — e.g. a
    // freshly-mounted slide persisting its blank initial state. Writing it
    // would register the slug as answered, which (with skipping disabled)
    // lets the URL gate wave the user past a question they never answered.
    // `'null'` is the sentinel non-question slides (copyBlock, recap, score, …)
    // pass just to advance — never a real answer, so don't persist it (it would
    // otherwise pollute saved answers and pre-fill a later input reusing the slug).
    const hasAnswer = Array.isArray(answerValue)
      ? answerValue.length > 0
      : !!answerValue && answerValue !== 'null';

    if (hasAnswer) {
      updatedSliderAnswers = {
        ...sliderAnswers,
        [slideSlug]: answerValue,
      };

      sessionStorage.setItem(
        `${sliderSettings.sliderName}_sliderAnswers`,
        JSON.stringify(updatedSliderAnswers)
      );
      setSliderAnswers(updatedSliderAnswers);
    }

    return updatedSliderAnswers;
  };

  return updateSliderAnswers;
};
