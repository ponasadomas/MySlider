import { useMemo } from 'react';
import { getSliderTagsFromUrl } from '../utils/getSliderTagsFromUrl';

/**
 * Reads `slidertag_*` params off the current URL. They are merged into
 * `sliderMetadata` (see SliderProvider) so they ride along with the answers
 * to the backend. MySlider does not persist them — persistence of
 * user-scoped data is the consuming project's concern (e.g. a `userProfile`
 * store), not the slider library's.
 */
export function useSliderTags() {
  return useMemo(() => getSliderTagsFromUrl(), []);
}
