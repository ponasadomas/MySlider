import { useSliderContext } from '../core/useSliderContext';
import { gsap } from 'gsap';

export type SliderIosSpringAnimationType = (
  animationDirection: 'forward' | 'backward' | 'stay'
) => void;

// iOS spring pop: modeled on UIKit's spring timing (dampingRatio ≈ 0.8,
// response ≈ 0.5s — the app-open / sheet-present feel). The outgoing slide
// dismisses fast and quietly (quick fade + slight shrink); the incoming one
// pops into place with a springy scale settle — a barely-perceptible ~2%
// overshoot before it rests (gsap `back.out`). No travel, no blur.
//
// Direction-aware like iOS zoom navigation: going forward the new content
// grows toward you (0.94 → 1); going backward it settles down from slightly
// above scale (1.05 → 1), reading as "stepping back out".

export const useSliderIosSpringAnimation = (
  onAnimationComplete: () => void
) => {
  const { sliderSlideRef, setDisableMouseEvents } = useSliderContext();

  const animation: SliderIosSpringAnimationType = (animationDirection) => {
    const backward = animationDirection === 'backward';

    gsap.fromTo(
      sliderSlideRef.current[0],
      { scale: 1, opacity: 1 },
      {
        scale: backward ? 1.03 : 0.97,
        opacity: 0,
        duration: 0.26,
        ease: 'power2.in',
        transformOrigin: 'center center',
        onStart: () => setDisableMouseEvents(true),
      }
    );

    gsap.fromTo(
      sliderSlideRef.current[1],
      { scale: backward ? 1.05 : 0.94, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.55,
        delay: 0.12,
        // back.out(1.2) ≈ a damped spring's single gentle overshoot.
        ease: 'back.out(1.2)',
        transformOrigin: 'center center',
        onStart: () => {
          sliderSlideRef.current[1]?.classList.add('slider__disableEvents');
        },
        onComplete: () => {
          sliderSlideRef.current[1]?.classList.remove('slider__disableEvents');
          onAnimationComplete();
        },
      }
    );
  };

  return animation;
};
