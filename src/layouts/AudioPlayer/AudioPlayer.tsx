import React, { useState, useEffect, useRef } from 'react';
import { SlideType_AudioPlayer } from '../../types';
import { Button } from '../../components/Button/Button';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useSliderContext } from '../../core/useSliderContext';

interface AudioPlayerProps {
  slideContents: SlideType_AudioPlayer;
}

function fmtTime(t: number) {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return m + ':' + String(s).padStart(2, '0');
}

const PlayIcon = (
  <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="m23.5 14.865-13.581-8.487a1.338 1.338 0 0 0 -2.047 1.134v16.975a1.335 1.335 0 0 0 2.047 1.135l13.581-8.487a1.339 1.339 0 0 0 0-2.27z" />
  </svg>
);
const PauseIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6.5" y="5" width="4" height="14" rx="1.6" />
    <rect x="13.5" y="5" width="4" height="14" rx="1.6" />
  </svg>
);

/**
 * Inline audio player slide: heading + a play/pause control, a seekable
 * progress bar with time, and a button to advance. No visual CSS ships from the
 * library — the consumer styles `.slider__audioPlayer*`.
 */
export function AudioPlayer({ slideContents }: AudioPlayerProps) {
  const { sliderSettings } = useSliderContext();
  const handleAnswer = useHandleAnswer();

  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  const seekAt = (clientX: number) => {
    const el = trackRef.current;
    const a = audioRef.current;
    if (!el || !a || !duration) return;
    const r = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    a.currentTime = ratio * duration;
    setCurrent(a.currentTime);
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrent(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('ended', onPause);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('ended', onPause);
    };
  }, []);

  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <div className={`slider__audioPlayer${playing ? ' is-playing' : ''}`}>
      <div className="slider__slide-content">
        <section className="slider__section">
          {slideContents.eyebrow && (
            <p className="slider__audioPlayer-eyebrow">{slideContents.eyebrow}</p>
          )}
          {slideContents.headline && (
            <h2 dangerouslySetInnerHTML={{ __html: slideContents.headline }}></h2>
          )}
          {slideContents.subtext && (
            <p
              className="slider__audioPlayer-sub"
              dangerouslySetInnerHTML={{ __html: slideContents.subtext }}></p>
          )}

          <div className="slider__audioPlayer-player">
            <audio ref={audioRef} src={slideContents.audioFile} preload="metadata" />

            <button
              type="button"
              className="slider__audioPlayer-toggle"
              onClick={toggle}
              aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? PauseIcon : PlayIcon}
            </button>

            <div
              className="slider__audioPlayer-bar"
              ref={trackRef}
              onPointerDown={(e) => {
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch (_) {}
                seekAt(e.clientX);
              }}
              onPointerMove={(e) => {
                if (e.buttons) seekAt(e.clientX);
              }}>
              <div className="slider__audioPlayer-fill" style={{ width: pct + '%' }} />
              <div className="slider__audioPlayer-thumb" style={{ left: pct + '%' }} />
            </div>

            <div className="slider__audioPlayer-time">
              {fmtTime(current)} <span>/ {fmtTime(duration)}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="slider__audioPlayer-footer">
        <Button
          primary
          flat
          navigation="forward"
          animate={sliderSettings.buttonAnimation}
          addContainer
          onClick={() => handleAnswer(slideContents.slug, 'listened')}>
          {slideContents.buttonText ?? 'Continue'}
        </Button>
      </div>
    </div>
  );
}
