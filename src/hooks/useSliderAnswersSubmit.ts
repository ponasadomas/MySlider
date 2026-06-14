import { useSliderContext } from '../core/useSliderContext';
import { notyfError } from '../utils/notyfNotifications';

import { SliderAnswersType, SliderMetadataType } from '../types';

interface SliderSubmitAnswersType {
  [key: string]: string | string[] | null;
}

export interface SliderAnswersSubmitType {
  status: 'success' | 'error';
  [key: string]: string | string[] | null;
}

export const useSliderAnswersSubmit = () => {
  const { sliderSettings } = useSliderContext();

  const sliderAnswersSubmitClosure = async (updatedSliderAnswers: SliderAnswersType, sliderMetadata: SliderMetadataType): Promise<SliderAnswersSubmitType | false> => {
    const apiEndpoint = sliderSettings.backendSettings.submitDataApi;

    // No endpoint configured — treat as a no-op success so the funnel can
    // still complete (useful in dev / for funnels that don't submit to a
    // backend). Consumer's `createRedirectUrlAfterDataSubmit` still fires.
    if (!apiEndpoint) {
      return { status: 'success' };
    }

    const payload = {
      // Identifies the quiz so the backend routes the submission to that quiz's
      // own table (e.g. `quiz_stop_your_divorce`).
      sliderName: sliderSettings.sliderName,
      sliderAnswers: updatedSliderAnswers,
      requiredSlideSlugs: sliderSettings.structure.requiredSlideSlugs,
      sliderMetadata: sliderMetadata,
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    for (let i = 0; i < 3; i++) {
      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Network response was not ok.');

        const data = await response.json();

        if (data.status === 'success') {
          // Push success message to notyf
          // notyfSuccess('Your answers have been submitted.');
          return data;
        } else {
          // Push failure message to notyf
          notyfError('There was an error submitting your answers. Attempt ' + (i + 1) + ' of 3');
          await delay(3333);
        }

      } catch (error) {
        console.error('There was an error sending the data', error);
        notyfError('There was an error sending the data: ' + error);
        await delay(3333);
      }

    }
    return false;
  }

  return sliderAnswersSubmitClosure;
};
