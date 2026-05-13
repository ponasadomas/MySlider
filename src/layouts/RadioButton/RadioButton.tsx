import React, { useState } from 'react';

import { useSound } from '../../hooks/useSound';
import { useSliderContext } from '../../core/useSliderContext';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';

interface RadioButtonProps {
  answerData: {
    id: string;
    slideSlug: string;
    text: string;
    value: string;
    image?:
      | { svg: string; alt?: string }
      | { inlineSvg: string };
  };
}

export function RadioButton({ answerData }: RadioButtonProps) {
  const { sliderAnswers, sliderSettings } = useSliderContext();

  // Initializes the hook if there's a file to play
  const [playSoundDown, soundDownPlaying] = useSound({
    sound: sliderSettings.sounds?.radioButton?.clickDown || '',
    soundLength: 0.1,
    volume: 1,
    interrupt: false
  });
  const [playSoundUp, soundUpPlaying] = useSound({
    sound: sliderSettings.sounds?.radioButton?.clickUp || '',
    soundLength: 0.1,
    volume: 1,
    interrupt: false
  });

  const [mouseIsDown, setMouseIsDown] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Deal with the issue of the user clicking down on the label, then dragging
  // off and releasing and thus triggering the sound event.
  const handleTouchStart = (clientX: number, clientY: number) => {
    setStartPos({ x: clientX, y: clientY });
  };

  const handleTouchEnd = (clientX: number, clientY: number) => {
    if (startPos) {
      const deltaX = clientX - startPos.x;
      const deltaY = clientY - startPos.y;
      const moveThreshold = 5; // Threshold in pixels to consider it a scroll.

      if (
        Math.abs(deltaX) < moveThreshold &&
        Math.abs(deltaY) < moveThreshold
      ) {
        setMouseIsDown(true);
        if (sliderSettings.soundOn) {
          playSoundDown();
        }
        if (sliderSettings.soundOn) {
          setTimeout(() => {
            setMouseIsDown(false);
            playSoundUp();
          }, 100); // Adjust this delay as necessary
        } else {
          setTimeout(() => {
            setMouseIsDown(false);
          }, 100); // Adjust this delay as necessary
        }
      }
      setStartPos(null);
    }
  };

  const handleAnswer = useHandleAnswer();

  const answerValue = sliderAnswers[answerData.slideSlug] === answerData.value;

  return (
    <>
      <input
        type="radio"
        name={answerData.slideSlug}
        id={answerData.id}
        value={answerData.value}
        defaultChecked={answerValue}
      />
      <label
        htmlFor={answerData.id}
        onMouseDown={(e) => {
          handleTouchStart(e.clientX, e.clientY);
        }}
        onMouseUp={(e) => {
          handleTouchEnd(e.clientX, e.clientY);
        }}
        onMouseLeave={() => {
          setMouseIsDown(false);
        }}
        onClick={() => {
          setTimeout(
            () => handleAnswer(answerData.slideSlug, answerData.value),
            sliderSettings.navigation.clickDelay
          );
        }}
        style={{
          transform:
            mouseIsDown && sliderSettings.buttonAnimation
              ? 'scale(0.95)'
              : 'scale(1)',
          transition:
            'transform 0.15s ease, box-shadow 0.222s ease, border 0.2s ease'
        }}>
        {answerData.image && 'inlineSvg' in answerData.image && (
          <span
            className="slider__radioButton-inlineSvg"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: answerData.image.inlineSvg }}
          />
        )}
        {answerData.image && 'svg' in answerData.image && (
          <img
            src={answerData.image.svg}
            alt={answerData.image.alt || ''}
            className="slider__radioButton-image"
          />
        )}
        <div>
          <span>{answerData.text}</span>
        </div>
      </label>
    </>
  );
}
