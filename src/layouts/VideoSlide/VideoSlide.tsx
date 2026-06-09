import React, { useRef, useState, useEffect, useCallback } from 'react';
import { SlideType_Video } from '../../types';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';

interface VideoSlideProps {
  slideContents: SlideType_Video;
}

// ---------------------------------------------------------------------------
// Custom, immersive video player. Replaces the browser's native controls with
// a framed 9:16 stage, an auto-hiding control scrim, a draggable scrubber, ±10s
// skip, mute, fullscreen, optional synced captions, and a completion overlay.
// Colours are themeable via CSS variables (see slider.scss / .slider__vplayer).
// ---------------------------------------------------------------------------

function fmtTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return m + ':' + String(r).padStart(2, '0');
}

const Icon = {
  play: (s = 34) => (
    <svg width={s} height={s} viewBox="0 0 512 512" fill="currentColor"><path d="m22.4 256v-166.3c0-68.9 74.6-112 134.2-77.5l144.1 83.2 144.1 83.2c59.7 34.4 59.7 120.6 0 155l-144.1 83.2-144.1 83.2c-59.6 34.3-134.2-8.7-134.2-77.6z" /></svg>
  ),
  pause: (s = 26) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.6" /><rect x="13.5" y="5" width="4" height="14" rx="1.6" /></svg>
  ),
  back10: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 512 512" fill="currentColor"><path d="M234.598 256V149.333C234.598 143.675 236.845 138.249 240.846 134.248C244.847 130.248 250.273 128 255.931 128C261.589 128 267.015 130.248 271.016 134.248C275.017 138.249 277.264 143.675 277.264 149.333V234.667H341.264C346.922 234.667 352.348 236.914 356.349 240.915C360.35 244.916 362.598 250.342 362.598 256C362.598 261.658 360.35 267.084 356.349 271.085C352.348 275.086 346.922 277.333 341.264 277.333H255.931C250.273 277.333 244.847 275.086 240.846 271.085C236.845 267.084 234.598 261.658 234.598 256Z" /><path d="M21.2646 42.6664C26.9225 42.6664 32.3488 44.914 36.3496 48.9148C40.3503 52.9156 42.5979 58.3418 42.5979 63.9997V114.645C64.8258 81.1 94.6486 53.2674 129.647 33.4057C164.645 13.5439 203.832 2.21252 244.029 0.330837C284.226 -1.55085 324.301 6.07019 361.002 22.5756C397.702 39.081 429.995 64.0059 455.259 95.3278C480.523 126.65 498.048 163.486 506.411 202.849C514.774 242.212 513.739 282.991 503.392 321.879C493.044 360.767 473.674 396.668 446.854 426.669C420.035 456.67 386.52 479.926 349.03 494.549C346.552 495.505 343.92 495.996 341.265 496C336.286 496.007 331.462 494.274 327.627 491.099C323.793 487.924 321.189 483.509 320.267 478.616C319.345 473.724 320.164 468.663 322.58 464.311C324.997 459.958 328.859 456.588 333.499 454.784C365.328 442.476 393.74 422.713 416.35 397.152C438.96 371.591 455.108 340.98 463.438 307.887C471.769 274.794 472.039 240.185 464.226 206.966C456.413 173.747 440.745 142.887 418.537 116.976C396.329 91.0657 368.229 70.8609 336.597 58.0578C304.964 45.2548 270.721 40.2272 236.743 43.397C202.765 46.5668 170.044 57.8415 141.325 76.2748C112.606 94.708 88.7287 119.762 71.6966 149.333H127.931C133.589 149.333 139.015 151.581 143.016 155.581C147.017 159.582 149.265 165.008 149.265 170.666C149.265 176.324 147.017 181.751 143.016 185.751C139.015 189.752 133.589 192 127.931 192H63.9313C46.9574 192 30.6787 185.257 18.6764 173.255C6.67408 161.252 -0.0687459 144.974 -0.0687459 128V63.9997C-0.0687459 58.3418 2.17885 52.9156 6.17963 48.9148C10.1804 44.914 15.6066 42.6664 21.2646 42.6664Z" /><path d="M213 320C196.026 320 179.747 326.743 167.745 338.745C155.743 350.747 149 367.026 149 384V448C149 464.974 155.743 481.253 167.745 493.255C179.747 505.257 196.026 512 213 512C229.974 512 246.253 505.257 258.255 493.255C270.257 481.253 277 464.974 277 448V384C277 367.026 270.257 350.747 258.255 338.745C246.253 326.743 229.974 320 213 320ZM234.333 448C234.333 453.658 232.086 459.084 228.085 463.085C224.084 467.086 218.658 469.333 213 469.333C207.342 469.333 201.916 467.086 197.915 463.085C193.914 459.084 191.667 453.658 191.667 448V384C191.667 378.342 193.914 372.916 197.915 368.915C201.916 364.914 207.342 362.667 213 362.667C218.658 362.667 224.084 364.914 228.085 368.915C232.086 372.916 234.333 378.342 234.333 384V448Z" /><path d="M93.1706 321.621C89.2714 320.006 84.9807 319.584 80.8416 320.408C76.7024 321.232 72.9006 323.265 69.9172 326.25L5.91723 390.25C2.03119 394.274 -0.119089 399.663 -0.0704826 405.256C-0.0218763 410.85 2.22172 416.2 6.1771 420.156C10.1325 424.111 15.4831 426.355 21.0767 426.403C26.6702 426.452 32.059 424.302 36.0826 420.416L63.6666 392.832V490.666C63.6666 496.324 65.9142 501.75 69.915 505.751C73.9157 509.752 79.3419 512 84.9999 512C90.6578 512 96.0841 509.752 100.085 505.751C104.086 501.75 106.333 496.324 106.333 490.666V341.333C106.334 337.114 105.084 332.989 102.741 329.481C100.399 325.972 97.0679 323.237 93.1706 321.621Z" /></svg>
  ),
  fwd10: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="m21 15a3 3 0 0 0 -3 3v3a3 3 0 0 0 6 0v-3a3 3 0 0 0 -3-3zm1 6a1 1 0 0 1 -2 0v-3a1 1 0 0 1 2 0z" /><path d="m13 12v-5a1 1 0 0 0 -2 0v4h-3a1 1 0 0 0 0 2h4a1 1 0 0 0 1-1z" /><path d="m23 2a1 1 0 0 0 -1 1v2.374a12 12 0 1 0 -14.364 17.808 1.015 1.015 0 0 0 .364.068 1 1 0 0 0 .364-1.932 10 10 0 1 1 12.272-14.318h-2.636a1 1 0 0 0 0 2h3a3 3 0 0 0 3-3v-3a1 1 0 0 0 -1-1z" /><path d="m15.383 15.076a1 1 0 0 0 -1.09.217l-3 3a1 1 0 0 0 1.414 1.414l1.293-1.293v4.586a1 1 0 0 0 2 0v-7a1 1 0 0 0 -.617-.924z" /></svg>
  ),
  volume: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="none" /><path d="M15.6 8.8a4.4 4.4 0 0 1 0 6.4" /><path d="M18 6.2a8 8 0 0 1 0 11.6" /></svg>
  ),
  mute: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="none" /><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" /></svg>
  ),
  enterFull: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V5.6A1.6 1.6 0 0 1 5.6 4H9" /><path d="M20 9V5.6A1.6 1.6 0 0 0 18.4 4H15" /><path d="M4 15v3.4A1.6 1.6 0 0 0 5.6 20H9" /><path d="M20 15v3.4A1.6 1.6 0 0 1 18.4 20H15" /></svg>
  ),
  exitFull: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4v2.4A1.6 1.6 0 0 1 6.4 8H4" /><path d="M16 4v2.4A1.6 1.6 0 0 0 17.6 8H20" /><path d="M8 20v-2.4A1.6 1.6 0 0 0 6.4 16H4" /><path d="M16 20v-2.4A1.6 1.6 0 0 1 17.6 16H20" /></svg>
  ),
  check: (s = 38) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
  ),
  replay: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 2.6-6.3" /><path d="M3 4v4h4" /></svg>
  ),
  chevLeft: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
  ),
  chevRight: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
  ),
  arrow: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
  ),
};

