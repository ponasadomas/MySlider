import React, { useState } from 'react';

import { SlideType_TrialPrice } from '../../types';

import { useSound } from '../../hooks/useSound';
import { useSliderContext } from '../../core/useSliderContext';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { Button } from '../../components/Button/Button';

export function TrialPriceSlide({
  slideContents
}: {
  slideContents: SlideType_TrialPrice;
}) {
  const { sliderAnswers, sliderSettings } = useSliderContext();

  const [checkedAnswers, setCheckedAnswers] = useState(
    sliderAnswers[slideContents.slug]
  );

  const handleAnswer = useHandleAnswer();
  const handleButtonClick = () => {
    handleAnswer(slideContents.slug, checkedAnswers);
  };

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

  const renderAnswers = slideContents.priceOptions.map((item, index) => {
    return (
      <li key={index}>
        <div>
          <input
            type="radio"
            name={`${slideContents.slug}`}
            id={`${slideContents.slug}-${index + 1}`}
            value={item}
            onChange={() => setCheckedAnswers(item.toString())}
            checked={Number(checkedAnswers) === item}
          />
          <label
            htmlFor={`${slideContents.slug}-${index + 1}`}
            onMouseDown={(e) => {
              handleTouchStart(e.clientX, e.clientY);
            }}
            onMouseUp={(e) => {
              handleTouchEnd(e.clientX, e.clientY);
            }}
            onMouseLeave={() => {
              setMouseIsDown(false);
            }}>
            <span>{item}</span>
          </label>
        </div>
      </li>
    );
  });

  return (
    <div className="slider__trialPriceSlide">
      <div className="slider__slide-content">
        <section className="slider__section">
          {slideContents.subtext?.position === 'top' && (
            <p
              dangerouslySetInnerHTML={{
                __html: slideContents.subtext.text
              }}></p>
          )}
          <h2 dangerouslySetInnerHTML={{ __html: slideContents.headline }}></h2>
          {slideContents.subtext?.position === 'bottom' && (
            <p
              dangerouslySetInnerHTML={{
                __html: slideContents.subtext.text
              }}></p>
          )}
          {slideContents.copyHtml && (
            <div
              className="slider__trialPriceSlide-trialCopyBlock"
              dangerouslySetInnerHTML={{
                __html: slideContents.copyHtml
              }}></div>
          )}
        </section>
        <aside className="slider__rightAside">
          <ul className="slider__trialPriceSlide-selection">{renderAnswers}</ul>
          <div className="slider__trialPriceSlide-explanation">
            <p>
              {slideContents.policyText}{' '}
              {Number(checkedAnswers) ===
                slideContents.priceOptions[
                  slideContents.priceOptions.length - 1
                ] && <strong>Amazing! Thank you!</strong>}
            </p>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="512"
              height="512"
              fillRule="evenodd"
              strokeLinejoin="round"
              strokeMiterlimit="2"
              clipRule="evenodd"
              className="slider__trialPriceSlide-arrow"
              viewBox="0 0 64 64">
              <path d="M49.095 52.876c-1.661 1.621-3.523 3.187-5.414 4.306a1.514 1.514 0 1 0 1.542 2.607c2.915-1.724 5.781-4.403 8.044-6.868.29-.316 1.66-1.677 2.134-2.444.418-.674.403-1.283.309-1.614-.071-.249-.253-.661-.772-.972-.541-.324-2.946-.939-3.225-1.026-3.601-1.116-7.478-1.538-11.234-1.445a1.516 1.516 0 0 0 .075 3.029c3.134-.078 6.362.228 9.404 1.059-1.913.611-3.918.939-5.908 1.357-12.02 2.523-23.244.393-28.891-11.727-4.631-9.938-3.466-22.982-3.797-33.67a1.515 1.515 0 0 0-3.028.094c.343 11.069-.718 24.563 4.079 34.856 6.328 13.579 18.792 16.239 32.259 13.411 1.482-.311 2.967-.59 4.423-.953z" />
            </svg>
          </div>
        </aside>
        <Button
          primary
          flat
          navigation="forward"
          animate={sliderSettings.buttonAnimation}
          addContainer
          onClick={() => {
            handleButtonClick();
          }}
          disabled={checkedAnswers ? false : true}>
          Continue
        </Button>
      </div>
    </div>
  );
}
