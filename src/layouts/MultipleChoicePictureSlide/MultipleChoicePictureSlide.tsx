import React, {
  ChangeEvent,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { SlideType_MultipleChoicePicture } from '../../types';

import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useUpdateSliderAnswers } from '../../hooks/useUpdateSliderAnswers';
import { useSliderContext } from '../../core/useSliderContext';
import { ResponsiveImageOutput } from '../../components/ResponsiveImageOutput/ResponsiveImageOutput';

import { Checkbox } from '../Checkbox/Checkbox';
import { Button } from '../../components/Button/Button';

interface MultipleChoicePictureSlideProps {
  slideContents: SlideType_MultipleChoicePicture;
}

export function MultipleChoicePictureSlide({
  slideContents
}: MultipleChoicePictureSlideProps) {
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
      'No slideContents provided to MultipleChoicePictureSlide component'
    );
    return null;
  }

  const { sliderAnswers, sliderSettings } = useSliderContext();

  // Function to ensure the checked answer values are always string[]
  const getInitialCheckedAnswers = () => {
    const answers = sliderAnswers[slideContents.slug];
    if (Array.isArray(answers)) {
      // Return as is if it's already an array
      return answers;
    } else if (typeof answers === 'string') {
      // Convert to array if it's a string
      return [answers];
    } else {
      // Default to empty array if it's neither
      return [];
    }
  };

  const [checkedAnswers, setCheckedAnswers] = useState<string[]>(
    getInitialCheckedAnswers
  );
  const [disableButton, setDisableButton] = useState(true);
  const handleAnswer = useHandleAnswer();
  const updateSliderAnswers = useUpdateSliderAnswers();

  // Persist checkbox state on every change so navigating away doesn't lose the
  // user's partial selection.
  useEffect(() => {
    updateSliderAnswers(slideContents.slug, checkedAnswers);
  }, [checkedAnswers]);

  // Function to fire whenever a checkbox is checked or unchecked
  const handleCheckboxChange = (
    event: ChangeEvent<HTMLInputElement>,
    isNoneOption: boolean
  ): void => {
    const value = event.target.value;
    let newCheckedAnswers;

    if (event.target.checked) {
      if (isNoneOption) {
        // If 'None' is checked, uncheck all other checkboxes
        newCheckedAnswers = [value];
      } else {
        // If any other checkbox is checked, uncheck 'None'
        newCheckedAnswers = checkedAnswers.filter(
          (answer) => answer !== `${slideContents.slug}-none`
        );
        newCheckedAnswers.push(value);
      }
    } else {
      newCheckedAnswers = checkedAnswers.filter((answer) => answer !== value);
    }

    setCheckedAnswers(newCheckedAnswers);
  };

  // Enable or disable button based on checkedAnswers
  useEffect(() => {
    setDisableButton(checkedAnswers.length === 0);
  }, [checkedAnswers]);

  const renderCheckboxes = slideContents.answers.map((item, index) => {
    const isAnswerChecked = checkedAnswers.includes(item.value);

    const answerData = {
      id: `${slideContents.slug}-${index + 1}`,
      slideSlug: slideContents.slug,
      text: item.text,
      value: item.value,
      isChecked: isAnswerChecked,
      image: item.image
    };

    return (
      <li key={index} className="slider__checkboxPicture">
        <Checkbox
          answerData={answerData}
          handleCheckboxChange={handleCheckboxChange}
        />
      </li>
    );
  });

  const renderNoneOption = () => {
    if (slideContents.noneOption) {
      const isAnswerChecked = checkedAnswers.includes(
        `${slideContents.slug}-none`
      );

      const answerData = {
        id: `${slideContents.slug}-none`,
        slideSlug: slideContents.slug,
        value: `${slideContents.slug}-none`,
        isChecked: isAnswerChecked,
        text: slideContents.noneOption.text,
        noneOption: true,
        image: slideContents.noneOption.image
      };

      return (
        <li key={`${slideContents.slug}-none`} className="slider__checkbox">
          <Checkbox
            answerData={answerData}
            handleCheckboxChange={handleCheckboxChange}
          />
        </li>
      );
    }
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

  const sliderClassName = `slider__multipleChoicePictureSlide-${slideContents.layout}`;

  return (
    <div className="slider__multipleChoicePictureSlide">
      <div className={sliderClassName} ref={parentRef}>
        <div className="slider__slide-content" ref={sliderRef}>
          <section className="slider__section" ref={sectionRef}>
            {slideContents.subtext?.position === 'top' && (
              <p
                className="slider__subtext-top"
                dangerouslySetInnerHTML={{
                  __html: slideContents.subtext.text
                }}></p>
            )}
            {renderImage()}
            <h2 dangerouslySetInnerHTML={{ __html: slideContents.question }}></h2>
            {slideContents.subtext?.position === 'bottom' && (
              <p
                className="slider__subtext-bottom"
                dangerouslySetInnerHTML={{
                  __html: slideContents.subtext.text
                }}></p>
            )}
          </section>
          <div className="slider__checkboxPictureHolder">
            <ul className="slider__multipleChoicePictureSlide-list">
              {renderCheckboxes}
              {renderNoneOption()}
            </ul>
            <Button
              primary
              flat
              navigation="forward"
              disabled={disableButton}
              animate={sliderSettings.buttonAnimation}
              addContainer
              onClick={() => handleAnswer(slideContents.slug, checkedAnswers)}>
              {slideContents.buttonText ?? 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
