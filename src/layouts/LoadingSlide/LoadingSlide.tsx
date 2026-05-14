import React from 'react';

import { useLoadingSequence } from '../../hooks/useLoadingSequence';
import { SlideType_LoadingSlide } from '../../types';

interface LoadingSlideProps {
  slideContents: SlideType_LoadingSlide;
}

/**
 * The plain, fully skinnable loading screen. All behaviour lives in
 * `useLoadingSequence` (message cycle, hide-chrome, one-shot advance); this
 * component is just the minimal markup. The consuming project decorates
 * `.slider__loadingSlide-stage` via CSS — or, for anything CSS can't express
 * (extra DOM layers), registers its own component for the `loadingSlide` type
 * built on the same hook.
 */
export function LoadingSlide({ slideContents }: LoadingSlideProps) {
  const { messages, index, visible } = useLoadingSequence(slideContents);

  return (
    <div className="slider__loadingSlide">
      <div className="slider__loadingSlide-content">
        <section className="slider__section">
          {/* Pure styling hook — the consuming project decorates this with
              its loader visual (CSS animation, background, SVG, …). */}
          <div className="slider__loadingSlide-stage" aria-hidden="true" />
          {slideContents.title && (
            <h2 className="slider__loadingSlide-title">{slideContents.title}</h2>
          )}
          <p
            className={`slider__loadingSlide-message${
              visible ? ' is-visible' : ''
            }`}
            aria-live="polite">
            {messages[index] ?? ''}
          </p>
        </section>
      </div>
    </div>
  );
}
