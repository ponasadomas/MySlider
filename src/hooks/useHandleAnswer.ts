import { useSliderContext } from '../core/useSliderContext';
import { useUpdateSliderAnswers } from './useUpdateSliderAnswers';
import { useNewSliderFlow } from './useNewSliderFlow';
import { useHandleLastAnswer } from './useHandleLastAnswer';

import { getSlideIndex } from '../utils/getSlideIndex';
import { checkIfSlideIsSpecialType } from '../utils/checkIfSlideIsSpecialType';

export type HandleAnswerType = (
  slideSlug: string,
  answerValue: string | string[] | null
) => void;

// useHandleAnswer is the catalyst of all Slider framework. It's the function
// that is executed when user interacts with the Slider. Either he answers a
// question, or clicks a button, or watches loader screen - this function is
// executed and is responsible for calling all other parts of Slider (updating
// logic, updating answers, updating flow, updating URL, etc.)
export const useHandleAnswer = () => {
  const {
    sliderSettings,
    sliderFlow,
    setSliderFlow,
    sliderAnswers,
    setNextSlideSlug,
    sliderData,
    sliderLogic,
    setCurrentSlideCategory
  } = useSliderContext();

  const updateSliderAnswers = useUpdateSliderAnswers();
  const newSliderFlow = useNewSliderFlow();
  const handleLastAnswer = useHandleLastAnswer();

  const handleAnswerClosure: HandleAnswerType = (slideSlug, answerValue) => {
    let updatedSliderFlow = sliderFlow;
    let updatedSliderAnswers = sliderAnswers;

    // 1. Get index of the slideSlug user just interacted with. If it's not in
    //    the sliderFlow, we set it to 0 - the first slide
    let currentSlideIndex = getSlideIndex(slideSlug, sliderFlow);
    currentSlideIndex = currentSlideIndex === -1 ? 0 : currentSlideIndex;

    // 2. When we receive answer 'null' it means it came from a button or an
    //    automated answer submission, like Breather. This way we don't need to
    //    submit anything to SliderAnswers, because these answers never impact
    //    the SliderFlow.
    if (answerValue !== null) {
      // 2.1 Update sliderAnswers with the new user's answer
      updatedSliderAnswers = updateSliderAnswers(slideSlug, answerValue);
    }

    // 2.2 We then update our Slider flow with logic described in slider logic
    //     object using the useNewSliderFlow hook, which returns new
    //     sliderFlow. We attach it to a variable so we can use it later to
    //     update sliderFlow state later in this handleAnswer function.
    updatedSliderFlow = newSliderFlow(slideSlug, answerValue);

    // 2.3 We scroll to the screen's top, to avoid weird behavior when user
    //     clicks a button and the screen is scrolled down.
    const scrollToTop = () => {
      // `.slider__scroll-area` is the slider's scroll container. Reset it to
      // the top instantly — if the user scrolled down a tall slide to reach
      // the button, the next slide must not be revealed mid-scroll, and an
      // instant reset (vs. a smooth one) avoids racing the slide transition.
      const scrollArea = document.querySelector('.slider__scroll-area');
      if (scrollArea) {
        scrollArea.scrollTop = 0;
      }
    };

    // Call the function to scroll to the top
    scrollToTop();

    // 3. After all of that, we start animation to next slide if it's not the
    //    last slide in the sliderFlow
    if (currentSlideIndex < updatedSliderFlow.length - 1) {
      setNextSlideSlug(updatedSliderFlow[currentSlideIndex + 1]);
    } else {
      // We just submitted answer for our last slide in the SliderFlow, so we
      // need to expand the transition screen to show the ending transition AND
      // we need to submit our data to servers, because we already have all the
      // answers. We do that by setting transitionDataSubmit to true, which will
      // launch a useEffect for that case in Slider component.
      handleLastAnswer(updatedSliderAnswers);
    }

    // 4. Check if next slide is in a "special slide types" array, like
    //    Breather. If next slide is a special slide, we don't want to update
    //    URL, because if we would update URL, then user would be able to access
    //    loader again by clicking Back button.
    if (
      checkIfSlideIsSpecialType(
        updatedSliderFlow[currentSlideIndex],
        sliderData,
        sliderLogic.specialSlideTypes
      )
    ) {
      // We also remove the special slide from the sliderFlow, so user can't
      // access it again.
      // console.log('Before filter: ', updatedSliderFlow);
      updatedSliderFlow = updatedSliderFlow.filter(
        (slug) => slug !== updatedSliderFlow[currentSlideIndex]
      );
      // console.log('After filter: ', updatedSliderFlow);
    }

    // 5. We finally update sliderlow and set it to sessionStorage
    sessionStorage.setItem(
      `${sliderSettings.sliderName}_sliderFlow`,
      JSON.stringify(updatedSliderFlow)
    );
    setSliderFlow(updatedSliderFlow);
  };

  return handleAnswerClosure;
};
