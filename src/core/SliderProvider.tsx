import React, { ReactNode, useRef, useState, useMemo, useEffect } from 'react';
import SliderContext from './SliderContext';
import { TransitionLoader } from '../components/TransitionLoader/TransitionLoader';
import { useSliderTags } from '../hooks/useSliderTags';
import { usePreloadNextSlideImages } from '../hooks/usePreloadNextSlideImages';
import { preloadImages } from '../utils/preloadImages';
import { getCurrentSlideSlugFromUrl } from '../utils/getCurrentSlideSlugFromUrl';

import {
  SliderSettingsType,
  SliderMetadataType,
  CurrentSlideSlugType,
  NextSlideSlugType,
  SliderLogicType,
  SliderFlowType,
  SliderTransitionType,
  HideUIElementsType,
  SlideTypes,
  SlideType_CopyBlock,
  SliderDataTypes,
  SliderLayoutsMap,
  SliderAnswersType
} from '../types';

export function SliderProvider({
  sliderData,
  sliderLogic,
  sliderSettings,
  sliderMetadata,
  layouts,
  initialAnswers,
  onAnswersChange,
  children
}: {
  sliderData: SliderDataTypes;
  sliderLogic: SliderLogicType;
  sliderSettings: SliderSettingsType;
  sliderMetadata: SliderMetadataType;
  layouts: SliderLayoutsMap;
  // Seed answers from outside (e.g. a backend store) so the funnel opens with
  // the user's prior input pre-filled and earlier lessons' answers available.
  initialAnswers?: SliderAnswersType;
  // Fires whenever answers change — the hook for persisting them to a backend.
  onAnswersChange?: (answers: SliderAnswersType) => void;
  children: ReactNode;
}) {
  // Initialize currentSlideSlug from the URL when possible, so deep-links and
  // page refreshes land directly on the requested slide instead of starting at
  // the first slide and animating across.
  // Restored from v1 behavior: respect the URL if its slug is within the
  // initial slide flow.
  // When progress isn't persisted, the funnel always starts on the first slide
  // and ignores any saved sessionStorage / URL position.
  const persistProgress = sliderSettings.persistProgress !== false;

  const [currentSlideSlug, setCurrentSlideSlug] =
    useState<CurrentSlideSlugType>(() => {
      if (typeof window === 'undefined' || !persistProgress) {
        return sliderLogic.initialSlides[0];
      }
      const urlSlug = getCurrentSlideSlugFromUrl(
        sliderSettings.navigation.type,
        sliderSettings.startPath
      );
      if (urlSlug && sliderLogic.initialSlides.includes(urlSlug)) {
        return urlSlug;
      }
      return sliderLogic.initialSlides[0];
    });
  const [currentSlideCategory, setCurrentSlideCategory] = useState<string>('');
  const [nextSlideSlug, setNextSlideSlug] = useState<NextSlideSlugType>(null);
  const [disableMouseEvents, setDisableMouseEvents] = useState<boolean>(false);

  const [sliderFlow, setSliderFlow] = useState<SliderFlowType>(() => {
    if (!persistProgress) return sliderLogic.initialSlides;
    const storedSessionFlow = sessionStorage.getItem(
      `${sliderSettings.sliderName}_sliderFlow`
    );
    return storedSessionFlow
      ? JSON.parse(storedSessionFlow)
      : sliderLogic.initialSlides;
  });

  const [sliderAnswers, setSliderAnswers] = useState(() => {
    const seeded = initialAnswers ?? {};
    if (!persistProgress) return { ...seeded };
    const storedHistory = sessionStorage.getItem(
      `${sliderSettings.sliderName}_sliderAnswers`
    );
    // session-persisted answers win over the seed (most recent on this device)
    return storedHistory
      ? { ...seeded, ...JSON.parse(storedHistory) }
      : { ...seeded };
  });

  const [totalSlidesNumber, setTotalSlidesNumber] = useState<number>(
    sliderSettings.structure.totalSlides
  );

  // A very specific state used to hide some specifc UI elements, since we can't
  // do that with CSS. One example is hiding the Back button and ProgressBar
  // when the Breather element is being shown. Because the Breather element is
  // displayed inside a parent element's child's child's child, we cannot use
  // fixed position to hide other elements, that are direct children of the
  // parent. Hence we use this state to hide them programatically.
  const [hideUIElements, setHideUIElements] =
    useState<HideUIElementsType>(false);

  // A slide block reference to be used in Slide component. Used to identify and
  // animate slides in swipeAnimation.ts and other animations.
  const sliderSlideRef = useRef<(HTMLDivElement | null)[]>([null, null]);

  const [sliderTransition, setSliderTransition] =
    useState<SliderTransitionType>({
      transitionExpanded: true,
      transitionCenterPoint: null,
      transitionDataSubmit: false,
      sound: false,
      onStart: () => {},
      onComplete: () => {},
      delay: 0.2,
      duration: 0.777
    });

  // URL `slidertag_*` params — merged into sliderMetadata for the backend.
  const sliderTags = useSliderTags();

  const mergedMetadata = useMemo(
    () => ({
      ...sliderMetadata,
      sliderTags: sliderTags
    }),
    [sliderMetadata, sliderTags]
  );

  // useMemo is used to memoize the value of the context provider. This way we
  // prevent unnecessary re-renders of the children components.
  const contextValue = useMemo(
    () => ({
      // Static values
      sliderData, // All slides for layouts
      sliderSettings,

      // sliderMetada is usually a data that we want to pass to our Slider
      // from outside elements. In addition to sliderAnswers, we use
      // sliderMetadata for information and data that might not be inside of
      // sliderAnswersobject. This might be user's gender, which he chooses on
      // the other page, tracking data (that also comes from another page) or
      // any other amount of data that we want to use and pass to our backend
      // to deal with.
      sliderMetadata: mergedMetadata, // We merged with sliderTags from URL
      sliderLogic,
      layouts,

      // Dynamic state values and setters
      currentSlideSlug, // useState for current slide slug
      setCurrentSlideSlug,
      currentSlideCategory, // useState for current slide category
      setCurrentSlideCategory,
      nextSlideSlug, // useState for next slide slug
      setNextSlideSlug,
      sliderFlow, // useState for slider flow
      setSliderFlow,
      sliderAnswers, // useState for slider answers
      setSliderAnswers,
      disableMouseEvents, // useState to check if mouse events are disabled
      setDisableMouseEvents,
      totalSlidesNumber, // useState for total number of slides
      setTotalSlidesNumber,
      sliderTransition, // useState for slider transition current state
      setSliderTransition,
      hideUIElements, // useState for hiding UI elements
      setHideUIElements,

      // Dynamic ref
      sliderSlideRef // useRef to animate Slide component
    }),
    [
      sliderData,
      sliderSettings,
      mergedMetadata,
      sliderLogic,
      layouts,
      currentSlideSlug,
      currentSlideCategory,
      nextSlideSlug,
      sliderFlow,
      sliderAnswers,
      disableMouseEvents,
      totalSlidesNumber,
      sliderTransition,
      hideUIElements,
      sliderSlideRef
    ]
  );

  // Bulk preload: covers every possible branch in the decision tree, not just
  // the slides currently known in sliderFlow.
  useEffect(() => {
    function isCopyBlockWithImages(slide: SlideTypes): slide is SlideType_CopyBlock {
      return (
        slide.type === 'copyBlock' &&
        (slide.image !== undefined ||
          (slide.copyImages !== undefined && slide.copyImages.length > 0))
      );
    }
    const allSlidesWithImages = sliderData.filter(isCopyBlockWithImages);
    if (allSlidesWithImages.length > 0) {
      preloadImages(allSlidesWithImages);
    }
  }, []);

  // Look-ahead: priority fast path for the next 2 slides in the current flow.
  usePreloadNextSlideImages(currentSlideSlug, sliderFlow, sliderData);

  // Report answer changes outward (for backend persistence). Skip the initial
  // render so seeding `initialAnswers` doesn't echo straight back as a "save".
  const answersChangeFirst = useRef(true);
  useEffect(() => {
    if (answersChangeFirst.current) {
      answersChangeFirst.current = false;
      return;
    }
    onAnswersChange?.(sliderAnswers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliderAnswers]);

  return (
    <SliderContext.Provider value={contextValue}>
      {children}
      <TransitionLoader settings={sliderTransition} sound={false} />
    </SliderContext.Provider>
  );
}
