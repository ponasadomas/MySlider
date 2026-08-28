import { useEffect } from 'react';

import { useSliderContext } from '../core/useSliderContext';
import { createSlideUrl } from '../utils/createSlideUrl';
import { navigateToSlugUrl } from '../utils/navigateToSlugUrl';
import { checkIfSlideIsSpecialType } from '../utils/checkIfSlideIsSpecialType';
import { getNavigationDirection } from '../utils/getNavigationDirection';
import { getCurrentSlideSlugFromUrl } from '../utils/getCurrentSlideSlugFromUrl';

import { useSliderVerticalAnimation } from '../animations/useSliderVerticalAnimation';
import { useSliderHorizontalAnimation } from '../animations/useSliderHorizontalAnimation';
import { useSliderFadeAnimation } from '../animations/useSliderFadeAnimation';
import { useSliderNoneAnimation } from '../animations/useSliderNoneAnimation';
import { useSliderCosmicBlurAnimation } from '../animations/useSliderCosmicBlurAnimation';
import { useSliderVeilSweepAnimation } from '../animations/useSliderVeilSweepAnimation';
import { useSliderStarDissolveAnimation } from '../animations/useSliderStarDissolveAnimation';
import { useSliderSubtleScaleAnimation } from '../animations/useSliderSubtleScaleAnimation';
import { useSliderSoftRiseAnimation } from '../animations/useSliderSoftRiseAnimation';
import { useSliderIosSpringAnimation } from '../animations/useSliderIosSpringAnimation';

