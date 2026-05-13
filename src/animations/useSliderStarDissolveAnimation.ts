import { useSliderContext } from '../core/useSliderContext';
import { gsap } from 'gsap';

export type SliderStarDissolveAnimationType = (
  animationDirection: 'forward' | 'backward' | 'stay'
) => void;

// Star dissolve: the outgoing slide breaks into ~30 sparkle particles
// that scatter outward and fade; the incoming slide materializes from
// stardust at center. Most thematic — looks like the answer becomes the
// cosmos before the next question forms.
//
// Particles are created on the fly, positioned over the outgoing slide,
// and cleaned up on completion — no permanent DOM additions.

const PARTICLE_COUNT = 30;
const PARTICLE_COLORS = ['#C792E0', '#D6A8E8', '#FFB78C'];

export const useSliderStarDissolveAnimation = (onAnimationComplete: () => void) => {
  const { sliderSlideRef, setDisableMouseEvents } = useSliderContext();

  const animation: SliderStarDissolveAnimationType = (_animationDirection) => {
    const outgoing = sliderSlideRef.current[0];
    const rect = outgoing?.getBoundingClientRect();

    const particles: HTMLElement[] = [];
    if (rect) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = document.createElement('span');
        p.textContent = '✦';
        p.setAttribute('aria-hidden', 'true');
        Object.assign(p.style, {
          position: 'fixed',
          left: `${rect.left + Math.random() * rect.width}px`,
          top: `${rect.top + Math.random() * rect.height}px`,
          color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
          fontSize: `${10 + Math.random() * 12}px`,
          lineHeight: '1',
          pointerEvents: 'none',
          zIndex: '10',
          opacity: '0',
          transform: 'translate(0, 0) scale(0.6)',
        } as CSSStyleDeclaration);
        document.body.appendChild(p);
        particles.push(p);
      }
    }

    const tl = gsap.timeline({
      onStart: () => {
        setDisableMouseEvents(true);
        sliderSlideRef.current[1]?.classList.add('slider__disableEvents');
      },
      onComplete: () => {
        particles.forEach((p) => p.remove());
        sliderSlideRef.current[1]?.classList.remove('slider__disableEvents');
        onAnimationComplete();
      },
    });

    // Outgoing slide fades out into the stardust.
    tl.to(outgoing, {
      opacity: 0,
      filter: 'blur(4px)',
      duration: 0.45,
      ease: 'power2.in',
    }, 0);

    // Particles' opacity arc — asymmetric (fast rise, faster fall) so
    // they're gone before motion enters its slow tail. Keyframes let us
    // pick separate eases per phase: `sine.out` on bloom-in, `sine.in`
    // on fade-out, no flat peak.
    tl.to(particles, {
      keyframes: [
        { opacity: 0.75, duration: 0.12, ease: 'sine.out' },
        { opacity: 0, duration: 0.28, ease: 'sine.in' },
      ],
      stagger: { each: 0.005, from: 'random' },
    }, 0);

    // Motion uses `sine.out` instead of `power2.out` — much gentler
    // deceleration. Particles disappear well before the motion's tail,
    // so the visible portion always shows them moving with momentum.
    tl.to(particles, {
      x: () => (Math.random() - 0.5) * 280,
      y: () => (Math.random() - 0.5) * 280,
      scale: () => 0.8 + Math.random() * 0.8,
      rotation: () => (Math.random() - 0.5) * 90,
      duration: 0.75,
      ease: 'sine.out',
      stagger: { each: 0.004, from: 'random' },
    }, 0);

    // Incoming materializes from a small scale + fade.
    tl.fromTo(sliderSlideRef.current[1],
      { opacity: 0, scale: 0.92, filter: 'blur(6px)' },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.6,
        ease: 'power2.out',
        transformOrigin: 'center center',
      },
      0.4,
    );
  };

  return animation;
};
