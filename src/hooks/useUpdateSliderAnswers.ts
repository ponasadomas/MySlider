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

    if (answerValue) {
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
