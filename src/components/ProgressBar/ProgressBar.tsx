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
  const { sliderSettings, sliderFlow, sliderLogic, hideUIElements } =
    useSliderContext();

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

  // Progress denominator = the STABLE configured `structure.totalSlides`, NOT the
  // live `totalSlidesNumber` prop. In a non-linear funnel the flow GROWS as the
  // user answers branching questions (branch + augmentation slugs get appended to
  // sliderFlow, and `useHandleAnswer` syncs `totalSlidesNumber` to that growing
  // length). A denominator tied to the live length makes the bar race to near-full
  // over the short initial set and then JUMP BACKWARDS the instant a branch expands
  // the flow. A fixed estimate keeps the bar monotonic. Set `structure.totalSlides`
  // to the funnel's LONGEST possible path so the bar never overshoots; shorter paths
  // finish a little under 100 and are snapped to 100 on the final slide below.
  const totalSlides =
    sliderSettings.structure?.totalSlides || totalSlidesNumber;

  // The genuinely-final slide: last in the current flow AND unable to spawn more
  // slides (no branch/augmentation entry for it). Snap it to exactly 100% so every
  // path completes at 100 regardless of how its length compares to the estimate.
  const isFinalSlide =
    currentSlideIndex === sliderFlow.length - 1 &&
    !sliderLogic.flowByAnswer?.[currentSlideSlugFromUrl] &&
    !sliderLogic.flowAugmentation?.[currentSlideSlugFromUrl];

  // Even though this component is used to display a user's progress in
  // percentage the most of it is just a fancy animation for numbers. We handle
  // animation of line with CSS but to display increase of progress number one
  // by one we need to use JS.
  const progressTarget = isFinalSlide
    ? 100
    : Math.min(100, (currentSlideIndex / totalSlides) * 100);
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
