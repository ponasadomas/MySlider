import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RadioButton } from '../RadioButton/RadioButton';
import { Button } from '../../components/Button/Button';
import { ResponsiveImageOutput } from '../../components/ResponsiveImageOutput/ResponsiveImageOutput';
import { SlideType_SingleChoice } from '../../types';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useUpdateSliderAnswers } from '../../hooks/useUpdateSliderAnswers';
import { useNudge } from '../../hooks/useNudge';
import { useSliderContext } from '../../core/useSliderContext';

interface SingleChoiceSlideProps {
  slideContents: SlideType_SingleChoice;
}

export function SingleChoiceSlide({ slideContents }: SingleChoiceSlideProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const { sliderAnswers, sliderSettings } = useSliderContext();
  const handleAnswer = useHandleAnswer();
  const updateSliderAnswers = useUpdateSliderAnswers();

  // Clicking the disabled Continue button shakes the "please specify" field —
  // a wordless hint that it still needs filling in. Only reachable in specify
  // mode, since that's the only time this slide shows a Continue button.
  const { nudged, nudge } = useNudge();

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

  // Does any answer open a "please specify" text field? If so, that one
  // answer alone gets special handling: choosing it reveals an inline text
  // field plus a Continue button instead of advancing, since the user has
  // to type first. Every *other* answer still advances the instant it's
  // chosen — exactly like a slide with no specify answer at all.
  const answers = slideContents?.answers ?? [];
  const specifyAnswer = answers.find((a) => a.specify);
  const hasSpecify = !!specifyAnswer;

  // Button-mode state. `selectedValue` is the chosen answer's `value`;
  // `specifyText` is what the user typed for the specify answer.
  const [selectedValue, setSelectedValue] = useState('');
  const [specifyText, setSpecifyText] = useState('');
  const isSpecifySelected =
    !!specifyAnswer && selectedValue === specifyAnswer.value;

  // Restore a prior selection. A plain answer is stored as its `value`; the
  // specify answer is stored as the typed text — so anything that isn't a
  // plain answer value is treated as the specify text.
  useEffect(() => {
    if (!slideContents || !hasSpecify) return;
    const stored = sliderAnswers[slideContents.slug];
    if (typeof stored !== 'string' || !stored) return;
    const plain = answers.find((a) => !a.specify && a.value === stored);
    if (plain) {
      setSelectedValue(stored);
      setSpecifyText('');
    } else if (specifyAnswer) {
      setSelectedValue(specifyAnswer.value);
      setSpecifyText(stored);
    }
  }, [sliderAnswers, slideContents?.slug]);

  // Persist on every change so a selection survives back-navigation —
  // `handleAnswer` only writes on submit. Depends only on the state values:
  // `updateSliderAnswers` is a fresh closure each render and must not be a
  // dependency.
  useEffect(() => {
    if (!slideContents || !hasSpecify) return;
    updateSliderAnswers(
      slideContents.slug,
      isSpecifySelected ? specifyText.trim() : selectedValue
    );
  }, [selectedValue, specifyText]);

  if (!slideContents) {
    console.warn('No slideContents provided to SingleChoiceSlide component');
    return null;
  }

  const isYesNoType =
    slideContents.answers.length === 2 &&
    slideContents.answers[0].text.toLowerCase() === 'yes' &&
    slideContents.answers[1].text.toLowerCase() === 'no';

  // ── Advance-on-click mode (no specify answer) — unchanged ──
  const renderAnswers = slideContents.answers.map((item, index) => {
    const answerData = {
      id: `${slideContents.slug}-${index + 1}`,
      slideSlug: slideContents.slug,
      text: item.text,
      value: item.value
    };

    return (
      <li key={index} className="slider__radioButton">
        <RadioButton answerData={answerData} />
      </li>
    );
  });

  // ── Specify mode (a specify answer is present) ──
  // The Continue button only appears once the specify answer is chosen, so
  // submitting just needs non-empty text in the field.
  const canSubmit = specifyText.trim().length > 0;

  const handleContinue = () => {
    if (!canSubmit) return;
    handleAnswer(slideContents.slug, specifyText.trim());
  };

  const renderAnswersWithSpecify = slideContents.answers.map((item, index) => {
    const id = `${slideContents.slug}-${index + 1}`;
    const checked = selectedValue === item.value;

    return (
      <li
        key={index}
        className={`slider__radioButton${
          item.specify ? ' slider__radioButton-specify' : ''
        }`}>
        <input
          type="radio"
          name={slideContents.slug}
          id={id}
          value={item.value}
          checked={checked}
          onChange={() => {
            setSelectedValue(item.value);
            // A plain answer behaves like normal singleChoice — advance at
            // once. The specify answer instead reveals its field and the
            // Continue button below, so it must not advance here.
            if (!item.specify) {
              setTimeout(
                () => handleAnswer(slideContents.slug, item.value),
                sliderSettings.navigation.clickDelay
              );
            }
          }}
        />
        <label htmlFor={id}>
          <div>
            <span>{item.text}</span>
          </div>
        </label>
        {item.specify && (
          <div
            className={`slider__radioButton-specifyField${
              nudged ? ' is-nudged' : ''
            }`}>
            <input
              type="text"
              name={`${slideContents.slug}-specify`}
              placeholder={item.specify.placeholder || ''}
              value={specifyText}
              autoComplete="off"
              onChange={(event) => {
                setSpecifyText(event.target.value);
                // Typing in the field selects its answer (mirrors the mockup).
                if (!checked) setSelectedValue(item.value);
              }}
            />
          </div>
        )}
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

  const sliderClassName = `slider__singleChoiceSlide-${slideContents.layout}`;

  return (
    <div className="slider__singleChoiceSlide">
      <div className={sliderClassName} ref={parentRef}>
        <div className="slider__slide-content" ref={sliderRef}>
          <section className="slider__section" ref={sectionRef}>
            {renderImage()}
            {slideContents.kicker && (
              <p className="slider__singleChoiceSlide-kicker">
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
            {hasSpecify ? renderAnswersWithSpecify : renderAnswers}
          </ul>
          {isSpecifySelected && (
            <Button
              primary
              flat
              navigation="forward"
              disabled={!canSubmit}
              onDisabledClick={nudge}
              animate={sliderSettings.buttonAnimation}
              addContainer
              onClick={handleContinue}>
              {slideContents.buttonText || 'Continue'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
