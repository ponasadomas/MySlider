import React, { useEffect, useRef, useCallback } from 'react';
import { RadioButton } from '../RadioButton/RadioButton';
import { ResponsiveImageOutput } from '../../components/ResponsiveImageOutput/ResponsiveImageOutput';
import { SlideType_SingleChoicePicture } from '../../types';

interface SingleChoicePictureSlideProps {
  slideContents: SlideType_SingleChoicePicture;
}

export function SingleChoicePictureSlide({
  slideContents
}: SingleChoicePictureSlideProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const calculateHeights = useCallback(() => {
    if (
      slideContents.layout === 'horizontal' &&
      sliderRef.current &&
      sectionRef.current &&
      parentRef.current
    ) {
      const parent = parentRef.current;
      const viewportHeight = window.innerHeight;
      const element = sliderRef.current;

      const style = window.getComputedStyle(element);
      const paddingTop = parseInt(style.paddingTop, 10);
      const paddingBottom = parseInt(style.paddingBottom, 10);
      const sliderHeight = element.clientHeight - paddingTop - paddingBottom;

      const sectionElement = sectionRef.current;
      const sectionStyle = window.getComputedStyle(sectionElement);
      const sectionHeight =
        sectionElement.offsetHeight +
        parseInt(sectionStyle.marginTop, 10) +
        parseInt(sectionStyle.marginBottom, 10);

      // Set CSS variables for the parent element
      parent.style.setProperty('--viewport-height', `${viewportHeight}px`);
      parent.style.setProperty('--slider-padding-top', `${paddingTop}px`);
      parent.style.setProperty('--slider-padding-bottom', `${paddingBottom}px`);
      parent.style.setProperty('--slider-height', `${sliderHeight}px`);
      parent.style.setProperty('--section-height', `${sectionHeight}px`);
    }
  }, [slideContents.layout]);

  useEffect(() => {
    calculateHeights();
    window.addEventListener('resize', calculateHeights);

    return () => {
      window.removeEventListener('resize', calculateHeights);
    };
  }, [calculateHeights]);

  if (!slideContents) {
    console.warn(
      'No slideContents provided to SingleChoicePictureSlide component'
    );
    return null;
  }

  // Helper function to remove emojis and trim whitespace
  const stripEmojis = (text: string): string => {
    return text.replace(/[\p{Emoji}\p{Emoji_Component}]/gu, '').trim();
  };

  const isYesNoType =
    slideContents.answers.length === 2 &&
    ((stripEmojis(slideContents.answers[0].text).toLowerCase() === 'yes' &&
      stripEmojis(slideContents.answers[1].text).toLowerCase() === 'no') ||
      (stripEmojis(slideContents.answers[0].text).toLowerCase() === 'no' &&
        stripEmojis(slideContents.answers[1].text).toLowerCase() === 'yes'));

  const renderAnswers = slideContents.answers.map((item, index) => {
    const answerData = {
      id: `${slideContents.slug}-${index + 1}`,
      slideSlug: slideContents.slug,
      text: item.text,
      value: item.value,
      image: item.image
    };

    return (
      <li key={index} className="slider__radioButton">
        <RadioButton answerData={answerData} />
      </li>
    );
  });

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

  const sliderClassName = `slider__singleChoicePictureSlide-${slideContents.layout}`;

  return (
    <div className="slider__singleChoicePictureSlide">
      <div className={sliderClassName} ref={parentRef}>
        <div className="slider__slide-content" ref={sliderRef}>
          <section className="slider__section" ref={sectionRef}>
            {renderImage()}
            {slideContents.kicker && (
              <p className="slider__singleChoicePictureSlide-kicker">
                {slideContents.kicker}
              </p>
            )}
            {slideContents.subtext?.position === 'top' && (
              <p
                className="slider__subtext-top"
                dangerouslySetInnerHTML={{
                  __html: slideContents.subtext.text
                }}></p>
            )}
            <h2 dangerouslySetInnerHTML={{ __html: slideContents.question }}></h2>
            {slideContents.subtext?.position === 'bottom' && (
              <p
                className="slider__subtext-bottom"
                dangerouslySetInnerHTML={{
                  __html: slideContents.subtext.text
                }}></p>
            )}
          </section>
          <ul
            className={`slider__singleChoice ${
              isYesNoType ? 'slider__singleChoice-yesno' : ''
            }`}>
            {renderAnswers}
          </ul>
        </div>
      </div>
    </div>
  );
}
