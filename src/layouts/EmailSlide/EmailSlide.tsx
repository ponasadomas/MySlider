import React, { useState, useEffect } from 'react';

import { ResponsiveImageOutput } from '../../components/ResponsiveImageOutput/ResponsiveImageOutput';
import { Button } from '../../components/Button/Button';

import { SlideType_Email } from '../../types';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useUpdateSliderAnswers } from '../../hooks/useUpdateSliderAnswers';
import { useNudge } from '../../hooks/useNudge';
import { useSliderContext } from '../../core/useSliderContext';

interface EmailSlideProps {
  slideContents: SlideType_Email;
}

export function EmailSlide({ slideContents }: EmailSlideProps) {
  const { sliderAnswers, sliderSettings } = useSliderContext();
  const handleAnswer = useHandleAnswer();
  const updateSliderAnswers = useUpdateSliderAnswers();

  const [userEmail, setUserEmail] = useState('');

  // Consent is a UI gate only — it blocks the button until ticked and is
  // never written to `sliderAnswers`, so it's never submitted with the
  // answers. It IS mirrored to sessionStorage, though, so the tick survives
  // back-navigation like the typed email does. The lazy initializer reads it
  // back on mount (no restore effect — that would race the persist effect).
  const consentStorageKey = `${sliderSettings.sliderName}-${slideContents.slug}-consent`;
  const [consentChecked, setConsentChecked] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem(consentStorageKey) === 'true'
  );

  // Clicking the disabled Continue button shakes whichever requirement is
  // still missing — the email field if it's blank/invalid, otherwise the
  // consent checkbox.
  const { nudged: emailNudged, nudge: nudgeEmail } = useNudge();
  const { nudged: consentNudged, nudge: nudgeConsent } = useNudge();

  useEffect(() => {
    const previousEmail = sliderAnswers[slideContents.slug] as string;
    setUserEmail(previousEmail || '');
  }, [sliderAnswers, slideContents.slug]);

  // Persist on every keystroke so a typed-but-not-submitted email survives
  // back-navigation — `handleAnswer` only writes it on submit. Mirrors how
  // MultipleChoiceSlide persists its partial selection. Deliberately depends
  // only on `userEmail`: `updateSliderAnswers` is a fresh closure each
  // render and must not be a dependency.
  useEffect(() => {
    updateSliderAnswers(slideContents.slug, userEmail);
  }, [userEmail]);

  // Same idea for the consent tick — but kept out of `sliderAnswers`
  // entirely (see above); sessionStorage alone gives it back-nav memory.
  useEffect(() => {
    window.sessionStorage.setItem(consentStorageKey, String(consentChecked));
  }, [consentChecked, consentStorageKey]);

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

  const emailValid = emailRegex.test(userEmail);
  // The button stays disabled until the email is valid and — when a consent
  // checkbox is configured — it has been ticked.
  const canSubmit = emailValid && (!slideContents.consent || consentChecked);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserEmail(event.target.value);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    // Just report the answer. Persisting the email (and any email-marketing
    // sync) is the consuming funnel's job — it hooks `handleAnswer` through
    // the `onAnswer` callback in slider settings. MySlider owns no storage.
    handleAnswer(slideContents.slug, userEmail);
  };

  const handleKeyboardPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="slider__emailSlide">
      <div className="slider__slide-content">
        <section className="slider__section">
          {slideContents.kicker && (
            <p className="slider__emailSlide-kicker">{slideContents.kicker}</p>
          )}
          {slideContents.subtext?.position === 'top' && (
            <p
              className="slider__subtext-top"
              dangerouslySetInnerHTML={{ __html: slideContents.subtext.text }}
            />
          )}
          <h2 dangerouslySetInnerHTML={{ __html: slideContents.headline }}></h2>
          {slideContents.subtext?.position === 'bottom' && (
            <p
              className="slider__subtext-bottom"
              dangerouslySetInnerHTML={{ __html: slideContents.subtext.text }}
            />
          )}
        </section>

        <div className="slider__emailSlide-card">
          <label
            className={`slider__emailSlide-field${
              emailNudged ? ' is-nudged' : ''
            }`}>
            <span className="slider__emailSlide-fieldCaption">
              {slideContents.inputLabel || 'Enter your email'}
            </span>
            <span className="slider__emailSlide-fieldRow">
              <input
                required
                type="email"
                name={slideContents.slug}
                value={userEmail}
                placeholder={slideContents.inputPlaceholder || ''}
                autoComplete="email"
                onChange={handleInputChange}
                onKeyDown={handleKeyboardPress}
              />
            </span>
          </label>

          {slideContents.consent && (
            <label
              className={`slider__emailSlide-consent${
                consentNudged ? ' is-nudged' : ''
              }`}>
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(event) => setConsentChecked(event.target.checked)}
              />
              <span
                className="slider__emailSlide-consentBox"
                aria-hidden="true"
              />
              <span
                className="slider__emailSlide-consentText"
                dangerouslySetInnerHTML={{ __html: slideContents.consent.text }}
              />
            </label>
          )}
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
          disabled={!canSubmit}
          onDisabledClick={() => {
            // Point the user at the first unmet requirement: a bad email
            // first, otherwise the consent box.
            if (!emailValid) nudgeEmail();
            else nudgeConsent();
          }}
          animate={sliderSettings.buttonAnimation}
          addContainer
          onClick={handleSubmit}>
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

        {slideContents.image && (
          <aside className="slider__section">
            <ResponsiveImageOutput
              png={slideContents.image.png}
              webp={slideContents.image.webp}
              sizes={slideContents.image.sizes}
              alt={slideContents.image.alt || ''}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
