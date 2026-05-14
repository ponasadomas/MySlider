import React from 'react';
import { useSliderContext } from './useSliderContext';
import { Footer } from './Footer';
import type { SlideTypes } from '../types';

interface SlideProps {
  singleSlideData: SlideTypes | undefined;
  refIndex: number;
}

export function Slide({ singleSlideData, refIndex }: SlideProps) {
  const { sliderSlideRef, layouts } = useSliderContext();

  if (!singleSlideData) {
    console.warn('[myslider] No singleSlideData provided to Slide component');
    return null;
  }

  const SelectedSlideComponent = layouts[singleSlideData.type] as
    | React.ComponentType<{ slideContents: SlideTypes }>
    | undefined;

  if (!SelectedSlideComponent) {
    console.error(
      `[myslider] Slide type "${singleSlideData.type}" is not registered. ` +
        `Add it to the \`layouts\` prop of <SliderProvider>.`
    );
    return null;
  }

  return (
    <div
      className="slider__slide-holder"
      key={singleSlideData.slug}
      data-key={singleSlideData.slug}
      ref={(el) => {
        if (el) sliderSlideRef.current[refIndex] = el;
      }}
    >
      <div className="slider__slide-container">
        <SelectedSlideComponent slideContents={singleSlideData} />
      </div>
      <Footer />
    </div>
  );
}
