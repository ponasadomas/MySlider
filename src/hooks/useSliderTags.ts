import { useEffect, useMemo } from 'react';
import { getSliderTagsFromUrl } from '../utils/getSliderTagsFromUrl';

export function useSliderTags(storageKey: string) {
  // Retrieve slider tags from URL
  const tags = useMemo(() => getSliderTagsFromUrl(), []);

  // Retrieve user data from localStorage and merge in slider tags
  useEffect(() => {
    const storedUserData = localStorage.getItem(storageKey);
    let userData: Record<string, any> = storedUserData
      ? JSON.parse(storedUserData)
      : {};

    // Retrieve existing slider tags or initialize an empty object
    const existingTags = userData.slider_tags || {};

    // Merge existing tags with new tags, prioritizing new tags
    const updatedTags = { ...existingTags, ...tags };

    // Update user data object with merged slider tags
    userData.slider_tags = updatedTags;

    // Save updated user data back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(userData));
  }, [storageKey, tags]);

  return tags;
}
