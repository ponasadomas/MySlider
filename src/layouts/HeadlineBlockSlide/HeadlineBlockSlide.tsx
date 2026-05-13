import React from 'react';
import { SlideType_HeadlineBlock } from '../../types';

import { Button } from '../../components/Button/Button';

import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useSliderContext } from '../../core/useSliderContext';

interface HeadlineBlockProps {
  slideContents: SlideType_HeadlineBlock;
}

export function HeadlineBlockSlide({ slideContents }: HeadlineBlockProps) {
  const { sliderSettings } = useSliderContext();

  const buttonText = slideContents.buttonText ?? 'Continue';
  const handleAnswer = useHandleAnswer();

  const handleButtonClick = () => {
    handleAnswer(slideContents.slug, 'null');
  };

  return (
    <div className="slider__headlineBlockSlide">
      <div className="slider__slide-content">
        <section className="slider__section">
          <h2 dangerouslySetInnerHTML={{ __html: slideContents.headline }}></h2>
          <div
            className="slider__headlineBlock"
            dangerouslySetInnerHTML={{ __html: slideContents.copyHtml }}></div>
          <Button
            primary
            flat
            navigation="forward"
            animate={sliderSettings.buttonAnimation}
            addContainer
            onClick={() => handleButtonClick()}>
            {buttonText}
          </Button>
        </section>
        {/* {slideContents.image.position === 'bottom' && (
          <ResponsiveImageBlock
            png={slideContents.image.png}
            webp={slideContents.image.webp}
            sizes={slideContents.image.sizes}
            alt={slideContents.image.alt}
          />
        )} */}
      </div>
    </div>
  );
}
