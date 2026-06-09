import React from 'react';
import { SlideType_Score } from '../../types';

import { Button } from '../../components/Button/Button';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useSliderContext } from '../../core/useSliderContext';

interface ScoreSlideProps {
  slideContents: SlideType_Score;
}

/**
 * Sums the numeric answers stored under `sourceSlugs` (e.g. a GAD-7 set) and
 * displays the total with an optional severity band. Structural only — the
 * consumer styles `.slider__scoreSlide*`.
 */
export function ScoreSlide({ slideContents }: ScoreSlideProps) {
  const { sliderSettings, sliderAnswers } = useSliderContext();
  const handleAnswer = useHandleAnswer();

  const score = slideContents.sourceSlugs.reduce((sum, slug) => {
    const v = sliderAnswers[slug];
    const n = typeof v === 'string' ? parseInt(v, 10) : Array.isArray(v) ? parseInt(v[0], 10) : NaN;
    return sum + (Number.isNaN(n) ? 0 : n);
  }, 0);

  const band = slideContents.bands?.find((b) => score <= b.upTo)?.label;
  const headline = slideContents.headline.replace('{score}', String(score));

  return (
    <div className="slider__scoreSlide">
      <div className="slider__slide-content">
        <section className="slider__section">
          <div className="slider__scoreSlide-number">{score}</div>
          <h2 dangerouslySetInnerHTML={{ __html: headline }}></h2>
          {band && <div className="slider__scoreSlide-band">{band}</div>}
          {slideContents.subtext && (
            <p className="slider__scoreSlide-sub" dangerouslySetInnerHTML={{ __html: slideContents.subtext }}></p>
          )}
        </section>

        <div className="slider__scoreSlide-footer">
          <Button
            primary
            flat
            navigation="forward"
            animate={sliderSettings.buttonAnimation}
            addContainer
            onClick={() => handleAnswer(slideContents.slug, String(score))}>
            {slideContents.buttonText ?? 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