/* draggable scrubber with a hover-time tooltip and a buffered track */
function Scrubber({
  progress,
  duration,
  buffered,
  onSeek,
}: {
  progress: number;
  duration: number;
  buffered: number;
  onSeek: (t: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const seekAt = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    onSeek(ratio * duration);
  };
  const onDown = (e: React.PointerEvent) => {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    seekAt(e.clientX);
  };
  const onMove = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setHoverPct(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
    }
    if (e.buttons) seekAt(e.clientX);
  };
  const pct = (progress * 100).toFixed(2) + '%';
  return (
    <div className="slider__vp-scrub" onPointerDown={onDown} onPointerMove={onMove} onPointerLeave={() => setHoverPct(null)}>
      <div className="slider__vp-scrub-track" ref={trackRef}>
        {hoverPct != null && (
          <div className="slider__vp-scrub-tip" style={{ left: hoverPct * 100 + '%' }}>
            {fmtTime(hoverPct * duration)}
          </div>
        )}
        <div className="slider__vp-scrub-buf" style={{ width: Math.min(100, buffered * 100) + '%' }} />
        <div className="slider__vp-scrub-fill" style={{ width: pct }} />
        <div className="slider__vp-scrub-thumb" style={{ left: pct }} />
      </div>
    </div>
  );
}

