import React, { ReactNode, useEffect } from 'react';

import { useSliderContext } from './useSliderContext';

import { useSliderNavigation } from '../hooks/useSliderNavigation';
import { useUrlChangeEffect } from '../hooks/useUrlChangeEffect';

import { Slides } from './Slides';
import { ProgressBar } from '../components/ProgressBar/ProgressBar';
import { Button } from '../components/Button/Button';

export function Slider({
  showLoadingScreen
}: {
  children?: ReactNode;
  showLoadingScreen: boolean;
}) {
  // Hooks
  useSliderNavigation();
  useUrlChangeEffect();

  const {
    currentSlideCategory,
    disableMouseEvents,
    totalSlidesNumber,
    sliderTransition,
    setSliderTransition,
    hideUIElements,
    sliderSettings
  } = useSliderContext();

  useEffect(() => {
    // This handleBackNavigation function handles cases when user finished the
    // Slider, saw ending transition, left for another page and then came back.
    // If we did not have this function, the transition would still be there
    // and it would hide the slides beneath it. So here, we need to minimize it
    // to let user see the slide and use Slider as before.
    const handleBackNavigation = () => {
      setSliderTransition((prev) => ({
        ...prev,
        transitionExpanded: false,
        duration: 0.777,
        delay: 0.999
      }));
    };

    // Listen for the pageshow event that fires when user clicks back
    window.addEventListener('pageshow', () => handleBackNavigation());

    // Cleanup after the component unmounts
    return () => {
      window.removeEventListener('pageshow', handleBackNavigation);
    };
  }, []);

  useEffect(() => {
    setSliderTransition((prev) => ({
      ...prev,
      transitionExpanded: showLoadingScreen,
      duration: 0.777,
      delay: 0.999
    }));
  }, [showLoadingScreen]);

  // The purpose of Slider is to provide the container with required styling for slides.
  return (
    <>
      <main
        className={`slider ${
          showLoadingScreen ? 'slider__hide' : 'slider__show'
        }`}>
        <form className="slider__form">
          <header className="slider__header">
            <div
              className={`slider__header-content ${
                hideUIElements ? 'slider__UIElement-hide' : ''
              }`}>
              <Button navigation="back" addContainer>
                Back
              </Button>

              {sliderSettings.header.showLogo && (
                <div className="slider__header-logoHolder">
                  <img
                    src={sliderSettings.header.showLogo.svg}
                    alt={sliderSettings.header.showLogo.alt}
                  />
                </div>
              )}

              {sliderSettings.header.showQuestionCategory && (
                <div className="slider__header-categoryHolder">
                  <p>{currentSlideCategory}</p>
                </div>
              )}

              {sliderSettings.navigation.progressBar?.position === 'top' && (
                <div className="slider__header-progressBarHolder">
                  <ProgressBar
                    totalSlidesNumber={totalSlidesNumber}
                    position={sliderSettings.navigation.progressBar?.position}
                  />
                </div>
              )}
            </div>
          </header>
          <div
            className={`slider__body ${
              disableMouseEvents ? 'slider__disableEvents' : ''
            }`}>
            <Slides></Slides>
          </div>
          <footer
            className={`slider__footer ${
              hideUIElements ? 'slider__UIElement-hide' : ''
            }`}>
            <div className="slider__footer-content">
              <Button transparent animate navigation="back" addContainer>
                Back
              </Button>
              {sliderSettings.navigation.progressBar?.position !== 'top' && (
                <ProgressBar
                  totalSlidesNumber={totalSlidesNumber}
                  position={
                    sliderSettings.navigation.progressBar?.position ?? 'bottom'
                  }
                />
              )}
            </div>
          </footer>
        </form>
      </main>
    </>
  );
}
