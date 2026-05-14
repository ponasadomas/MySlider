import React from 'react';

import { useSliderContext } from './useSliderContext';
import { ProgressBar } from '../components/ProgressBar/ProgressBar';
import { Button } from '../components/Button/Button';

// Slider footer — Back button, optional bottom-positioned progress bar, and
// the reassurance line. Rendered inside each slide-holder (by `Slide`), not
// once by `Slider`, so it flows directly after the slide's content: under
// the question on a short slide, after the content (scroll to reach) on a
// tall one. During a transition each holder carries its own footer, which
// dissolves together with its slide.
export function Footer() {
  const { sliderSettings, totalSlidesNumber, hideUIElements } =
    useSliderContext();

  return (
    <footer
      className={`slider__footer ${
        hideUIElements ? 'slider__UIElement-hide' : ''
      }`}>
      <div className="slider__footer-content">
        <Button transparent animate navigation="back" addContainer>
          Back
        </Button>
        {sliderSettings.navigation.progressBar?.position !== 'top' && (
          <ProgressBar
            totalSlidesNumber={totalSlidesNumber}
            position={
              sliderSettings.navigation.progressBar?.position ?? 'bottom'
            }
          />
        )}
      </div>
      {sliderSettings.footer?.reassurance && (
        <p className="slider__footer-reassurance">
          {sliderSettings.footer.reassurance}
        </p>
      )}
    </footer>
  );
}
