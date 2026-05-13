import React, { useEffect, useState, useRef } from 'react';

export function TransitionLoader({
  settings,
  sound
}: {
  settings: TransitionLoaderType;
  sound?: boolean;
}) {
  const {
    transitionExpanded,
    transitionCenterPoint,
    onStart = () => {},
    onComplete = () => {},
    delay = 0, // in seconds
    duration = 0.777 // in seconds
  } = settings;

  const defaultClasses =
    'slider__transitionElement slider__transitionElement-bubble';
  const defaultClassesOne = `${defaultClasses} slider__transitionElement-color_primary`;
  const defaultClassesTwo = `${defaultClasses} slider__transitionElement-color_bg`;
  const transitionOneRef = useRef<HTMLSpanElement | null>(null);
  const transitionTwoRef = useRef<HTMLSpanElement | null>(null);
  const transitionLoaderRef = useRef<HTMLDivElement | null>(null);

  const [transitionState, setTransitionState] = useState({
    expanded: transitionExpanded,
    styleOne: {
      zIndex: 9999,
      overflow: 'hidden',
      transformOrigin: 'center',
      transitionDuration: '0',
      transitionTimingFunction: 'none',
      width: '200vmax',
      paddingBottom: '200vmax',
      height: 'auto',
      transitionProperty: 'none',
      opacity: 1,
      transitionDelay: '0',
      pointerEvents: 'none'
    } as React.CSSProperties,
    styleTwo: {
      zIndex: 9999,
      overflow: 'hidden',
      transformOrigin: 'center',
      transitionDuration: '0',
      transitionTimingFunction: 'none',
      width: '200vmax',
      paddingBottom: '200vmax',
      height: 'auto',
      transitionProperty: 'none',
      opacity: 1,
      transitionDelay: '0',
      pointerEvents: 'none'
    } as React.CSSProperties,
    styleLoader: {
      zIndex: 9999,
      overflow: 'hidden',
      transformOrigin: 'center',
      height: '77px',
      width: '77px',
      transitionProperty: 'all',
      transitionDuration: '0.777s',
      transitionTimingFunction: 'ease-out',
      opacity: 1,
      transitionDelay: '0',
      pointerEvents: 'none'
    } as React.CSSProperties
  });

  useEffect(() => {
    let transitionDelay = delay;
    const commonStyles = {
      zIndex: 9999,
      overflow: 'hidden',
      transformOrigin: 'center',
      transitionDuration: '0.6s',
      transitionTimingFunction: 'ease-out'
    };

    setTimeout(onStart, transitionDelay * 1000);
    if (transitionExpanded && duration > 0) {
      setTransitionState({
        expanded: true,
        styleOne: {
          ...commonStyles,
          width: '200vmax',
          paddingBottom: '200vmax',
          height: 'auto',
          transitionProperty: 'all',
          opacity: 1,
          transitionDelay: `${transitionDelay}s`,
          pointerEvents: 'none'
        },
        styleTwo: {
          ...commonStyles,
          width: '200vmax',
          paddingBottom: '200vmax',
          height: 'auto',
          opacity: 1,
          transitionProperty: 'width, padding-bottom, height',
          transitionDelay: `${(transitionDelay += 0.25)}s`,
          pointerEvents: 'none'
        },
        styleLoader: {
          ...commonStyles,
          height: '77px',
          width: '77px',
          transitionProperty: 'all',
          transitionDuration: '0.777s',
          transitionTimingFunction: 'ease-out',
          opacity: 1,
          transitionDelay: `${transitionDelay}s`,
          pointerEvents: 'none'
        }
      });
      setTimeout(onComplete, (transitionDelay + 0.5) * 1000);
    } else if (!transitionExpanded && duration > 0) {
      setTransitionState({
        expanded: false,
        styleTwo: {
          ...commonStyles,
          width: '0px',
          paddingBottom: '0px',
          height: 'auto',
          transitionDelay: `${transitionDelay}s`,
          transitionProperty: 'width, padding-bottom, height',
          opacity: 1,
          pointerEvents: 'none'
        },
        styleOne: {
          ...commonStyles,
          width: '0px',
          paddingBottom: '0px',
          height: 'auto',
          opacity: 0.5,
          transitionDelay: `${(transitionDelay += 0.2)}s`,
          transitionProperty: 'width, padding-bottom, height',
          pointerEvents: 'none'
        },
        styleLoader: {
          ...commonStyles,
          height: '0px',
          width: '0px',
          transitionProperty: 'all',
          transitionDuration: '0.777s',
          transitionTimingFunction: 'ease-out',
          opacity: 0,
          transitionDelay: `${(transitionDelay += 0.1)}s`,
          pointerEvents: 'none'
        }
      });
      setTimeout(onComplete, (transitionDelay + 0.5) * 1000);
    }
  }, [transitionExpanded, sound]);

  return (
    <>
      <span
        ref={transitionOneRef}
        className={defaultClassesOne}
        style={{
          ...transitionState.styleOne,
          top: `${transitionCenterPoint?.posTop}px`,
          left: `${transitionCenterPoint?.posLeft}px`
        }}></span>
      <span
        ref={transitionTwoRef}
        className={defaultClassesTwo}
        style={{
          ...transitionState.styleTwo,
          top: `${transitionCenterPoint?.posTop}px`,
          left: `${transitionCenterPoint?.posLeft}px`
        }}></span>
      <div
        ref={transitionLoaderRef}
        className="slider__transitionElement-svgLoader slider__transitionElement"
        style={transitionState.styleLoader}>
        <svg
          className="slider__loader"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg">
          <circle
            className="slider__loader-ring"
            cx="32"
            cy="32"
            r="26"
            fill="none"
            strokeWidth="9"
            strokeDasharray="169.65 169.65"
            strokeDashoffset="-127.24"
            strokeLinecap="round"
            transform="rotate(135)"
          />
          <g>
            <circle
              className="slider__loader-ball1"
              cx="32"
              cy="45"
              r="6"
              transform="rotate(14)"
            />
            <circle
              className="slider__loader-ball2"
              cx="32"
              cy="48"
              r="3"
              transform="rotate(-21)"
            />
          </g>
        </svg>
      </div>
    </>
  );
}

export interface TransitionLoaderAnimationSettings {
  width?: number | string;
  paddingBottom?: number | string;
  height?: number | string;
  zIndex?: number;
  overflow?: 'hidden';
  transformOrigin?: 'center';
  transform?: string;
  duration?: number;
  ease?: string;
  delay?: number;
  opacity?: number;
  onComplete?: () => void;
  onStart?: () => void;
}

export type TransitionLoaderType = {
  transitionExpanded: boolean;
  transitionCenterPoint: { posTop: number; posLeft: number } | null;
  transitionDataSubmit: boolean;
  sound?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  delay?: number; // in seconds
  duration?: number; // in seconds
};

export interface SliderTransitionAnimationSettings {
  width?: number | string;
  paddingBottom?: number | string;
  height?: number | string;
  zIndex?: number;
  overflow?: 'hidden';
  transformOrigin?: 'center';
  transform?: string;
  duration?: number;
  ease?: string;
  delay?: number;
  opacity?: number;
  onComplete?: () => void;
  onStart?: () => void;
}

export type SliderTransitionType = {
  transitionExpanded: boolean;
  transitionCenterPoint: { posTop: number; posLeft: number } | null;
  transitionDataSubmit: boolean;
  sound?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  delay?: number; // in seconds
  duration?: number; // in seconds
};
