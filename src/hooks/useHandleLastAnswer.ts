import { useSliderContext } from '../core/useSliderContext';
import { SliderAnswersType } from '../types';
import { checkForRequiredAnswers } from '../utils/checkForRequiredAnswers';
import { useSliderAnswersSubmit } from './useSliderAnswersSubmit';
import { notyfError } from '../utils/notyfNotifications';

export type HandleLastAnswerType = (
  updatedSliderAnswers: SliderAnswersType
) => void;

export const useHandleLastAnswer = () => {
  const { sliderSettings, setSliderTransition, sliderMetadata } = useSliderContext();
  const sliderAnswersSubmit = useSliderAnswersSubmit();

  const handleLastAnswerClosure: HandleLastAnswerType = async (
    updatedSliderAnswers
  ) => {
    setSliderTransition((prev) => ({
      ...prev,
      transitionExpanded: true,
      delay: 0
    }));

    const answersAreValid = checkForRequiredAnswers(
      updatedSliderAnswers,
      sliderSettings.structure.requiredSlideSlugs
    );

    if (!answersAreValid) {
      notyfError('You skipped some required answers.');
      return;
    }

    let result = await sliderAnswersSubmit(
      updatedSliderAnswers,
      sliderMetadata
    );

    setTimeout(() => {
      if (result !== false && result.status === 'success') {
        let redirectUrlOnSuccess = sliderSettings.navigation.createRedirectUrlAfterDataSubmit(result);
        window.location.href = redirectUrlOnSuccess;
      }
    }, 777);

  };
  return handleLastAnswerClosure;
}
