import React, { ChangeEvent, useState } from 'react';
import { useSliderContext } from '../../core/useSliderContext';
import { useSound } from '../../hooks/useSound';

interface CheckboxProps {
  answerData: {
    id: string;
    slideSlug: string;
    text: string | { mobile: string; desktop: string };
    value: string;
    isChecked: boolean;
    noneOption?: boolean;
    description?: string;
    image?: {
      svg: string;
      alt?: string;
    };
  };
  handleCheckboxChange: (
    event: ChangeEvent<HTMLInputElement>,
    isNoneOption: boolean
  ) => void;
}

export function Checkbox({ answerData, handleCheckboxChange }: CheckboxProps) {
  const { sliderSettings } = useSliderContext();

  const [playCheckStart] = useSound({
    soundLength: 500,
    sound: sliderSettings.sounds?.checkbox?.checkStart || '',
    volume: 1,
    interrupt: false
  });

  const [playCheckOn] = useSound({
    soundLength: 500,
    sound: sliderSettings.sounds?.checkbox?.checkOn || '',
    volume: 1,
    interrupt: false
  });

  const [playCheckOff] = useSound({
    soundLength: 500,
    sound: sliderSettings.sounds?.checkbox?.checkOff || '',
    volume: 1,
    interrupt: false
  });

  const [mouseIsDown, setMouseIsDown] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Mobile touch start logic
  const handleTouchStart = (clientX: number, clientY: number) => {
    setStartPos({ x: clientX, y: clientY });
  };

  // Mobile touch end logic
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
          playCheckStart();

          setTimeout(() => {
            setMouseIsDown(false);
            answerData.isChecked ? playCheckOff() : playCheckOn();
          }, 77);
        } else {
          setTimeout(() => {
            setMouseIsDown(false);
          }, 77);
        }
      }

      setStartPos(null);
    }
  };

  return (
    <>
      <input
        type="checkbox"
        name={answerData.slideSlug}
        id={answerData.id}
        value={answerData.value}
        onChange={(event) => {
          handleCheckboxChange(event, answerData.noneOption || false);
        }}
        checked={answerData.isChecked}
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
        style={{
          transform:
            mouseIsDown && sliderSettings.buttonAnimation
              ? 'scale(0.97)'
              : 'scale(1)',
          transition:
            'transform 0.15s ease, box-shadow 0.222s ease, border 0.2s ease'
        }}>
        {answerData.image && (
          <img
            src={answerData.image.svg}
            alt={answerData.image.alt || ''}
            className="slider__checkbox-image"
          />
        )}
        <div className="slider__swapMobile">
          <span>
            {typeof answerData.text === 'object'
              ? answerData.text.mobile
              : answerData.text}
          </span>
        </div>

        <div className="slider__swapDesktop">
          <span>
            {typeof answerData.text === 'object'
              ? answerData.text.desktop
              : answerData.text}
          </span>
        </div>

        {answerData.description && (
          <span className="slider__checkbox-description">
            {answerData.description}
          </span>
        )}
      </label>
    </>
  );
}
