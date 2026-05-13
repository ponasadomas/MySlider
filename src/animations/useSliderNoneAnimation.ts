import { useSliderContext } from '../core/useSliderContext';
import { gsap } from 'gsap';

export type SliderNoneAnimationType = (
  animationDirection: 'forward' | 'backward' | 'stay'
) => void;

/**
 * A minimal animation hook that provides a simple fade transition between slides.
 * This hook simply hides the previous slide, allows a brief moment for layout calculations,
 * and then shows the next slide without complex animations.
 *
 * @param onAnimationComplete - Callback function to be executed when animation is complete
 * @returns Animation function that can be called with direction parameters
 */
export const useSliderNoneAnimation = (onAnimationComplete: () => void) => {
  const {
    sliderSlideRef,
    setDisableMouseEvents
  } = useSliderContext();

  const animation: SliderNoneAnimationType = (animationDirection) => {
    // Validate animation direction
    if (!['forward', 'backward', 'stay'].includes(animationDirection)) {
      console.error('Invalid animation direction');
      return;
    }

    // Immediately hide the previous slide
    gsap.to(sliderSlideRef.current[0], {
      opacity: 0,
      duration: 0.2,
      onStart: () => {
        setDisableMouseEvents(true);
      }
    });

    // Show the next slide after a small delay to allow for layout calculations
    gsap.fromTo(
      sliderSlideRef.current[1],
      {
        opacity: 0,
        onStart: () => {
          // Ensure mouse events are disabled during transition
          sliderSlideRef.current[1]?.classList.add('slider__disableEvents');
        }
      },
      {
        opacity: 1,
        duration: 0.2,
        delay: 0.1, // Small delay to allow DOM to update
        onComplete: () => {
          // Re-enable mouse events after animation completes
          sliderSlideRef.current[1]?.classList.remove('slider__disableEvents');
          setDisableMouseEvents(false);
          onAnimationComplete();
        }
      }
    );
  };

  return animation;
};