export function useSliderNavigation() {
  const {
    sliderSettings,
    sliderData,
    sliderLogic,
    currentSlideSlug,
    nextSlideSlug,
    sliderFlow,
    setHideUIElements,
    setCurrentSlideSlug,
    setNextSlideSlug,
    setDisableMouseEvents,
    setCurrentSlideCategory
  } = useSliderContext();

  // Logic for slide animation completion. We want to reset the nextSlideSlug and
  // move its value to currentSlideSlug, so that basically we are left with one
  // generated block of slide in our DOM.
  const handleAnimationComplete = () => {
    if (nextSlideSlug) {
      setCurrentSlideSlug(nextSlideSlug);
      setNextSlideSlug(null);
      setDisableMouseEvents(current => current ? false : current);
    }
  };
  // A hook that animates slides. If we want to have different types of
  // animations, we should crate a new hook (in a new file) for each animation.
  // This way we will be able to expand library and use old animations if
  // needed.

  const animateSlide =
    sliderSettings.navigation.slideAnimationDirection === 'vertical'
      ? useSliderVerticalAnimation(handleAnimationComplete)
    : sliderSettings.navigation.slideAnimationDirection === 'none'
      ? useSliderNoneAnimation(handleAnimationComplete)
    : sliderSettings.navigation.slideAnimationDirection === 'cosmicBlur'
      ? useSliderCosmicBlurAnimation(handleAnimationComplete)
    : sliderSettings.navigation.slideAnimationDirection === 'veilSweep'
      ? useSliderVeilSweepAnimation(handleAnimationComplete)
    : sliderSettings.navigation.slideAnimationDirection === 'starDissolve'
      ? useSliderStarDissolveAnimation(handleAnimationComplete)
    : sliderSettings.navigation.slideAnimationDirection === 'subtleScale'
      ? useSliderSubtleScaleAnimation(handleAnimationComplete)
    : sliderSettings.navigation.slideAnimationDirection === 'softRise'
      ? useSliderSoftRiseAnimation(handleAnimationComplete)
    : sliderSettings.navigation.slideAnimationDirection === 'iosSpring'
      ? useSliderIosSpringAnimation(handleAnimationComplete)
    : useSliderHorizontalAnimation(handleAnimationComplete);

  const animateSpecialSlide = useSliderFadeAnimation(handleAnimationComplete);

  // This hook is responsible for keeping the URL in sync with the nextSlideSlug
  // state.
  //
  // When a user selects an answer or progresses to the next slide, this
  // triggers an update to 'nextSlideSlug'. In response, this useEffect takes
  // action by:
  //
  //  1. Using 'createSlideUrl' function to determine the URL for the next
  //     slide.
  //  2. Checking if the URL slug for the next slide differs from the current
  //     slide to avoid unnecessary navigation.
  //  3. If the URLs differ, navigating to the new slide and updating the
  //     browser's address bar.
  //
  // The whole purpose here is to update the URL hash/pathname whenever the
  // nextSlideSlug changes. This way we can then launch another useEffect that's
  // fired on location.hash and location.pathname and that will run checks if
  // the entered URL is correct and what to do next.

  useEffect(() => {
    // The `nextSlideSlug` has been updated, so this effect fires. We check if
    // we do have the value for it first and if it's not the same as the
    // `currentSlideSlug` to avoide redundant navigation.

    if (nextSlideSlug && nextSlideSlug !== currentSlideSlug) {
      // We want to check if the nextSlide to be shown is in a specialSlideTypes
      // array, so that we can deal with special slides differently from
      // standard ones (we do not want to push special slide's slug to history,
      // and we want to use different animations).
      const nextSlideIsSpecial = checkIfSlideIsSpecialType(
        nextSlideSlug,
        sliderData,
        sliderLogic.specialSlideTypes
      );

      const currentSlideIsSpecial = checkIfSlideIsSpecialType(
        currentSlideSlug,
        sliderData,
        sliderLogic.specialSlideTypes
      );

      // Using our `startPath` from settings we create an URL for the next slide
      // slug (depending on the type of navigation we use).
      const nextSlideUrl = createSlideUrl(sliderSettings, nextSlideSlug);

      // Slide Animation: First we need to figure which animation we should
      // trigger - backwards or forwards.
      const navigationDirection = getNavigationDirection(
        nextSlideSlug,
        currentSlideSlug,
        sliderFlow
      );

      // For specialSlideTypes we want to use different animations. For example
      // for breatherSlide we want it to fade in and out, rather than simply
      // slide into/off the screen Call a hook to animate slides.

      if (nextSlideIsSpecial || currentSlideIsSpecial) {
        // A special slide fadeIn/fadeOut animation
        setHideUIElements(true);
        animateSpecialSlide();
      } else {
        animateSlide(navigationDirection);
        setHideUIElements(false);
      }

      // We finally navigate to the next slide using the `navigate` function
      // from react-router-dom. This will trigger another useEffect that fires
      // on location.hash and location.pathname change.
      //
      // The important thing here is the check for the currentSlideSlugFromUrl
      // and NOT currentSlideSlug state variable. If we would compare
      // `currentSlideSlug` state variable with the `nextSlideSlug` state, we
      // would always get a truthy statement that would result in double-pushing
      // history state. So when you'd click back you'd have to click twice to go
      // back to the previous slide.
      //
      // On the other hand, if we use `currentSlideSlugFromUrl` for comparison,
      // instead of state variable, we are checking where the user currently is
      // on his browser, which will have a different value than the useState one
      // (it'll have the most recent one).

      const currentSlideSlugFromUrl = getCurrentSlideSlugFromUrl(
        sliderSettings.navigation.type,
        sliderSettings.startPath
      );

      // What we want to check is if the currentSlideSlugFromUrl is the same as
      // the nextSlideSlug. If it is, we don't want to navigate to the same URL.
      // But what's even more important, we want to check if the next slide is
      // one of our "special slides type", like breatherSlide or others, that we
      // only want to show once. By adding this condition, the URL will be
      // changed only if the next slide is not in our "special slides" array.
      if (currentSlideSlugFromUrl !== nextSlideSlug && !nextSlideIsSpecial) {
        navigateToSlugUrl(nextSlideUrl);
      }
    }

  }, [nextSlideSlug]);
}
