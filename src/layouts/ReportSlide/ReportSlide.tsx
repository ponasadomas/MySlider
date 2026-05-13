import React from 'react';
import { SlideType_Report } from '../../types';

import { Button } from '../../components/Button/Button';
import { ResponsiveImageOutput } from '../../components/ResponsiveImageOutput/ResponsiveImageOutput';

import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useSliderContext } from '../../core/useSliderContext';

interface ReportSlideProps {
  slideContents: SlideType_Report;
}

export function ReportSlide({ slideContents }: ReportSlideProps) {
  const { sliderSettings } = useSliderContext();

  const buttonText = slideContents.buttonText ?? 'Continue';
  const handleAnswer = useHandleAnswer();

  const handleButtonClick = () => {
    handleAnswer(slideContents.slug, 'null');
  };

  const renderImage = () => {
    if (!slideContents.image || slideContents.image.position !== 'top') {
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
          <div className="slider__report-copyImage" key={index}>
            <img
              key={index}
              src={imageObj.svg}
              alt={imageObj.alt || ''}
              className="slider__report-image slider__report-svg-image"
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
            className="slider__report-image"
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
            className="slider__report-image"
          />
        );
      }
    });
  };

  return (
    <div className="slider__reportSlide">
      <div className="slider__slide-content">
        {renderImage()}
        <section className="slider__section">
          <h2 dangerouslySetInnerHTML={{ __html: slideContents.headline }}></h2>
          <div className="slider__report">
            <header>
              <h3>Procrastination Score:</h3>
              <p>Normal: 9.3</p>
            </header>
            <aside className="slider__report-scoreBar">
              <div className="slider__report-bubble">
                <p>You: 18.79</p>
              </div>
            </aside>
            <ul className="slider__report-levels">
              <li>Low</li>
              <li>Average</li>
              <li>Medium</li>
              <li>High</li>
            </ul>
            <blockquote>
              <div>
                <p>
                  <strong>HIGH procrastination</strong>
                </p>
                <p>
                  Chronic procrastination at this level is characterized by
                  ongoing delays in taking action, which significantly disrupts
                  daily functioning and overall life satisfaction.
                </p>
              </div>
            </blockquote>
            <ul className="slider__report-legend">
              <li>
                <span>Procrastination Type</span>
                <strong>Complex</strong>
              </li>
              <li>
                <span>Life Satisfaction</span>
                <strong>Below average</strong>
              </li>
              <li>
                <span>Trigger</span>
                <strong>Social Pressure</strong>
              </li>
              <li>
                <span>Self-confidence Level</span>
                <strong>Below average</strong>
              </li>
            </ul>
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
