import { getSlideIndex } from './getSlideIndex';

// We use this function to detect which way the user is navigating the slider.
// The information is used to animate the slider in the right direction.
export const getNavigationDirection = (
  nextSlideSlug: string,
  currentSlideSlug: string,
  arrayOfSlugs: string[]
) => {
  if (!nextSlideSlug || nextSlideSlug === currentSlideSlug) return 'stay';

  const indexOfNextSlideSlug = getSlideIndex(nextSlideSlug, arrayOfSlugs);
  const indexOfCurrentSlideSlug = getSlideIndex(currentSlideSlug, arrayOfSlugs);

  return indexOfNextSlideSlug < indexOfCurrentSlideSlug
    ? 'backward'
    : 'forward';
};
