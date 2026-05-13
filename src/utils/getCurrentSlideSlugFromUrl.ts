/**
 * A function to get a current slideSlug from the URL bar.
 * Since we can use two types of navigation (one with directory structure and one with hash) we need a
 * function that takes that into account and returns us a proper SlideSlug. The startPath parameter is
 * simply a directory from which we start our slider. For example, if we have a slider on the page
 * https://www.example.com/quiz/1/ and we want to use directory type navigation, we would pass
 * '/quiz/slider' as a startPath. If we want to use hash type navigation, we would pass '#' as a startPath.
 * The user sets the startPath in the SliderSettings object.
 *
 * @param navigationType a type of navigation we use in our slider
 * @param startPath a path from which we start our slider (for example '/quiz/slider')
 */
export function getCurrentSlideSlugFromUrl(
  navigationType: '#' | '/',
  startPath: string
) {
  return navigationType === '#'
    ? location.hash.slice(1)
    : location.pathname.replace(startPath, '').split('/').filter(Boolean)[0];
}
