import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Drives a one-shot "nudge" — a brief attention cue (a shake, a glow…) on
 * whatever element is blocking a disabled button. `nudge()` flips `nudged`
 * to `true`, then back to `false` after `durationMs`. Calling it again while
 * a nudge is still running restarts it, so rapid clicks keep re-triggering
 * the animation.
 *
 * MySlider only owns the timing — the consuming project owns the look: apply
 * a class while `nudged` is true (the funnel SCSS animates `.is-nudged`).
 * Pair it with `Button`'s `onDisabledClick`.
 */
export function useNudge(durationMs = 600): {
  nudged: boolean;
  nudge: () => void;
} {
  const [nudged, setNudged] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nudge = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    // Drop the flag, then re-set it on the next frame so the CSS animation
    // restarts cleanly even if it's still mid-run from an earlier click.
    setNudged(false);
    requestAnimationFrame(() => {
      setNudged(true);
      timerRef.current = setTimeout(() => setNudged(false), durationMs);
    });
  }, [durationMs]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return { nudged, nudge };
}
