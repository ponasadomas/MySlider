import React, { useState, useEffect, useMemo } from 'react';

import { Button } from '../../components/Button/Button';
import { SlideType_BirthDay } from '../../types';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';
import { useUpdateSliderAnswers } from '../../hooks/useUpdateSliderAnswers';
import { useNudge } from '../../hooks/useNudge';
import { useSliderContext } from '../../core/useSliderContext';

interface BirthDaySlideProps {
  slideContents: SlideType_BirthDay;
}

// Days in a given 1-indexed month. Year is optional — when absent we assume
// a leap year (2000) so February still offers 29 until a year is picked.
function daysInMonth(month: number, year?: number): number {
  if (!month) return 31;
  return new Date(year || 2000, month, 0).getDate();
}

export function BirthDaySlide({ slideContents }: BirthDaySlideProps) {
  const { sliderAnswers, sliderSettings } = useSliderContext();
  const handleAnswer = useHandleAnswer();
  const updateSliderAnswers = useUpdateSliderAnswers();

  // Clicking the disabled Continue button shakes the day/month/year row — a
  // wordless hint that the date isn't complete yet.
  const { nudged, nudge } = useNudge();

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Restore a previously entered date (stored as an ISO `YYYY-MM-DD` string —
  // partials like `1990--` are valid and re-parse correctly).
  useEffect(() => {
    const stored = sliderAnswers[slideContents.slug];
    if (typeof stored === 'string' && stored.includes('-')) {
      const [y, m, d] = stored.split('-');
      setYear(y || '');
      setMonth(m ? String(parseInt(m, 10)) : '');
      setDay(d ? String(parseInt(d, 10)) : '');
    }
  }, [sliderAnswers, slideContents.slug]);

  // Persist on every change so a partial date (e.g. user picked the year
  // but not the month/day yet) survives back-navigation — `handleAnswer`
  // only writes on submit. Same pattern as EmailSlide / TextInputSlide.
  // Depends only on the date parts; `updateSliderAnswers` is a fresh
  // closure each render and must not be a dependency.
  useEffect(() => {
    if (!day && !month && !year) return; // nothing entered yet
    const partial = `${year || ''}-${
      month ? String(month).padStart(2, '0') : ''
    }-${day ? String(day).padStart(2, '0') : ''}`;
    updateSliderAnswers(slideContents.slug, partial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, month, year]);

  const minAge = slideContents.minAge ?? 13;
  const minYear = slideContents.minYear ?? 1920;
  const maxYear = new Date().getFullYear() - minAge;

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) list.push(y);
    return list;
  }, [maxYear, minYear]);

  // Day count tracks the selected month/year (28–31, leap years included).
  const maxDays = daysInMonth(
    parseInt(month, 10),
    year ? parseInt(year, 10) : undefined
  );
  const days = useMemo(() => {
    const list: number[] = [];
    for (let d = 1; d <= maxDays; d++) list.push(d);
    return list;
  }, [maxDays]);

  // If a shorter month drops the selected day out of range, clear it.
  useEffect(() => {
    if (day && parseInt(day, 10) > maxDays) setDay('');
  }, [maxDays, day]);

  const isComplete = Boolean(day && month && year);
  const iso = isComplete
    ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    : '';

  const handleContinue = () => {
    if (!isComplete) return;
    handleAnswer(slideContents.slug, iso);
  };

  const renderHint = () => {
    if (!slideContents.hint) return null;
    const { idle, complete } = slideContents.hint;
    let text = idle;
    if (isComplete) {
      if (typeof complete === 'function') {
        // Consumer-derived copy (zodiac, age, …) — MySlider just calls it.
        text = complete({
          day: parseInt(day, 10),
          month: parseInt(month, 10),
          year: parseInt(year, 10),
          iso
        });
      } else {
        const monthName =
          slideContents.monthNames[parseInt(month, 10) - 1] ?? month;
        text = complete
          .replace('{day}', String(day))
          .replace('{month}', monthName)
          .replace('{year}', String(year));
      }
    }
    return (
      <p
        className={`slider__birthDaySlide-hint${
          isComplete ? ' slider__birthDaySlide-hint-complete' : ''
        }`}>
        {text}
      </p>
    );
  };

  if (!slideContents) {
    console.warn('No slideContents provided to BirthDaySlide component');
    return null;
  }

  return (
    <div className="slider__birthDaySlide">
      <div className="slider__slide-content">
        <section className="slider__section">
          {slideContents.kicker && (
            <p className="slider__birthDaySlide-kicker">
              {slideContents.kicker}
            </p>
          )}
          {slideContents.subtext?.position === 'top' && (
            <p
              className="slider__subtext-top"
              dangerouslySetInnerHTML={{ __html: slideContents.subtext.text }}
            />
          )}
          <h2
            dangerouslySetInnerHTML={{ __html: slideContents.question }}></h2>
          {slideContents.subtext?.position === 'bottom' && (
            <p
              className="slider__subtext-bottom"
              dangerouslySetInnerHTML={{ __html: slideContents.subtext.text }}
            />
          )}
        </section>

        <div className="slider__birthDaySlide-card">
          {slideContents.dobLabel && (
            <p className="slider__birthDaySlide-label">
              {slideContents.dobLabel}
            </p>
          )}
          <div
            className={`slider__birthDaySlide-grid${
              nudged ? ' is-nudged' : ''
            }`}>
            <label className="slider__birthDaySlide-field">
              <span className="slider__birthDaySlide-fieldCaption">
                {slideContents.fieldLabels.day}
              </span>
              <select
                required
                name={`${slideContents.slug}-day`}
                value={day}
                onChange={(e) => setDay(e.target.value)}>
                <option value="" disabled>
                  {slideContents.fieldLabels.day}
                </option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <span className="slider__birthDaySlide-caret" aria-hidden="true">
                ▾
              </span>
            </label>

            <label className="slider__birthDaySlide-field">
              <span className="slider__birthDaySlide-fieldCaption">
                {slideContents.fieldLabels.month}
              </span>
              <select
                required
                name={`${slideContents.slug}-month`}
                value={month}
                onChange={(e) => setMonth(e.target.value)}>
                <option value="" disabled>
                  {slideContents.fieldLabels.month}
                </option>
                {slideContents.monthNames.map((name, i) => (
                  <option key={i} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <span className="slider__birthDaySlide-caret" aria-hidden="true">
                ▾
              </span>
            </label>

            <label className="slider__birthDaySlide-field">
              <span className="slider__birthDaySlide-fieldCaption">
                {slideContents.fieldLabels.year}
              </span>
              <select
                required
                name={`${slideContents.slug}-year`}
                value={year}
                onChange={(e) => setYear(e.target.value)}>
                <option value="" disabled>
                  {slideContents.fieldLabels.year}
                </option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <span className="slider__birthDaySlide-caret" aria-hidden="true">
                ▾
              </span>
            </label>
          </div>
          {renderHint()}
        </div>

        <Button
          primary
          flat
          navigation="forward"
          disabled={!isComplete}
          onDisabledClick={nudge}
          animate={sliderSettings.buttonAnimation}
          addContainer
          onClick={handleContinue}>
          {slideContents.buttonText || 'Continue'}
        </Button>
      </div>
    </div>
  );
}
