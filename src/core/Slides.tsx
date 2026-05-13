import React, { useEffect } from 'react';
import { useSliderContext } from './useSliderContext';
import { Slide } from './Slide';

export function Slides() {
  const {
    sliderData,
    currentSlideSlug,
    nextSlideSlug,
    setCurrentSlideCategory
  } = useSliderContext();

  const currentSlideData = sliderData.find(
    (slide) => slide.slug === currentSlideSlug
  );
  const nextSlideData = sliderData.find(
    (slide) => slide.slug === nextSlideSlug
  );

  useEffect(() => {
    if (currentSlideData) {
      setCurrentSlideCategory(currentSlideData.category);
    }
  }, [currentSlideData]);

  return (
    <>
      {currentSlideData && (
        <Slide singleSlideData={currentSlideData} refIndex={0} />
      )}
      {nextSlideSlug && nextSlideSlug !== currentSlideSlug && (
        <Slide singleSlideData={nextSlideData} refIndex={1} />
      )}
    </>
  );
}
