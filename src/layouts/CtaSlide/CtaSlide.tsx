import React from 'react';

import { Button } from '../../components/Button/Button';
import { ResponsiveImageOutput } from '../../components/ResponsiveImageOutput/ResponsiveImageOutput';
import { SlideType_CtaSlide } from '../../types';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useSliderContext } from '../../core/useSliderContext';

interface CtaSlideProps {
  slideContents: SlideType_CtaSlide;
}

export function CtaSlide({ slideContents }: CtaSlideProps) {
  const handleAnswer = useHandleAnswer();
  const { sliderSettings } = useSliderContext();

  const handleButtonClick = (answerValue: string) => {
    handleAnswer(slideContents.slug, answerValue);
  };

  return (
    <div className="slider__ctaSlide">
      <div className="slider__slide-content">
        {slideContents.image.position === 'top' && (
          <ResponsiveImageOutput
            png={slideContents.image.png}
            webp={slideContents.image.webp}
            sizes={slideContents.image.sizes}
            alt={slideContents.image.alt || ''}
          />
        )}
        <section className="slider__section">
          <h2 dangerouslySetInnerHTML={{ __html: slideContents.headline }}></h2>
          <div
            className="slider__copyBlock"
            dangerouslySetInnerHTML={{ __html: slideContents.copyHtml }}></div>
          <nav>
            <Button
              primary
              flat
              navigation="forward"
              animate={sliderSettings.buttonAnimation}
              onClick={() =>
                handleButtonClick(slideContents.buttons.agree.value)
              }>
              {slideContents.buttons.agree.text}
            </Button>

            <Button
              transparent
              navigation="forward"
              animate={sliderSettings.buttonAnimation}
              onClick={() =>
                handleButtonClick(slideContents.buttons.disagree.value)
              }>
              {slideContents.buttons.disagree.text}
            </Button>
          </nav>
        </section>
        {slideContents.image.position === 'bottom' && (
          <ResponsiveImageOutput
            png={slideContents.image.png}
            webp={slideContents.image.webp}
            sizes={slideContents.image.sizes}
            alt={slideContents.image.alt || ''}
          />
        )}
      </div>
    </div>
  );
}
