export function getSliderTagsFromUrl(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const sliderTags: Record<string, string> = {};

  // Extract only parameters starting with 'slidertag_'
  params.forEach((value, key) => {
      if (key.startsWith('slidertag_')) {
          sliderTags[key] = value;
      }
  });

  return sliderTags;
}
