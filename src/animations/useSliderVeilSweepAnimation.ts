import { useSliderContext } from '../core/useSliderContext';
import { gsap } from 'gsap';

export type SliderVeilSweepAnimationType = (
  animationDirection: 'forward' | 'backward' | 'stay'
) => void;

// Veil sweep: a soft lavender radial veil expands across the screen
// while the outgoing slide fades behind it; the new slide emerges as the
// veil dissipates. Theatrical, on-brand for cosmic/mystical themes.
//
// Implementation: the overlay element is created on-the-fly per
// transition and removed when the animation completes, so this hook
// adds no permanent DOM.

export const useSliderVeilSweepAnimation = (onAnimationComplete: () => void) => {
  const { sliderSlideRef, setDisableMouseEvents } = useSliderContext();

  const animation: SliderVeilSweepAnimationType = (_animationDirection) => {
    const veil = document.createElement('div');
    veil.className = 'slider__transitionVeil';
    Object.assign(veil.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '10',
      background:
        'radial-gradient(circle at center, rgba(199,146,224,0.55) 0%, rgba(199,146,224,0.25) 35%, rgba(199,146,224,0) 70%)',
      opacity: '0',
      transform: 'scale(0.6)',
    } as CSSStyleDeclaration);
    document.body.appendChild(veil);

    const tl = gsap.timeline({
      onComplete: () => {
        veil.remove();
        sliderSlideRef.current[1]?.classList.remove('slider__disableEvents');
        onAnimationComplete();
      },
      onStart: () => {
        setDisableMouseEvents(true);
        sliderSlideRef.current[1]?.classList.add('slider__disableEvents');
      },
    });

    // Outgoing slide fades behind the rising veil.
    tl.to(sliderSlideRef.current[0], {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
    }, 0);

    // Veil expands + brightens.
    tl.to(veil, {
      opacity: 1,
      scale: 1.4,
      duration: 0.45,
      ease: 'power2.out',
    }, 0);

    // Incoming slide fades in as the veil starts dissipating.
    tl.fromTo(sliderSlideRef.current[1],
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' },
      0.35,
    );

    tl.to(veil, {
      opacity: 0,
      scale: 1.8,
      duration: 0.45,
      ease: 'power2.in',
    }, 0.45);
  };

  return animation;
};
