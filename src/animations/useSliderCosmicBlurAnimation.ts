import { useSliderContext } from '../core/useSliderContext';
import { gsap } from 'gsap';

export type SliderCosmicBlurAnimationType = (
  animationDirection: 'forward' | 'backward' | 'stay'
) => void;

// Cosmic blur cross-fade: outgoing slide blurs + fades; incoming starts
// blurred and clears in. No motion — feels like a focus pull / lens shift.

export const useSliderCosmicBlurAnimation = (onAnimationComplete: () => void) => {
  const { sliderSlideRef, setDisableMouseEvents } = useSliderContext();

  const animation: SliderCosmicBlurAnimationType = (_animationDirection) => {
    gsap.fromTo(
      sliderSlideRef.current[0],
      { filter: 'blur(0px)', opacity: 1 },
      {
        filter: 'blur(12px)',
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onStart: () => setDisableMouseEvents(true),
      }
    );

    gsap.fromTo(
      sliderSlideRef.current[1],
      { filter: 'blur(12px)', opacity: 0 },
      {
        filter: 'blur(0px)',
        opacity: 1,
        duration: 0.6,
        delay: 0.25,
        ease: 'power2.out',
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
