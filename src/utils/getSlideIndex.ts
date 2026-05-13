// A lot of times this will be used to figure out which slide should be shown
// next. For that we'd need to know the currentSlug title and its index number
// in the array of SliderFlow. Then we can simply add 1 and find out what slide
// we should show next. The only difference here is that we provide a fallback -
// if we can't find such slug name in the SliderFlow (returns -1), we set next
// slide to the very first one in the SliderFlow.
type GetSlideIndexType = (slideSlug: string, arrayOfSlugs: string[]) => number;
export const getSlideIndex: GetSlideIndexType = (slideSlug, arrayOfSlugs) => {
  // Attempt to find the current slide's index; default to the first slide in
  // initialSliderFlow if not found
  const currentSlideIndex = arrayOfSlugs.indexOf(slideSlug);
  return currentSlideIndex;
};
