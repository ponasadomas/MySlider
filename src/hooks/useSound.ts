import React, { useState, useEffect } from 'react';
import useSoundHook from 'use-sound';

interface UseSoundProps {
  sound: string;
  soundLength?: number;
  volume?: number;
  interrupt?: boolean;
}
export function useSound({
  sound,
  soundLength = 500,
  volume = 1,
  interrupt
}: UseSoundProps): [() => void, boolean] {
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [play] = useSoundHook(sound, { volume, interrupt });

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
