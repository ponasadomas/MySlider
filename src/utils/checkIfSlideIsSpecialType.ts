import { SliderDataTypes } from '../types';

// Detect if slide is "special slide type"
export const checkIfSlideIsSpecialType = (slideSlug: string, arrayOfSlideObjects: SliderDataTypes, arrayOfSpecialTypes: string[]) => {
  const slideType = arrayOfSlideObjects.find((slide) => slide.slug === slideSlug)?.type;
  if (!slideType) return false;
  return arrayOfSpecialTypes.includes(slideType);
};
