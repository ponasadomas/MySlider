import React from 'react';
import { SlideType_Recap } from '../../types';

import { Button } from '../../components/Button/Button';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useSliderContext } from '../../core/useSliderContext';

interface RecapSlideProps {
  slideContents: SlideType_Recap;
}

/**
 * "Here's what we heard" review. Each item echoes the answer the user stored on
 * an earlier slide (looked up by `sourceSlug` from sliderAnswers). Structural
 * only — the consumer styles `.slider__recapSlide*`.
 */
export function RecapSlide({ slideContents }: RecapSlideProps) {
  const { sliderSettings, sliderAnswers } = useSliderContext();
  const handleAnswer = useHandleAnswer();

  const valueFor = (slug: string): string => {
    const v = sliderAnswers[slug];
    if (Array.isArray(v)) return v.join(', ');
    return typeof v === 'string' ? v.trim() : '';
  };

  return (
    <div className="slider__recapSlide">
      <div className="slider__slide-content">
        <section className="slider__section">
          <h2 dangerouslySetInnerHTML={{ __html: slideContents.headline }}></h2>

          <dl className="slider__recapSlide-list">
            {slideContents.items.map((item, i) => {
              const value = valueFor(item.sourceSlug);
              const suffix = item.suffixSlug ? valueFor(item.suffixSlug) : '';
              const display = value && suffix ? `${value} (${suffix})` : value;
              return (
                <div className="slider__recapSlide-item" key={i}>
                  <dt className="slider__recapSlide-label">{item.label}</dt>
                  <dd className={`slider__recapSlide-value${display ? '' : ' is-empty'}`}>
                    {display || (slideContents.emptyText ?? '—')}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        <div className="slider__recapSlide-footer">
          <Button
            primary
            flat
            navigation="forward"
            animate={sliderSettings.buttonAnimation}
            addContainer
            onClick={() => handleAnswer(slideContents.slug, 'null')}>
            {slideContents.buttonText ?? 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
