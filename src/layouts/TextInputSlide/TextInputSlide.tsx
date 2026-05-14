import React, { useState, useEffect } from 'react';

import { Button } from '../../components/Button/Button';
import { SlideType_TextInput } from '../../types';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useUpdateSliderAnswers } from '../../hooks/useUpdateSliderAnswers';
import { useNudge } from '../../hooks/useNudge';
import { useSliderContext } from '../../core/useSliderContext';

interface TextInputSlideProps {
  slideContents: SlideType_TextInput;
}

// A single-line text-input slide — first name, city, anything short. The
// email slide's plain cousin: same card + field shape, without the email
// regex, the consent gate, or the marketing-service POST.
export function TextInputSlide({ slideContents }: TextInputSlideProps) {
  const [userInput, setUserInput] = useState('');

  const { sliderAnswers, sliderSettings } = useSliderContext();
  const handleAnswer = useHandleAnswer();
  const updateSliderAnswers = useUpdateSliderAnswers();

  // Clicking the disabled Continue button shakes the input card — a wordless
  // hint that the field still needs filling in.
  const { nudged, nudge } = useNudge();

  useEffect(() => {
    const previous = sliderAnswers[slideContents.slug] as string;
    setUserInput(previous || '');
  }, [sliderAnswers, slideContents.slug]);

  // Persist on every keystroke so a typed-but-not-submitted value survives
  // back-navigation — `handleAnswer` only writes it on submit. Mirrors
  // EmailSlide / MultipleChoiceSlide. Depends only on `userInput`:
  // `updateSliderAnswers` is a fresh closure each render and must not be a
  // dependency.
  useEffect(() => {
    updateSliderAnswers(slideContents.slug, userInput);
  }, [userInput]);

  const minLength = slideContents.minLength ?? 1;
  const canSubmit = userInput.trim().length >= minLength;

  const handleSubmit = () => {
    if (!canSubmit) return;
    handleAnswer(slideContents.slug, userInput.trim());
  };

  const handleKeyboardPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="slider__textInputSlide">
      <div className="slider__slide-content">
        <section className="slider__section">
          {slideContents.kicker && (
            <p className="slider__textInputSlide-kicker">
              {slideContents.kicker}
            </p>
          )}
          {slideContents.subtext?.position === 'top' && (
            <p
              className="slider__subtext-top"
              dangerouslySetInnerHTML={{ __html: slideContents.subtext.text }}
            />
          )}
          <h2
            dangerouslySetInnerHTML={{ __html: slideContents.question }}></h2>
          {slideContents.subtext?.position === 'bottom' && (
            <p
              className="slider__subtext-bottom"
              dangerouslySetInnerHTML={{ __html: slideContents.subtext.text }}
            />
          )}
        </section>

        <div
          className={`slider__textInputSlide-card${
            nudged ? ' is-nudged' : ''
          }`}>
          <label className="slider__textInputSlide-field">
            {slideContents.inputLabel && (
              <span className="slider__textInputSlide-fieldCaption">
                {slideContents.inputLabel}
              </span>
            )}
            <span className="slider__textInputSlide-fieldRow">
              <input
                required
                type={slideContents.inputType || 'text'}
                name={slideContents.slug}
                value={userInput}
                placeholder={slideContents.inputPlaceholder || ''}
                autoComplete={slideContents.autoComplete}
                onChange={(event) => setUserInput(event.target.value)}
                onKeyDown={handleKeyboardPress}
              />
            </span>
          </label>
        </div>

        <Button
          primary
          flat
          navigation="forward"
          disabled={!canSubmit}
          onDisabledClick={nudge}
          animate={sliderSettings.buttonAnimation}
          addContainer
          onClick={handleSubmit}>
          {slideContents.buttonText || 'Continue'}
        </Button>
      </div>
    </div>
  );
}
