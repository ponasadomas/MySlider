import { useEffect } from 'react';
import { SlideTypes, SlideType_CopyBlock, SliderDataTypes, SliderFlowType } from '../types';
import { preloadImages } from '../utils/preloadImages';

const LOOK_AHEAD = 2;

function hasSlideshowImages(slide: SlideTypes): slide is SlideType_CopyBlock {
  return (
    slide.type === 'copyBlock' &&
    (slide.image !== undefined ||
      (slide.copyImages !== undefined && slide.copyImages.length > 0))
  );
}

// Called from SliderProvider directly (not via context) — receives values as
// params because the hook runs inside the provider that owns the state.
export function usePreloadNextSlideImages(
  currentSlideSlug: string,
  sliderFlow: SliderFlowType,
  sliderData: SliderDataTypes
) {
  useEffect(() => {
    const currentIndex = sliderFlow.indexOf(currentSlideSlug);
    const upcomingSlugs = sliderFlow.slice(currentIndex + 1, currentIndex + 1 + LOOK_AHEAD);

    const slidesToPreload = upcomingSlugs
      .map((slug) => sliderData.find((s) => s.slug === slug))
      .filter((slide): slide is SlideType_CopyBlock => slide !== undefined && hasSlideshowImages(slide));

    if (slidesToPreload.length > 0) {
      preloadImages(slidesToPreload);
    }
  }, [currentSlideSlug, sliderFlow]);
}
