import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useSliderContext } from '../../core/useSliderContext';

import { SlideType_BreatherSlide } from '../../types';

const loadingMessages = ['Now inhale...', 'And exhale...', 'Well done!'];

interface SlideBreatherProps {
  slideContents: SlideType_BreatherSlide;
}

export function BreatherSlide({ slideContents }: SlideBreatherProps) {
  const handleAnswer = useHandleAnswer();
  const [shouldHandleAnswer, setShouldHandleAnswer] = useState(false);

  // State to hide UI elements that we can't hide with CSS. For example, we
  // cannot hide the Back button and ProgressBar when the Breather element is
  // visible, because the Breather element is displayed inside a parent
  // element's child's child's child. And forementioned elements are direct
  // children of the parent. Hence we use this state to hide them programatically.
  const { setHideUIElements } = useSliderContext();

  // State to pause and play the animation. We use this state to pause the
  // animation while the slide is being animated out and then play it when the
  // slide is animated in.
  const [animationPaused, setAnimationPaused] = useState(true);

  // Main animation timeline. We add all animation to it, so we can control when
  // to payse and when to play it.
  const animationElement_timeline = useRef(
    gsap.timeline({
      paused: false
    })
  );
  const animationElement_messageRef = useRef<HTMLHeadingElement>(null);
  const animationElement_containerRef = useRef<HTMLDivElement>(null);
  const animationElement_circleRef = Array(6)
    .fill(0)
    .map(() => React.createRef<HTMLDivElement>());

  useEffect(() => {
    setHideUIElements(true);
    animationElement_timeline.current.clear();
    loadingMessages.forEach((message, i) => {
      const messageTimeline = gsap
        .timeline({ paused: animationPaused })
        .set(animationElement_messageRef.current, {
          opacity: 1,
          innerHTML: message
        })
        .to(animationElement_messageRef.current, {
          opacity: 1,
          duration: 1
        });
      if (i < loadingMessages.length - 1) {
        messageTimeline.to(animationElement_messageRef.current, {
          opacity: 0,
          duration: 0.777,
          delay: 3
        });
      } else {
        // It's the last message, so we add onComplete callback here.
        messageTimeline.to(animationElement_messageRef.current, {
          opacity: 1,
          duration: 0.777,
          delay: 0,
          onComplete: () => {
            // This is when the Breather animation officially ends and where we
            // should call handleAnswer to move to the next slide in the flow
            // console.log('Last message animation completed!');
            setShouldHandleAnswer(true);
          }
        });
      }
      animationElement_timeline.current.add(messageTimeline);
    });

    const transformValues = [
      'translate(-18px, -33px)',
      'translate(18px, 33px)',
      'translate(-38px, 0)',
      'translate(38px, 0)',
      'translate(-18px, 33px)',
      'translate(18px, -33px)'
    ];
    animationElement_circleRef.forEach((ref, i) => {
      if (ref.current) {
        // Calculate 50% of the element's width and height
        const squareTimeline = gsap
          .timeline({ paused: animationPaused })
          .fromTo(
            ref.current,
            {
              transform: `translate(0, 0)`
            },
            {
              transform: transformValues[i],
              duration: 4,
              repeat: 1,

              yoyo: true,
              ease: 'power1.out'
            }
          );
        animationElement_timeline.current.add(squareTimeline, 0);
      }
    });

    const containerTimeline = gsap.timeline({ paused: animationPaused }).fromTo(
      animationElement_containerRef.current,
      {
        scale: 0.33,
        rotate: 0
      },
      {
        rotate: 180,
        scale: 0.65,
        duration: 4.5,
        repeat: 1,
        yoyo: true,
        ease: 'power1.inOut'
      }
    );
    animationElement_timeline.current.add(containerTimeline, 0);

    if (!animationPaused) {
      animationElement_timeline.current.play();
    }
  }, [animationPaused]);

  function generateIncreasingRandomCheckpoints() {
    const checkpoints = [0, 20, 25, 43, 56, 66, 71, 75, 94, 100];
    const randomCheckpoints: number[] = [];

    checkpoints.forEach((checkpoint, i) => {
      if (checkpoint === 0) {
        randomCheckpoints.push(checkpoint);
      } else {
        const previousCheckpoint = checkpoints[i - 1];
        randomCheckpoints.push(
          getRandomArbitrary(previousCheckpoint, checkpoints[i])
        );
      }
    });
    randomCheckpoints.push(100);

    return randomCheckpoints;
  }

  function getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  function updateInterval(checkpointArray: number[], animationTimes: number[]) {
    let startTime: number = performance.now();
    let i = 0;

    function update() {
      const lengthStart = checkpointArray[i];
      const lengthEnd = checkpointArray[i + 1];

      const currentTime = performance.now();
      const progress = (currentTime - startTime) / animationTimes[i];

      if (progress < 1) {
        const newWidth = lengthStart + (lengthEnd - lengthStart) * progress;
        logoLoadingBarRef.current?.setAttribute('width', newWidth + '%');
        requestAnimationFrame(update);
      } else {
        logoLoadingBarRef.current?.setAttribute('width', lengthEnd + '%');
        i++;
        startTime = performance.now();
        if (i < checkpointArray.length - 1) {
          requestAnimationFrame(update);
        } else {
          logoLoadingBarRef.current?.setAttribute('width', lengthEnd + '%');
        }
      }
    }
    update();
  }

  const logoLoadingBarRef = useRef<SVGRectElement>(null);

  // This useEffect is a little bit tricky and there's probably a better way to
  // do this. But currently it serves as a way to start animation of the main
  // timeline. The reason for how slide animation works. We have to containers
  // that are present while animation is active: first container is for moving
  // out, second is for moving in. After the animation is finished, we duplicate
  // content from the second container to the first one and delete the second
  // one. If done in the midst of animation you will see graphical glitches.
  // Thus we wait for the slide animation to finish and only then do we start
  // the main timeline. So playing around with the timeout value here will
  // change the delay between the end of the slide animation and the start of
  // breather animation.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimationPaused(false);
      const randomCheckpoints = generateIncreasingRandomCheckpoints();
      const animationTimes = [500, 2000, 500, 1000, 3000, 500, 1000, 500, 1000];

      updateInterval(randomCheckpoints, animationTimes);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (shouldHandleAnswer) {
      handleAnswer(slideContents.slug, null);
    }
  }, [shouldHandleAnswer]);

  return (
    <div className="slider__breatherSlide">
      <div className="slider__breatherSlide-content">
        <section className="slider__section">
          <div
            ref={animationElement_containerRef}
            className="slider__breatherSlide-container">
            {animationElement_circleRef.map((ref, i) => {
              return (
                <div
                  key={i}
                  ref={ref}
                  className="slider__breatherSlide-circle"></div>
              );
            })}
          </div>

          <h2
            ref={animationElement_messageRef}
            className="slider__breatherSlide-headline">
            {loadingMessages[0]}
          </h2>
          <p>
            Be still and bring your attention to your breath while we prepare
            everything
          </p>
        </section>
        <svg
          version="1.1"
          id="logo--loader"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={slideContents.logoLoader.viewBox}
          fill="currentColor"
          focusable="false"
          role="img"
          className="slider__breatherSlide-svg">
          <clipPath
            id="logo-clip-path"
            dangerouslySetInnerHTML={{
              __html: slideContents.logoLoader.svgPath
            }}></clipPath>

          <rect
            id="base-rect"
            clipPath="url(#logo-clip-path)"
            width="100%"
            height="100%"
            fill="currentColor"></rect>
          <rect
            id="loading-bar-rect"
            className="slider__breatherSlide-svgRect"
            ref={logoLoadingBarRef}
            clipPath="url(#logo-clip-path)"
            width="0%"
            height="100%"></rect>
        </svg>
      </div>
    </div>
  );
}
