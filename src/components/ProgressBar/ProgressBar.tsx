import React, { useEffect, useState } from 'react';
import { useSliderContext } from '../../core/useSliderContext';
import { getCurrentSlideSlugFromUrl } from '../../utils/getCurrentSlideSlugFromUrl';
import { getSlideIndex } from '../../utils/getSlideIndex';

export type ProgressBarPercentageProps = {
  totalSlidesNumber: number;
  position: 'top' | 'bottom';
};

export function ProgressBar({
  totalSlidesNumber,
  position
}: ProgressBarPercentageProps) {
  const { sliderSettings, sliderFlow, hideUIElements } = useSliderContext();

  // We are using slideSlugFromUrl simply because it updates faster than the
  // currentSlideSlug state. If we would use state variable, the slide would
  // change first and only then would the slider progress bar update. This way
  // the progress bar updates in sync with the slide chage.
  const currentSlideSlugFromUrl = getCurrentSlideSlugFromUrl(
    sliderSettings.navigation.type,
    sliderSettings.startPath
  );
  let currentSlideIndex = getSlideIndex(currentSlideSlugFromUrl, sliderFlow);
  currentSlideIndex = currentSlideIndex > -1 ? currentSlideIndex : 0;

  // Even though this component is used to display a user's progress in
  // percentage the most of it is just a fancy animation for numbers. We handle
  // animation of line with CSS but to display increase of progress number one
  // by one we need to use JS.
  const progressTarget = (currentSlideIndex / totalSlidesNumber) * 100;
  const [prevProgress, setPrevProgress] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);

  const animationDuration = 777; // ms
  const progressAnimationSteps = Math.abs(progressTarget - prevProgress);
  const progressAnimationOneStepDuration =
    progressAnimationSteps > 0 ? animationDuration / progressAnimationSteps : 0;

  useEffect(() => {
    let current = prevProgress;
    const increment = progressTarget > prevProgress ? 1 : -1;

    const interval = setInterval(() => {
      current += increment;

      if (
        (increment > 0 && current >= progressTarget) ||
        (increment < 0 && current <= progressTarget)
      ) {
        current = progressTarget;
        clearInterval(interval);
        setPrevProgress(Math.round(current));
      }

      setCurrentProgress(current);
    }, progressAnimationOneStepDuration);

    return () => clearInterval(interval);
  }, [progressTarget, prevProgress, progressAnimationOneStepDuration]);

  return (
    <div
      className={`slider__progressBar ${
        hideUIElements ? 'slider__UIElement-hide' : ''
      }
        ${
          position === 'top'
            ? 'slider__progressBar-top'
            : 'slider__progressBar-bottom'
        }
      `}>
      <div className="slider__progressBar-container">
        <div className="slider__progressBar-filler">
          <div
            className="slider__progressBar-line"
            style={{ width: `${progressTarget}%` }}>
            <span className="slider__progressBar-bubble">
              <span className="slider__progressBar-text">
                {Math.round(currentProgress)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
