import React, { useState } from 'react';

import PhoneInput from 'react-phone-number-input';

import { Button } from '../../components/Button/Button';
import { SlideType_PhoneNumber } from '../../types';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useSliderContext } from '../../core/useSliderContext';

interface PhoneNumberProps {
  slideContents: SlideType_PhoneNumber;
}

export function PhoneNumberSlide({ slideContents }: PhoneNumberProps) {
  const { sliderMetadata, sliderAnswers, sliderSettings } = useSliderContext();

  const handleAnswer = useHandleAnswer();

  // Function to ensure the initial value is always string[]
  const getInitialPhoneNumber = () => {
    const answers = sliderAnswers[slideContents.slug];
    if (typeof answers === 'string') {
      if (answers === ' ') {
        return '';
      }
      return answers; // Convert to array if it's a string
    } else {
      return ''; // Default to empty array if it's neither
    }
  };
  const [phone, setPhone] = useState<string>(getInitialPhoneNumber);

  const handleButtonClick = () => {
    if (phone === '') {
      handleAnswer(slideContents.slug, ' ');
    } else {
      handleAnswer(slideContents.slug, phone);
    }
  };

  return (
    <div className="slider__phoneNumberSlide">
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
        </section>
        <aside className="slider__phoneNumberSlide-form slider__formElements-container">
          <PhoneInput
            placeholder="Enter phone number"
            value={phone}
            international
            defaultCountry={sliderMetadata.country as any}
            onChange={(value) => setPhone(value ?? '')}
          />
          {slideContents.caption && (
            <p
              className="slider__phoneNumberSlide-caption"
              dangerouslySetInnerHTML={{
                __html: slideContents.caption
              }}></p>
          )}
          <Button
            primary
            flat
            navigation="forward"
            animate={sliderSettings.buttonAnimation}
            onClick={() => handleButtonClick()}>
            Continue
          </Button>
          <Button
            transparent
            navigation="forward"
            onClick={() => handleButtonClick()}>
            Skip
          </Button>
        </aside>
      </div>
    </div>
  );
}
