import React from 'react';
import { SlideType_CopyBlock } from '../../types';

import { Button } from '../../components/Button/Button';
import { ResponsiveImageOutput } from '../../components/ResponsiveImageOutput/ResponsiveImageOutput';

import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useSliderContext } from '../../core/useSliderContext';

interface CopyBlockProps {
  slideContents: SlideType_CopyBlock;
}

export function CopyBlockSlide({ slideContents }: CopyBlockProps) {
  const { sliderSettings } = useSliderContext();

  const buttonText = slideContents.buttonText ?? 'Continue';
  const handleAnswer = useHandleAnswer();

  const handleButtonClick = () => {
    // A dead-end branch slide (e.g. "come back when you've done the experiment")
    // exits the funnel without completing it — so the host doesn't mark the
    // lesson done. Everything else advances normally.
    if (slideContents.exitOnButton) {
      sliderSettings.navigation.onExit?.();
      return;
    }
    handleAnswer(slideContents.slug, 'null');
  };

  const renderImage = () => {
    if (!slideContents.image) {
      return null;
    }

    // Check if it's an SVG image
    if ('svg' in slideContents.image) {
      return (
        <img
          src={slideContents.image.svg}
          alt={slideContents.image.alt || ''}
          className="slider__svg-image"
        />
      );
    }

    // Otherwise, it's a responsive image (backwards compatible)
    return (
      <ResponsiveImageOutput
        png={slideContents.image.png}
        webp={slideContents.image.webp}
        sizes={slideContents.image.sizes}
        alt={slideContents.image.alt || ''}
      />
    );
  };

  const renderCopyImages = () => {
    if (!slideContents.copyImages || slideContents.copyImages.length === 0) {
      return null;
    }

    return slideContents.copyImages.map((imageObj, index) => {
      // Check if it's an SVG image
      if ('svg' in imageObj) {
        return (
          <div className="slider__copyBlock-copyImage" key={index}>
            <img
              key={index}
              src={imageObj.svg}
              alt={imageObj.alt || ''}
              className="slider__copyBlock-image slider__copyBlock-svg-image"
            />
          </div>
        );
      }

      // Check if it's a nested structure (with png/webp objects) or flat structure (direct from webpack)
      const isNestedStructure = 'png' in imageObj;

      if (isNestedStructure) {
        // Standard nested structure with png/webp objects
        return (
          <ResponsiveImageOutput
            key={index}
            png={imageObj.png}
            webp={imageObj.webp}
            sizes={imageObj.sizes}
            alt={imageObj.alt || ''}
            className="slider__copyBlock-image"
          />
        );
      } else {
        // Flat structure - webpack plugin returns PNG data directly at root level
        // Need to wrap it in the expected structure
        return (
          <ResponsiveImageOutput
            key={index}
            png={{
              srcSet: imageObj.srcSet,
              images: imageObj.images,
              src: imageObj.src,
              width: imageObj.width,
              height: imageObj.height
            }}
            sizes={imageObj.sizes}
            alt={imageObj.alt || ''}
            lazy={imageObj.lazy}
            className="slider__copyBlock-image"
          />
        );
      }
    });
  };

  return (
    <div className="slider__copyBlockSlide">
      <div className="slider__slide-content">
        {slideContents.image?.position === 'top' && renderImage()}
        <section className="slider__section">
          <h2 dangerouslySetInnerHTML={{ __html: slideContents.headline }}></h2>
          <div className="slider__copyBlock">
            <div
              dangerouslySetInnerHTML={{
                __html: slideContents.copyHtml
              }}></div>
            {renderCopyImages()}
          </div>
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
        {slideContents.image?.position === 'bottom' && renderImage()}
      </div>
    </div>
  );
}