/* captions synced to playback progress across the transcript */
function Caption({ progress, transcript }: { progress: number; transcript?: string[] }) {
  if (!transcript || !transcript.length) return null;
  const i = Math.min(transcript.length - 1, Math.floor(progress * transcript.length));
  const line = transcript[i];
  if (!line) return null;
  return (
    <div className="slider__vp-caption">
      <div className="slider__vp-caption-box">{line}</div>
    </div>
  );
}

export function VideoSlide({ slideContents }: VideoSlideProps) {
  const handleAnswer = useHandleAnswer();

  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number>(0);

  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [muted, setMuted] = useState(!!slideContents.muted);
  const [hideUI, setHideUI] = useState(false);
  const [isFull, setIsFull] = useState(false);

  const progress = duration ? Math.min(1, current / duration) : 0;

  // ---- media element wiring ----
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => setDuration(v.duration || 0);
    const onTime = () => {
      setCurrent(v.currentTime);
      try {
        if (v.buffered.length && v.duration) setBuffered(v.buffered.end(v.buffered.length - 1) / v.duration);
      } catch (_) {}
    };
    const onPlay = () => { setPlaying(true); setEnded(false); };
    const onPause = () => setPlaying(false);
    const onEnd = () => { setPlaying(false); setEnded(true); };
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('progress', onTime);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnd);
    return () => {
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('progress', onTime);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnd);
    };
  }, []);

  useEffect(() => { if (videoRef.current) videoRef.current.muted = muted; }, [muted]);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (ended) { setEnded(false); v.currentTime = 0; }
    if (v.paused) v.play().catch(() => {}); else v.pause();
  }, [ended]);

  const seek = useCallback((t: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const clamped = Math.max(0, Math.min(duration, t));
    v.currentTime = clamped;
    setCurrent(clamped);
    setEnded(false);
  }, [duration]);

  const skip = useCallback((d: number) => {
    const v = videoRef.current;
    seek((v ? v.currentTime : current) + d);
  }, [seek, current]);

  // ---- auto-hide the control scrim during playback ----
  const poke = useCallback(() => {
    setHideUI(false);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) setHideUI(true);
    }, 2600);
  }, []);
  useEffect(() => {
    if (!playing) { setHideUI(false); window.clearTimeout(hideTimer.current); } else { poke(); }
  }, [playing, poke]);
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  // ---- fullscreen ----
  const toggleFull = useCallback(() => {
    const el = stageRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (!el) return;
    const doc = document as Document & { webkitExitFullscreen?: () => void; webkitFullscreenElement?: Element };
    if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
      el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen ? document.exitFullscreen() : doc.webkitExitFullscreen?.();
    }
  }, []);
  useEffect(() => {
    const onFs = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // ---- keyboard shortcuts ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowRight') skip(10);
      else if (e.key === 'ArrowLeft') skip(-10);
      else if (e.key === 'm') setMuted((m) => !m);
      else if (e.key === 'f') toggleFull();
      else return;
      poke();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, skip, toggleFull, poke]);

  // ---- navigation ----
  const advance = () => handleAnswer(slideContents.slug, 'null');
  const goBack = () => window.history.back();

  const stageCls = 'slider__vp-stage' + (playing ? ' playing' : '') + (hideUI ? ' hide-ui' : '');
  const onStageClick = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t === e.currentTarget || t.dataset.surface) toggle();
  };

  return (
    <div className="slider__videoSlide slider__vplayer">
      <div className="slider__vp-bg" aria-hidden="true" />

      <div ref={stageRef} className={stageCls} onMouseMove={poke} onClick={onStageClick}>
        <video
          ref={videoRef}
          className="slider__vp-video"
          data-surface="1"
          src={slideContents.videoSrc}
          poster={slideContents.poster}
          playsInline
          preload="metadata"
          autoPlay={slideContents.autoPlay}
          loop={slideContents.loop}
        />

        {/* top scrim — back / eyebrow / close */}
        <div className="slider__vp-scrim slider__vp-top">
          <button type="button" className="slider__vp-topbtn" onClick={goBack} aria-label="Back">{Icon.chevLeft(20)}</button>
          {slideContents.eyebrow && <span className="slider__vp-eyebrow">{slideContents.eyebrow}</span>}
          <button type="button" className="slider__vp-topbtn" onClick={advance} aria-label="Skip to next">{Icon.chevRight(22)}</button>
        </div>

        {/* captions */}
        <Caption progress={progress} transcript={slideContents.transcript} />

        {/* center play (when paused, not ended) */}
        {!ended && !playing && (
          <button type="button" className="slider__vp-centerplay" onClick={toggle} aria-label="Play">
            <span style={{ display: 'inline-flex', transform: 'translate(3px,1px)' }}>{Icon.play(34)}</span>
          </button>
        )}

        {/* bottom scrim — scrubber + controls */}
        <div className="slider__vp-scrim slider__vp-bottom">
          <Scrubber progress={progress} duration={duration} buffered={buffered} onSeek={seek} />
          <div className="slider__vp-controls">
            <div className="slider__vp-controls-l">
              <button type="button" className="slider__vp-ic" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? Icon.pause(26) : <span style={{ display: 'inline-flex', transform: 'translate(2px,0)' }}>{Icon.play(24)}</span>}
              </button>
              <button type="button" className="slider__vp-ic" onClick={() => skip(-10)} aria-label="Back 10 seconds">{Icon.back10(22)}</button>
              <button type="button" className="slider__vp-ic" onClick={() => skip(10)} aria-label="Forward 10 seconds">{Icon.fwd10(22)}</button>
              <button type="button" className={'slider__vp-ic' + (muted ? ' on' : '')} onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Unmute' : 'Mute'}>
                {muted ? Icon.mute(22) : Icon.volume(22)}
              </button>
              <span className="slider__vp-time">
                {fmtTime(current)} <span className="slider__vp-time-dur">/ {fmtTime(duration)}</span>
              </span>
            </div>
            <button type="button" className="slider__vp-ic" onClick={toggleFull} aria-label={isFull ? 'Exit fullscreen' : 'Fullscreen'}>
              {isFull ? Icon.exitFull(20) : Icon.enterFull(20)}
            </button>
          </div>
        </div>

        {/* completion overlay */}
        {ended && (
          <div className="slider__vp-done">
            <div className="slider__vp-done-badge">{Icon.check(38)}</div>
            <div className="slider__vp-done-title">{slideContents.completeTitle || 'Lesson complete.'}</div>
            {slideContents.completeBody && <p className="slider__vp-done-body">{slideContents.completeBody}</p>}
            <div className="slider__vp-done-actions">
              <button type="button" className="slider__vp-done-primary" onClick={advance}>
                {slideContents.buttonText || 'Continue'} {Icon.arrow(18)}
              </button>
              <button type="button" className="slider__vp-done-replay" onClick={() => { seek(0); videoRef.current?.play().catch(() => {}); }}>
                {Icon.replay(18)} Replay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
