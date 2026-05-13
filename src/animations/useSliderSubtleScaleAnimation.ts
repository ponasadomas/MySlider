import { useSliderContext } from '../core/useSliderContext';
import { gsap } from 'gsap';

export type SliderSubtleScaleAnimationType = (
  animationDirection: 'forward' | 'backward' | 'stay'
) => void;

// Subtle scale + fade: outgoing shrinks slightly while fading; incoming
// grows from a small upscale + fade. Classy, gentle, not flashy.

export const useSliderSubtleScaleAnimation = (onAnimationComplete: () => void) => {
  const { sliderSlideRef, setDisableMouseEvents } = useSliderContext();

  const animation: SliderSubtleScaleAnimationType = (_animationDirection) => {
    gsap.fromTo(
      sliderSlideRef.current[0],
      { scale: 1, opacity: 1 },
      {
        scale: 0.96,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        transformOrigin: 'center center',
        onStart: () => setDisableMouseEvents(true),
      }
    );

    gsap.fromTo(
      sliderSlideRef.current[1],
      { scale: 1.04, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.55,
        delay: 0.15,
        ease: 'power2.out',
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
