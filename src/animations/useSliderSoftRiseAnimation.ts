import { useSliderContext } from '../core/useSliderContext';
import { gsap } from 'gsap';

export type SliderSoftRiseAnimationType = (
  animationDirection: 'forward' | 'backward' | 'stay'
) => void;

// Soft rise: the incoming slide gently settles into place from just below
// (rising up) with a micro-scale and fade, while the outgoing one drifts the
// same way and fades out. The travel is small and vertical — calm and
// "breathing", with no large sideways motion to induce motion sickness.
// Direction-aware: going backward, content descends from above instead.

const RISE = 18; // px the incoming slide travels into place
const DRIFT = 8; // px the outgoing slide drifts as it leaves

export const useSliderSoftRiseAnimation = (onAnimationComplete: () => void) => {
  const { sliderSlideRef, setDisableMouseEvents } = useSliderContext();

  const animation: SliderSoftRiseAnimationType = (animationDirection) => {
    // forward → content flows up (in from below); backward → flows down.
    const dir = animationDirection === 'backward' ? -1 : 1;

    gsap.fromTo(
      sliderSlideRef.current[0],
      { y: 0, scale: 1, opacity: 1 },
      {
        y: -DRIFT * dir,
        scale: 0.99,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        transformOrigin: 'center center',
        onStart: () => setDisableMouseEvents(true),
      }
    );

    gsap.fromTo(
      sliderSlideRef.current[1],
      { y: RISE * dir, scale: 0.985, opacity: 0 },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.6,
        delay: 0.16,
        ease: 'power3.out',
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
