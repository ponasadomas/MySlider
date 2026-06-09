import React, { useState } from 'react';
import { SlideType_Quiz } from '../../types';

import { Button } from '../../components/Button/Button';
import { ResponsiveImageOutput } from '../../components/ResponsiveImageOutput/ResponsiveImageOutput';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useSliderContext } from '../../core/useSliderContext';

interface QuizSlideProps {
  slideContents: SlideType_Quiz;
}

const CheckIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
);
const CrossIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
);

/**
 * Single-choice quiz with feedback. Selecting an answer reveals whether it was
 * right, with an explanation, then a button advances. No visual CSS ships from
 * the library — the consumer styles `.slider__quizSlide*`.
 */
export function QuizSlide({ slideContents }: QuizSlideProps) {
  const { sliderSettings } = useSliderContext();
  const handleAnswer = useHandleAnswer();

  const [selected, setSelected] = useState<number | null>(null);
  const revealed = selected !== null;
  const isCorrect = revealed && !!slideContents.answers[selected!]?.correct;

  const onPick = (i: number) => {
    if (revealed) return;
    setSelected(i);
  };

  const renderImage = () => {
    const image = slideContents.image;
    if (!image) return null;
    if ('svg' in image) {
      return (
        <img src={image.svg} alt={image.alt || ''} className="slider__svg-image" />
      );
    }
    return (
      <ResponsiveImageOutput
        png={image.png}
        webp={image.webp}
        sizes={image.sizes}
        alt={image.alt || ''}
      />
    );
  };

  return (
    <div className="slider__quizSlide">
      <div className="slider__slide-content">
        <section className="slider__section">
          {renderImage()}
          {slideContents.prompt && (
            <p className="slider__quizSlide-prompt">{slideContents.prompt}</p>
          )}
          <h2 dangerouslySetInnerHTML={{ __html: slideContents.question }}></h2>

          <ul className="slider__quizSlide-answers">
            {slideContents.answers.map((a, i) => {
              const stateClass = revealed
                ? a.correct
                  ? ' is-correct'
                  : i === selected
                  ? ' is-wrong'
                  : ''
                : '';
              return (
                <li key={i}>
                  <button
                    type="button"
                    className={`slider__quizSlide-answer${i === selected ? ' is-selected' : ''}${stateClass}`}
                    onClick={() => onPick(i)}
                    aria-pressed={i === selected}>
                    {a.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {revealed && (
        <div className={`slider__quizSlide-result ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
          <div className="slider__quizSlide-result-icon">{isCorrect ? CheckIcon : CrossIcon}</div>
          <h3 className="slider__quizSlide-result-heading">
            {isCorrect
              ? slideContents.correctHeading ?? 'Correct!'
              : slideContents.wrongHeading ?? 'In fact…'}
          </h3>
          <p className="slider__quizSlide-result-text">{slideContents.explanation}</p>
          <Button
            primary
            flat
            navigation="forward"
            animate={sliderSettings.buttonAnimation}
            addContainer
            onClick={() => handleAnswer(slideContents.slug, slideContents.answers[selected!].text)}>
            {slideContents.buttonText ?? 'Continue'}
          </Button>
        </div>
      )}
    </div>
  );
}
