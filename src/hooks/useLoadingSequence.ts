import { useEffect, useRef, useState } from 'react';

import { useHandleAnswer } from './useHandleAnswer';
import { useSliderContext } from '../core/useSliderContext';
import { SlideType_LoadingSlide } from '../types';

// How long a message spends fading out before the next one takes its place.
// The consuming project's CSS `transition` on `.slider__loadingSlide-message`
// should be no longer than this, so the fade finishes cleanly within its slot.
const FADE_MS = 450;

// Lets the slide's enter transition (e.g. `starDissolve`) settle before the
// first message starts ticking — the same trick CalculatingSlide/BreatherSlide
// use to avoid animating during the slide hand-off.
const START_DELAY_MS = 500;

/**
 * The behaviour behind a `loadingSlide`: cycles the messages, hides the
 * Back/progress chrome, and does a one-shot advance once the last message has
 * shown. `LoadingSlide` is the plain default that renders it; a consuming
 * project can build its own richly-decorated loading component on the same
 * hook (register it for the `loadingSlide` type) and own 100% of the visuals.
 *
 * Returns the `messages` array plus the current `index` and whether that
 * message is `visible` (toggle a fade class off it).
 */
export function useLoadingSequence(slideContents: SlideType_LoadingSlide): {
  messages: string[];
  index: number;
  visible: boolean;
} {
  const handleAnswer = useHandleAnswer();
  const { setHideUIElements } = useSliderContext();

  const messages = slideContents.messages ?? [];
  // Each message gets at least enough room for a fade-in and a fade-out.
  const slotMs = Math.max(
    FADE_MS + 200,
    (slideContents.messageDuration ?? 2.5) * 1000
  );

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  // `handleAnswer` is a fresh closure on every render; the ref makes the
  // hand-off to the next slide strictly one-shot, so a stray re-render can't
  // fire it twice with a stale `sliderFlow` (see CalculatingSlide for the
  // full explanation of that failure mode).
  const hasAdvancedRef = useRef(false);
  const advance = () => {
    if (hasAdvancedRef.current) return;
    hasAdvancedRef.current = true;
    handleAnswer(slideContents.slug, null);
  };

  // The Back button and progress chrome don't belong on a loading screen.
  useEffect(() => {
    setHideUIElements(true);
    return () => setHideUIElements(false);
  }, [setHideUIElements]);

  // One run per message. Each schedules its own fade-in, fade-out, and the
  // hand-off to the next index (or the advance, on the last message). Keyed
  // on `index` only — deliberately not on `handleAnswer`/`messages`, which
  // would re-fire the timers mid-cycle. `slideContents` is stable for the
  // lifetime of a mounted slide, so `slotMs`/`messages` never change here.
  useEffect(() => {
    if (messages.length === 0) {
      advance();
      return;
    }

    const startDelay = index === 0 ? START_DELAY_MS : 0;
    const timers = [
      // Fade the new message in. The +20ms lets it paint at opacity 0 first
      // so the `is-visible` class actually triggers a transition.
      window.setTimeout(() => setVisible(true), startDelay + 20),
      // Fade it back out near the end of its slot.
      window.setTimeout(() => setVisible(false), startDelay + slotMs - FADE_MS),
      // Hand off: next message, or advance the flow after the last one.
      window.setTimeout(() => {
        if (index < messages.length - 1) {
          setIndex((i) => i + 1);
        } else {
          advance();
        }
      }, startDelay + slotMs),
    ];

    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return { messages, index, visible };
}
