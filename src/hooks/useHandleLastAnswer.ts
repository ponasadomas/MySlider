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
    // SPA-embedded funnels finish in place: hand control straight back to the
    // host (e.g. close an overlay) with no transition screen, no data submit
    // and crucially no `window.location` navigation — so the page never
    // reloads. This makes the final-slide button behave like every other
    // forward step (which never reloaded), only ending the funnel.
    if (sliderSettings.navigation.onComplete) {
      sliderSettings.navigation.onComplete();
      return;
    }

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
        const redirectUrlOnSuccess =
          sliderSettings.navigation.createRedirectUrlAfterDataSubmit?.(result);
        if (redirectUrlOnSuccess) window.location.href = redirectUrlOnSuccess;
      }
    }, 777);

  };
  return handleLastAnswerClosure;
}
