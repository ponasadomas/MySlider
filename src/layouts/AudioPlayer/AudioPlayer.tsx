import React, { useState, useEffect, useRef } from 'react';
import { SlideType_AudioPlayer } from '../../types';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';

interface AudioPlayerProps {
  slideContents: SlideType_AudioPlayer;
}

export function AudioPlayer({ slideContents }: AudioPlayerProps) {
  const handleAnswer = useHandleAnswer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleButtonClick = () => {
    handleAnswer(slideContents.slug, 'null');
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audioElement = audioRef.current;

    const updateCurrentTime = () => {
      if (audioElement) {
        setCurrentTime(audioElement.currentTime);
      }
    };

    const setAudioDuration = () => {
      if (audioElement) {
        setDuration(audioElement.duration);
      }
    };

    if (audioElement) {
      audioElement.addEventListener('timeupdate', updateCurrentTime);
      audioElement.addEventListener('loadedmetadata', setAudioDuration);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener('timeupdate', updateCurrentTime);
        audioElement.removeEventListener('loadedmetadata', setAudioDuration);
      }
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${paddedSeconds}`;
  };

  const getProgressStyle = () => {
    if (duration === 0) return {}; // Avoid division by zero

    const progress = (currentTime / duration) * 100;
    const angle = Math.abs((progress / 100) * 360);

    // Get CSS variables
    const root = document.documentElement;
    const progressColor = getComputedStyle(root).getPropertyValue(
      '--player-progress-color'
    );
    const backgroundColor = getComputedStyle(root).getPropertyValue(
      '--player-background-color'
    );

    if (angle <= 180) {
      return {
        backgroundImage: `linear-gradient(90deg, ${backgroundColor} 50%, transparent 50%), linear-gradient(${
          90 + angle
        }deg, ${progressColor} 50%, ${backgroundColor} 50%)`
      };
    } else {
      return {
        backgroundImage: `linear-gradient(90deg, transparent 50%, ${progressColor} 50%), linear-gradient(${
          angle - 90
        }deg, ${backgroundColor} 50%, ${progressColor} 50%)`
      };
    }
  };

  return (
    <div className="slider__audioPlayer">
      <div className="slider__slide-content">
        <section className="slider__section">
          <div
            className={`slider__audioPlayer-progress ${
              isPlaying && 'slider__audioPlayer-skew'
            }`}
            style={getProgressStyle()}>
            <audio ref={audioRef} src={slideContents.audioFile} />
            <div
              onClick={togglePlayPause}
              className="slider__audioPlayer-button">
              {isPlaying ? (
                <svg
                  viewBox="0 0 45.975 45.975"
                  xmlns="http://www.w3.org/2000/svg"
                  className="slider__pause">
                  <g>
                    <g>
                      <path d="M13.987,0c-2.762,0-5,2.239-5,5v35.975c0,2.763,2.238,5,5,5s5-2.238,5-5V5C18.987,2.238,16.75,0,13.987,0z" />
                      <path d="M31.987,0c-2.762,0-5,2.239-5,5v35.975c0,2.762,2.238,5,5,5s5-2.238,5-5V5C36.987,2.239,34.749,0,31.987,0z" />
                    </g>
                  </g>
                </svg>
              ) : (
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <path d="m23.5 14.865-13.581-8.487a1.338 1.338 0 0 0 -2.047 1.134v16.975a1.335 1.335 0 0 0 2.047 1.135l13.581-8.487a1.339 1.339 0 0 0 0-2.27z" />
                </svg>
              )}
            </div>
          </div>
          <div className="slider__audioPlayer-time">
            {formatTime(currentTime)}
          </div>
        </section>
      </div>
    </div>
  );
}
