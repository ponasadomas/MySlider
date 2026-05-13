import { useSliderContext } from '../core/useSliderContext';
import { gsap, Back } from 'gsap';

export type SliderVerticalAnimationType = (
  animationDirection: 'forward' | 'backward' | 'stay'
) => void;

// A hook to animate slides. Because we need access to some states and refs, we
// must wrap the animation in a hook. This way we can use it in multiple places
// in the code. Also, the idea is to have a different useSliderAnimation hook
// for different types of animations. We can expand this library in the future
// without too much hassle.

export const useSliderVerticalAnimation = (onAnimationComplete: () => void) => {
  const { sliderSlideRef, setDisableMouseEvents } = useSliderContext();

  const animation: SliderVerticalAnimationType = (animationDirection) => {
    let startY = '0%';
    let endY = '0%';

    if (animationDirection === 'forward') {
      startY = '-55%';
      endY = '50%';
    } else if (animationDirection === 'backward') {
      startY = '55%';
      endY = '-50%';
    } else {
      console.error('Invalid animation direction');
    }

    // Animation for the vertical slide
    gsap.fromTo(
      sliderSlideRef.current[0],
      {},
      {
        y: startY,
        duration: 0.7,
        opacity: 0,
        delay: 0.222,
        ease: Back.easeOut.config(1.7),
        yoyo: false,
        onStart: () => {
          setDisableMouseEvents(true);
        },
      }
    );

    gsap.fromTo(
      sliderSlideRef.current[1],
      {
        y: endY,
        opacity: 0,
        onStart: () => {
          setDisableMouseEvents(true);
        },
      },
      {
        y: '0%',
        opacity: 1,
        duration: 0.8,
        delay: 0.4,
        ease: Back.easeOut.config(1.7),
        yoyo: false,
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
