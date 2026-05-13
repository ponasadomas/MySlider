import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useSliderContext } from '../../core/useSliderContext';

import { SlideType_CalculatingSlide } from '../../types';

interface SlideCalculatingProps {
  slideContents: SlideType_CalculatingSlide;
}

export function CalculatingSlide({ slideContents }: SlideCalculatingProps) {
  const handleAnswer = useHandleAnswer();
  const [shouldHandleAnswer, setShouldHandleAnswer] = useState(false);
  const hasHandledAnswerRef = useRef(false);
  const { setHideUIElements } = useSliderContext();

  // Add pause/play animation control like BreatherLotusSlide
  const [animationPaused, setAnimationPaused] = useState(true);
  const mainTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Create refs for each progress bar
  const progressBarRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize refs array with unique stable refs
  const setRef = (el: HTMLDivElement | null, index: number) => {
    if (progressBarRefs.current.length !== slideContents.elements.length) {
      progressBarRefs.current = Array(slideContents.elements.length).fill(null);
    }
    progressBarRefs.current[index] = el;
  };

  // State to track progress percentages for each bar
  const [progressPercentages, setProgressPercentages] = useState<number[]>(
    Array(slideContents.elements.length).fill(0)
  );

  // State to track which element is currently being animated
  const [currentAnimatingIndex, setCurrentAnimatingIndex] = useState(0);

  // Generate random checkpoints for a more realistic loading effect
  const generateRandomCheckpoints = (count: number): number[] => {
    // Always start at 0 and end at 100
    const checkpoints = [0];

    // Divide the 0-100 range into segments
    const step = 100 / count;

    // Generate random intermediate checkpoints
    for (let i = 1; i < count; i++) {
      // Create a checkpoint within each segment
      // Base position would be step * i
      const randomOffset = (Math.random() - 0.5) * step * 0.5; // Random offset within ±25% of segment size
      const basePosition = step * i;
      const position = Math.max(
        checkpoints[i - 1] + 1, // Ensure it's at least 1 more than previous
        Math.min(99, Math.round(basePosition + randomOffset)) // Don't exceed 99
      );

      checkpoints.push(position);
    }

    // Always end at 100
    checkpoints.push(100);

    return checkpoints;
  };

  // Generate random durations for each segment while respecting total time
  const generateRandomDurations = (
    totalTime: number,
    checkpoints: number[]
  ): number[] => {
    const segmentCount = checkpoints.length - 1;
    const durations: number[] = [];

    // Generate random values that will be used to distribute the total time
    const randomFactors: number[] = [];
    for (let i = 0; i < segmentCount; i++) {
      // Create variation in segment speeds - some segments will be faster, others slower
      // The multiplier creates more variation
      const multiplier = 0.5 + Math.random() * 1.5;
      randomFactors.push(multiplier);
    }

    // Calculate the sum of all factors
    const factorSum = randomFactors.reduce((a, b) => a + b, 0);

    // Distribute the total time according to the random factors
    for (let i = 0; i < segmentCount; i++) {
      const segmentDuration = (randomFactors[i] / factorSum) * totalTime;
      durations.push(segmentDuration);
    }

    return durations;
  };

  // Setup animation timeline
  useEffect(() => {
    // We need to ensure refs are available before starting animations
    const allRefsAvailable = progressBarRefs.current.every(
      (ref) => ref !== null
    );
    if (!allRefsAvailable) return;

    // Reset to initial state
    setProgressPercentages(Array(slideContents.elements.length).fill(0));

    // Reset any existing animations
    if (mainTimelineRef.current) {
      mainTimelineRef.current.kill();
    }

    // Create a new paused timeline
    mainTimelineRef.current = gsap.timeline({
      paused: true, // Start paused and only play when setAnimationPaused(false)
      onComplete: () => {
        // When all bars have completed, trigger answer handling
        setTimeout(() => {
          setShouldHandleAnswer(true);
        }, 333);
      }
    });

    // For each progress bar in sequence
    slideContents.elements.forEach((element, barIndex) => {
      // Generate 5-8 random checkpoints for this bar
      const checkpointCount = 5 + Math.floor(Math.random() * 4);
      const checkpoints = generateRandomCheckpoints(checkpointCount);

      // Generate random durations for each segment, totaling the specified time
      const durations = generateRandomDurations(element.time, checkpoints);

      // Create a timeline for this specific bar
      const barTimeline = gsap.timeline({
        onStart: () => {
          setCurrentAnimatingIndex(barIndex);
        }
      });

      // Add segments for this bar
      for (let i = 0; i < checkpoints.length - 1; i++) {
        const fromPercent = checkpoints[i];
        const toPercent = checkpoints[i + 1];
        const duration = durations[i];

        // Create a tween for this segment
        barTimeline.to(progressBarRefs.current[barIndex], {
          width: `${toPercent}%`,
          duration: duration,
          ease: i % 2 === 0 ? 'power1.inOut' : 'power2.in', // Alternate easing for variety
          onUpdate: function () {
            // Calculate progress based on tween's progress
            const progress = Math.round(
              fromPercent + (toPercent - fromPercent) * this.progress()
            );

            // Update the state for this bar
            setProgressPercentages((prev) => {
              // Only update this specific bar to reduce re-renders
              if (prev[barIndex] === progress) return prev;

              const newProgress = [...prev];
              newProgress[barIndex] = progress;
              return newProgress;
            });
          }
        });
      }

      // Add this bar's timeline to the main timeline
      // This ensures bars animate sequentially
      if (mainTimelineRef.current) {
        mainTimelineRef.current.add(barTimeline);
      }
    });

    return () => {
      // Clean up all animations when component unmounts
      if (mainTimelineRef.current) {
        mainTimelineRef.current.kill();
        mainTimelineRef.current = null;
      }
    };
  }, [slideContents.elements]);

  // Similar to the BreatherLotusSlide approach, start animation after a delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Start animation after slide transition completes
      setAnimationPaused(false);

      if (mainTimelineRef.current) {
        mainTimelineRef.current.play();
      }
    }, 500); // Same delay as BreatherLotusSlide

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (shouldHandleAnswer && !hasHandledAnswerRef.current) {
      // `handleAnswer` from `useHandleAnswer` is a fresh closure on every render. Without the
      // ref guard, this effect re-fires on the next render and calls `handleAnswer` again with a
      // stale `sliderFlow` (calculating has already been filtered out by the first call), which
      // makes `getSlideIndex` return -1, falls back to 0, and navigates to the wrong slide.
      hasHandledAnswerRef.current = true;
      handleAnswer(slideContents.slug, null);
    }
  }, [shouldHandleAnswer, slideContents.slug, handleAnswer]);

  useEffect(() => {
    setHideUIElements(true);

    return () => {
      setHideUIElements(false);
    };
  }, [setHideUIElements]);

  // Function to determine if a bar is completed (100%), active, or not started
  const getBarStatus = (index: number): 'completed' | 'active' | 'waiting' => {
    if (progressPercentages[index] >= 100) return 'completed';
    if (index === currentAnimatingIndex) return 'active';
    return 'waiting';
  };

  return (
    <div className="slider__calculatingSlide">
      <div className="slider__calculatingSlide-content">
        <section className="slider__section">
          <h2>{slideContents.title}</h2>

          {slideContents.elements.map((element, index) => {
            const status = getBarStatus(index);

            return (
              <div key={index} className="slider__calculatingSlide-section">
                <h3>{element.title}</h3>

                {/* Customize subtitle based on status */}
                <p>
                  {status === 'completed'
                    ? element.statusMessages?.done || 'Analysis complete'
                    : status === 'active'
                    ? element.statusMessages?.active ||
                      'Analysis in progress...'
                    : element.statusMessages?.waiting ||
                      'Waiting to begin analysis'}
                </p>

                <div className="slider__calculatingSlide-progressBar-container">
                  <div
                    ref={(el) => setRef(el, index)}
                    className="slider__calculatingSlide-progressBar-bar"
                    style={{ width: `${progressPercentages[index]}%` }}
                  />

                  {/* Show dot indicator for waiting bars */}
                  {status === 'waiting' && (
                    <div className="slider__calculatingSlide-progressBar-dot"></div>
                  )}
                </div>

                <div className="slider__calculatingSlide-percentage">
                  {progressPercentages[index]}%
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
