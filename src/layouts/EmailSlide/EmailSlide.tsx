import React, { useState, useEffect } from 'react';

import { ResponsiveImageOutput } from '../../components/ResponsiveImageOutput/ResponsiveImageOutput';
import { Button } from '../../components/Button/Button';

import { SlideType_Email } from '../../types';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useSliderContext } from '../../core/useSliderContext';

interface EmailSlideProps {
  slideContents: SlideType_Email;
}

export function EmailSlide({ slideContents }: EmailSlideProps) {
  const [userEmail, setUserEmail] = useState('');
  const [emailError, setEmailError] = useState(false);

  const { sliderAnswers, sliderSettings } = useSliderContext();
  const handleAnswer = useHandleAnswer();

  useEffect(() => {
    const previousEmail = sliderAnswers[slideContents.slug] as string;
    setUserEmail(previousEmail || '');
  }, [sliderAnswers, slideContents.slug]);

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailError(false);
    setUserEmail(event.target.value);
  };

  const handleButtonClick = (event: React.SyntheticEvent) => {
    setEmailError(!emailRegex.test(userEmail));

    if (emailRegex.test(userEmail)) {
      let userData = localStorage.getItem(sliderSettings.userStorageKey);
      const userDataParsed = userData ? JSON.parse(userData) : {};
      const utmData = userDataParsed.utm_data || {}; // Extracting only utm_data

      localStorage.setItem(
        sliderSettings.userStorageKey,
        JSON.stringify({ ...userDataParsed, email: userEmail })
      );

      if (slideContents.emailMarketingService?.apiEndpoint) {
        fetch(slideContents.emailMarketingService.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            listId: slideContents.emailMarketingService.listId,
            email: userEmail,
            utm_data: utmData
          })
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === 'success') {
              console.log('Email success.');
            } else {
              console.error('Email failure.');
            }
          })
          .catch((error) => {
            // Handle network errors here.
            console.error('Network error:', error);
          });
      }

      handleAnswer(slideContents.slug, userEmail);
    }
  };

  const handleKeyboardPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleButtonClick(event);
    }
  };

  return (
    <div className="slider__emailSlide slider__formElements">
      <div className="slider__slide-content">
        <section className="slider__emailSlide-form slider__formElements-container">
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
          <div
            className={`slider__formElements-labelHolder ${
              emailError
                ? 'slider__formElements-error slider__formElements-headShake'
                : ''
            }`}>
            <input
              required
              placeholder=" "
              type="email"
              name={slideContents.slug}
              value={userEmail}
              onChange={handleInputChange}
              onKeyDown={handleKeyboardPress}
            />
            <span className="slider__formElements-label">Enter your email</span>
          </div>

          {slideContents.policyText &&
            slideContents.policyText.position != 'bottom' && (
              <p
                className="slider__emailSlide-policyText"
                dangerouslySetInnerHTML={{
                  __html: slideContents.policyText.text
                }}></p>
            )}
          <Button
            primary
            flat
            navigation="forward"
            animate={sliderSettings.buttonAnimation}
            // disabled={userEmail ? false : true}
            onClick={(event) => handleButtonClick(event)}>
            {slideContents.buttonText || 'Continue'}
          </Button>
          {slideContents.policyText &&
            slideContents.policyText.position == 'bottom' && (
              <p
                className="slider__emailSlide-policyText"
                dangerouslySetInnerHTML={{
                  __html: slideContents.policyText.text
                }}></p>
            )}
        </section>
        {slideContents.image && (
          <aside className="slider__section">
            {slideContents.image && (
              <ResponsiveImageOutput
                png={slideContents.image.png}
                webp={slideContents.image.webp}
                sizes={slideContents.image.sizes}
                alt={slideContents.image.alt || ''}
              />
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
