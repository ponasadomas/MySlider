import { SliderSettingsType } from '../types';
// Because we use two types of navigation (one with directory structure and one
// with hash) we opted to create a single function that can take that into
// account and return us a proper URL for the slide. We use this function to
// move to first unanswered, next, previous, or very first slide.
type CreateSlideUrlType = (
  settings: SliderSettingsType,
  slideSlug: string
) => string;

export const createSlideUrl: CreateSlideUrlType = (settings, slideSlug) => {
  // Honor the user's trailing-slash convention from `startPath`. Hosts like
  // Astro with `trailingSlash: 'always'` (or 'never') will redirect/404 on a
  // mismatch, so we mirror what the consumer set.
  const trailingSlash = settings.startPath.endsWith('/');
  const basePath = settings.startPath.replace(/\/+$/, '');
  const searchParams = window.location.search; // Capture the search query parameters
  const separator = settings.navigation.type === '/' ? '/' : '#';

  // Check if using directory type navigation and include searchParams accordingly
  const newPath =
    settings.navigation.type === '/'
      ? `${basePath}/${slideSlug}${trailingSlash ? '/' : ''}${searchParams}`
      : `${searchParams}${separator}${slideSlug}`;

  return newPath;
};
