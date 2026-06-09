import React, { useState, useEffect } from 'react';
import useSoundHook from 'use-sound';

interface UseSoundProps {
  sound: string;
  soundLength?: number;
  volume?: number;
  interrupt?: boolean;
}

// A valid, silent WAV used when no sound is configured. use-sound always builds
// a Howl from the src on mount (soundEnabled only gates playback, not loading),
// so an empty string would make Howler log "No file extension was found" on
// every button mount. Handing it this data-uri + an explicit format keeps
// Howler quiet; soundEnabled:false then makes it inert.
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=';

export function useSound({
  sound,
  soundLength = 500,
  volume = 1,
  interrupt
}: UseSoundProps): [() => void, boolean] {
  const [soundPlaying, setSoundPlaying] = useState(false);
  const hasSound = Boolean(sound);
  const [play] = useSoundHook(hasSound ? sound : SILENT_WAV, {
    volume,
    interrupt,
    soundEnabled: hasSound,
    // Real sounds carry their own extension; only the silent fallback needs an
    // explicit format (data-uris have no extension for Howler to read).
    ...(hasSound ? {} : { format: ['wav'] })
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSoundPlaying(false);
    }, soundLength);

    return () => clearTimeout(timer);
  }, [soundPlaying]);

  const playSound = () => {
    setSoundPlaying(true);
    play();
  };

  return [playSound, soundPlaying];
}
