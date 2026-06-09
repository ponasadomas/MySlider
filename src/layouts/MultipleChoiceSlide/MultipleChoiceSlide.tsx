import React, {
  ChangeEvent,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { SlideType_MultipleChoice } from '../../types';

import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useUpdateSliderAnswers } from '../../hooks/useUpdateSliderAnswers';
import { useNudge } from '../../hooks/useNudge';
import { useSliderContext } from '../../core/useSliderContext';
import { ResponsiveImageOutput } from '../../components/ResponsiveImageOutput/ResponsiveImageOutput';

import { Checkbox } from '../Checkbox/Checkbox';
import { Button } from '../../components/Button/Button';

interface MultipleChoiceSlideProps {
  slideContents: SlideType_MultipleChoice;
}

export function MultipleChoiceSlide({
  slideContents
}: MultipleChoiceSlideProps) {
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

    // Use ResizeObserver to detect layout changes (like images loading)
    let resizeObserver: ResizeObserver | null = null;

    if (sectionRef.current) {
      resizeObserver = new ResizeObserver(() => {
        calculateHeights();
      });
      resizeObserver.observe(sectionRef.current);
    }

    return () => {
      window.removeEventListener('resize', calculateHeights);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [calculateHeights]);

  if (!slideContents) {
    console.warn('No slideContents provided to SingleChoiceSlide component');
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

  // "Other" free-text option. The Other checkbox stores a marker value; the
  // text the user types replaces that marker in the persisted/submitted answers.
  const OTHER_VALUE = `${slideContents.slug}-other`;
  const predefinedValues = new Set<string>([
    ...slideContents.answers.map((a) => a.value),
    `${slideContents.slug}-none`,
  ]);

  // On (re)entry, any stored value that isn't a predefined option is the Other
  // text — map it back to the marker and seed the text box.
  const initial = (() => {
    const raw = getInitialCheckedAnswers();
    const otherVal = slideContents.other
      ? raw.find((v) => !predefinedValues.has(v))
      : undefined;
    return {
      checked: raw.map((v) => (otherVal && v === otherVal ? OTHER_VALUE : v)),
      otherText: otherVal ?? ''
    };
  })();

  const [checkedAnswers, setCheckedAnswers] = useState<string[]>(initial.checked);
  const [otherText, setOtherText] = useState<string>(initial.otherText);
  const [disableButton, setDisableButton] = useState(true);
  const handleAnswer = useHandleAnswer();
  const updateSliderAnswers = useUpdateSliderAnswers();

  // Clicking the disabled Continue button glow-pulses the whole choice list —
  // shaking every checkbox would be too busy, so the group is cued as one.
  const { nudged, nudge } = useNudge();

  // The Other marker is swapped for the typed text; empty entries drop out.
  const effectiveAnswers = checkedAnswers
    .map((v) => (v === OTHER_VALUE ? otherText.trim() : v))
    .filter((v) => v.length > 0);

  // Persist on every change so navigating away (e.g. clicking Back) doesn't lose
  // the user's partial selection.
  useEffect(() => {
    updateSliderAnswers(slideContents.slug, effectiveAnswers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedAnswers, otherText]);

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

  // Enable the button when there's at least one effective answer (an Other
  // option with an empty text box doesn't count).
  useEffect(() => {
    setDisableButton(effectiveAnswers.length === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedAnswers, otherText]);

  const renderCheckboxes = slideContents.answers.map((item, index) => {
    const isAnswerChecked = checkedAnswers.includes(item.value);

    const answerData = {
      id: `${slideContents.slug}-${index + 1}`,
      slideSlug: slideContents.slug,
      text: item.text,
      value: item.value,
      description: item.description,
      isChecked: isAnswerChecked
    };

    return (
      <li key={index} className="slider__checkbox">
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
        noneOption: true
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

  const renderOther = () => {
    if (!slideContents.other) return null;
    const isChecked = checkedAnswers.includes(OTHER_VALUE);

    return (
      <li
        key={OTHER_VALUE}
        className={`slider__checkbox slider__checkbox-other${
          isChecked ? ' is-open' : ''
        }`}>
        <Checkbox
          answerData={{
            id: OTHER_VALUE,
            slideSlug: slideContents.slug,
            value: OTHER_VALUE,
            isChecked,
            text: slideContents.other.text ?? 'Other'
          }}
          handleCheckboxChange={handleCheckboxChange}
        />
        {isChecked && (
          <input
            type="text"
            className="slider__checkbox-otherInput"
            placeholder={slideContents.other.placeholder ?? 'Type your own…'}
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            autoFocus
          />
        )}
      </li>
    );
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

  const sliderClassName = `slider__multipleChoiceSlide-${slideContents.layout}`;

  return (
    <div className="slider__multipleChoiceSlide">
      <div className={sliderClassName} ref={parentRef}>
        <div className="slider__slide-content" ref={sliderRef}>
          <section className="slider__section" ref={sectionRef}>
            {slideContents.kicker && (
              <p className="slider__multipleChoiceSlide-kicker">
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
          <div className="slider__checkboxHolder">
            <ul
              className={`slider__multipleChoiceSlide-list${
                nudged ? ' is-nudged' : ''
              }`}>
              {renderCheckboxes}
              {renderOther()}
              {renderNoneOption()}
            </ul>
            <Button
              primary
              flat
              navigation="forward"
              disabled={disableButton}
              onDisabledClick={nudge}
              animate={sliderSettings.buttonAnimation}
              addContainer
              onClick={() => handleAnswer(slideContents.slug, effectiveAnswers)}>
              {slideContents.buttonText ?? 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
