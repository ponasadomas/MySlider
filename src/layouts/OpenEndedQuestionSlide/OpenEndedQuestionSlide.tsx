import React, { useState, useEffect } from 'react';

import { Button } from '../../components/Button/Button';

import { SlideType_OpenEndedQuestion } from '../../types';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useSliderContext } from '../../core/useSliderContext';

interface OpenEndedQuestionSlideProps {
  slideContents: SlideType_OpenEndedQuestion;
}

export function OpenEndedQuestionSlide({
  slideContents
}: OpenEndedQuestionSlideProps) {
  if (!slideContents) {
    console.warn('No slideContents provided to SingleChoiceSlide component');
    return null;
  }

  const { sliderAnswers, sliderSettings } = useSliderContext();
  const handleAnswer = useHandleAnswer();

  // The saved answer for this slide, ignoring the legacy `'null'` sentinel.
  const savedAnswer = (): string => {
    const previousAnswer = sliderAnswers[slideContents.slug] as string;
    return previousAnswer && previousAnswer !== 'null' ? previousAnswer : '';
  };

  // Seed from the saved answer on the FIRST render (lazy init) so a pre-filled
  // textarea never flashes its placeholder before an effect fills it in.
  const [userAnswer, setUserAnswer] = useState(savedAnswer);
  const [answerError, setAnswerError] = useState(false);

  // Re-sync if the saved answer changes (e.g. navigating back to this slide, or
  // answers loading in after mount).
  useEffect(() => {
    setUserAnswer(savedAnswer());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliderAnswers, slideContents.slug]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswerError(false);
    setUserAnswer(event.target.value);
  };

  const handleButtonClick = (event: React.SyntheticEvent) => {
    if (userAnswer.length === 0 && slideContents.required) {
      setAnswerError(true);
    } else {
      handleAnswer(
        slideContents.slug,
        slideContents.required
          ? userAnswer
          : userAnswer == ''
          ? ' '
          : userAnswer
      );
    }
  };

  return (
    <div className="slider__openEndedQuestionSlide slider__formElements">
      <div className="slider__slide-content">
        <section className="slider__section">
          <div
            className={`slider__openEndedQuestionSlide-${
              slideContents.required ? 'required' : 'optional'
            }`}>
            {slideContents.required ? 'Required' : 'Optional'}
          </div>
          {slideContents.kicker && (
            <p className="slider__openEndedQuestionSlide-kicker">
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
          {(() => {
            const fromRaw = slideContents.questionFromAnswer
              ? sliderAnswers[slideContents.questionFromAnswer]
              : undefined;
            const fromAnswer = typeof fromRaw === 'string' ? fromRaw.trim() : '';
            return fromAnswer ? (
              <h2>{fromAnswer}</h2>
            ) : (
              <h2 dangerouslySetInnerHTML={{ __html: slideContents.question }}></h2>
            );
          })()}
          {slideContents.subtext?.position === 'bottom' && (
            <p
              className="slider__subtext-bottom"
              dangerouslySetInnerHTML={{
                __html: slideContents.subtext.text
              }}></p>
          )}
        </section>
        <aside className="slider__openEndedQuestionSlide-form slider__formElements-container">
          <div
            className={`slider__formElements-labelHolder ${
              answerError
                ? 'slider__formElements-error slider__formElements-headShake'
                : ''
            }`}>
            <textarea
              required
              placeholder=" "
              rows={4}
              name={slideContents.slug}
              onChange={handleInputChange}
              value={userAnswer}></textarea>
            <span className="slider__formElements-label">
              {slideContents.placeholder}
            </span>
          </div>
          <Button
            primary
            flat
            navigation="forward"
            animate={sliderSettings.buttonAnimation}
            disabled={
              slideContents.required
                ? userAnswer.trim()
                  ? false
                  : true
                : false
            }
            onClick={(event) => handleButtonClick(event)}>
            {slideContents.buttonText ?? 'Continue'}
          </Button>
        </aside>
      </div>
    </div>
  );
}
