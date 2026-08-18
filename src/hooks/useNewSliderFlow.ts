import { useSliderContext } from '../core/useSliderContext';
import { getSlideIndex } from '../utils/getSlideIndex';

// Takes in slideSlug and answerValue and returns a sliderFlow depending on the
// answerValue and the logic object passed to the settings
export const useNewSliderFlow = () => {
  const {
    sliderFlow,
    sliderLogic
  } = useSliderContext();

  let updatedFlow = sliderFlow;

  const newSliderFlow = (
    slideSlug: string,
    answerValue: string | string[] | null
  ) => {
    // Because a user might have clicked back and now is re-answering a question
    // on a slide that is not the last one in the sliderFlow, we need to remove
    // all slides after the current slide from the sliderFlow, so that we don't
    // add the wrong or same slides twice.
    //
    // Truncate at slideSlug (the slide being answered), NOT at the context's
    // currentSlideSlug: on auto-advancing slides (radios) the context value can
    // still be the PREVIOUS slide when the answer handler fires. Truncating one
    // slide early cut the answered slide out of the flow and made the caller's
    // `updatedFlow[currentSlideIndex + 1]` (indexed via slideSlug against the
    // old flow) leapfrog the freshly inserted flowByAnswer slides — single-slide
    // insertions after radio answers (e.g. a level page after a 3-way choice)
    // were silently skipped. Checkbox/forward slides were unaffected because the
    // extra click gave the context time to settle, which is why the bug hid.
    if (sliderLogic.flowByAnswer[slideSlug] || sliderLogic.flowAugmentation[slideSlug]) {
      const answeredSlideIndex = getSlideIndex(slideSlug, sliderFlow);
      if (answeredSlideIndex !== -1) {
        updatedFlow = sliderFlow.slice(0, answeredSlideIndex + 1);
      }
    }

    // To deal with the situation where Slider needs to add additional slides
    // BEFORE the new flow (like when after a DecistionTree slide we need to
    // show a specific slide for ALL paths), we use the `flowAugmentation` object
    // to check if and which additional slides we need to add BEFORE the new
    // flow.
    if (sliderLogic.flowAugmentation[slideSlug]) {
      updatedFlow.push(...sliderLogic.flowAugmentation[slideSlug]['before']);
    }

    // To make our SliderLogic module work we simply have to check if the
    // current slideSlug exists in the `flowByAnswer` object. If it does, it's a
    // DecisionTree slide and it has some additional slideSlugs attached to it
    // that we have to add to our SliderFlow. We also need to check if the
    // answerValue is not null, because if it is, it means that the slide user
    // interacted with was a button or a specialType slide.
    if (sliderLogic.flowByAnswer[slideSlug] && answerValue) {

      // Because Slider's answers can be of two types (strings or arrays), we
      // can normalize all `answerValuesArray` to an array, so that we can use
      // the same logic for both types of answers.
      const answerValuesArray = Array.isArray(answerValue) ? answerValue : [answerValue];

      // Utilize a Set to ensure uniqueness of a slug in the updatedFlow array
      const flowSet = new Set(updatedFlow);

      // If slideSlug is a DecisionTree it means that its different answers will
      // lead to different slides. We simply itterate over user's answers and add
      // all the slides that are attached to the answer in `flowByAnswer` object.
      for (let answerItem of answerValuesArray) {
        // If the answerItem exists in the `flowByAnswer` object, we simply attach
        // the array of slides to the newSliderFlow array.
        if (sliderLogic.flowByAnswer[slideSlug][answerItem]) {
          // Instead of directly updating the array, add new entries to the Set
          sliderLogic.flowByAnswer[slideSlug][answerItem].forEach(item => flowSet.add(item));
        }
      }

      // Convert the Set back to an array
      updatedFlow = Array.from(flowSet);
    }

    // To deal with the situation where Slider needs to add additional slides
    // AFTER the new flow (like when after a flow of slides we need to show a
    // specific slide for ALL paths), we use the `flowAugmentation` object to
    // check if and which additional slides we need to add BEFORE the new flow.
    if (sliderLogic.flowAugmentation[slideSlug]) {
      updatedFlow.push(...sliderLogic.flowAugmentation[slideSlug]['after']);
    }

    return updatedFlow;
  };

  return newSliderFlow;
};
