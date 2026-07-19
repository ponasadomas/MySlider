import { useEffect } from 'react';

import { useSliderContext } from '../core/useSliderContext';
import { getCurrentSlideSlugFromUrl } from '../utils/getCurrentSlideSlugFromUrl';
import { getFirstUnansweredSlugIndex } from '../utils/getFirstUnansweredSlugIndex';
import { getSlideIndex } from '../utils/getSlideIndex';
import { createSlideUrl } from '../utils/createSlideUrl';
import { navigateToSlugUrl } from '../utils/navigateToSlugUrl';
import { checkIfSlideIsSpecialType } from '../utils/checkIfSlideIsSpecialType';


export function useUrlChangeEffect() {
  const {
    sliderSettings,
    sliderFlow,
    sliderAnswers,
    nextSlideSlug,
    setNextSlideSlug,
    sliderTransition,
    setSliderTransition,
    sliderData,
    sliderLogic,
    setCurrentSlideCategory,
    hideUIElements,
    setHideUIElements
  } = useSliderContext();

  const handleUrlChange = () => {
    let slideSlugToShowUrl = '';

    // This conditional handles cases when user finished the Slider, saw ending
    // transition, left for another page and then came back. If we did not have
    // this condition, the transition would still be there and it would hide the
    // slides beneath it. So here, we need to minimize it to let user see the
    // slide and use Slider as before.
    //
    // We also have a check in Slider component in the use effect under the
    // handleBackNavigation() function. It might be that this check will become
    // redundant, if we never have a situation where user has to click back
    // after seeing slider without first being redirect to another page.
    //
    // Keep that in mind.
    if (sliderTransition.transitionExpanded) {
      // setSliderTransition((prev) => ({
      //   ...prev,
      //   transitionExpanded: false
      // }));
    }

    // To display slide's category we need to update the category state. We use
    // it here, because we need to make it on URL change, because otherwise the
    // change will be laggish.
    if (sliderData) {
      const category = sliderData.find(item => item.slug === nextSlideSlug)?.category;
      category && setCurrentSlideCategory(category);
    }

    // Get the current slide slug from the URL bar. We are getting slug name
    // from URL and not from state simply because this useEffect is triggered
    // when the URL changes, and we want to check if (and to what) user manually
    // changed the address. This way we'll be able to prevent wrong URLs and
    // skipping.
    const currentSlideSlugFromUrl = getCurrentSlideSlugFromUrl(
      sliderSettings.navigation.type,
      sliderSettings.startPath
    );

    const currentSlideIndex = getSlideIndex(
      currentSlideSlugFromUrl,
      sliderFlow
    );

    // When we are on a regular slide, we want to show UI elements. This solves
    // the issue where navigating back from special slide still hid the UI
    // elements.
    if (!checkIfSlideIsSpecialType(sliderFlow[currentSlideIndex], sliderData, sliderLogic.specialSlideTypes)) {
      if (hideUIElements) {
        setHideUIElements(false);
      }
    }

    // Check if we have skipping disabled in Slider settings. This way we will
    // know how to deal with the URL change, when the Slug is not the next one
    // in the SliderFlow.
    if (!sliderSettings.navigation.skippingAllowed) {

      // Because we have skipping prevention enabled, we must check which slug
      // was the last answered. This will alow us to check if user is trying to
      // skip questions and redirect him to the one he needs to answer.
      const firstUnansweredSlugIndex = getFirstUnansweredSlugIndex(
        sliderFlow,
        sliderAnswers
      );

      // Now that we have first unanswered slide's index, we can check if user
      // is trying to skip slides. If he is, we want to redirect him to the slug
      // that he must answer (the next in the sliderFlow), not the one he's
      // trying to skip to.

      // If slide index is larger than the first unanswered, or it doesn't exist
      // in the sldierFlow, we redirect to the first unanswered slide.
      if (
        currentSlideIndex > firstUnansweredSlugIndex ||
        currentSlideIndex === -1
      ) {

        slideSlugToShowUrl = createSlideUrl(
          sliderSettings,
          sliderFlow[firstUnansweredSlugIndex]
        );

        // A check below is also to fix the bug after the user accesses Slider's
        // first page at '/'. Without the 'replace' option, we are unable to
        // navigate back, because as soon as we go to a page where Slider does
        // not know what kind of slide that is, we get redirected to the first
        // slide. This loop would prevent us from accessing first page ever. Now
        // if we do not push the start page '/' to history, we can navigate back
        // to it.
        currentSlideIndex === -1
          ? navigateToSlugUrl(slideSlugToShowUrl, { replace: true })
          : navigateToSlugUrl(slideSlugToShowUrl);

        // Fired on back/forward navigation, basically on popstate.
      } else if (currentSlideSlugFromUrl !== nextSlideSlug) {
        setNextSlideSlug(currentSlideSlugFromUrl);
      }
    }

    // If we allow "skipping around" and viewing questions beyond
    // first-unanswered (like in the Survey, where we have copyBlocks that can't
    // be answered) we simply check if such slide exists in sliderFLow and go to
    // that slide. If the slide does not exist, we redirect user to the very
    // first slide in the slideFlow.
    else if (sliderSettings.navigation.skippingAllowed) {
      if (currentSlideIndex !== -1) {
        setNextSlideSlug(currentSlideSlugFromUrl);
      } else {
        slideSlugToShowUrl = createSlideUrl(sliderSettings, sliderFlow[0]);
        navigateToSlugUrl(slideSlugToShowUrl);
      }
    }
  }

  // bfcache guard. Going forward through a transient special slide (e.g. the
  // last question -> breatherSlide -> results page on another route) lets the
  // browser snapshot this page WHILE that loader is on screen. Clicking Back
  // restores that frozen snapshot from the back/forward cache — the loader's
  // timers don't resume, so it hangs and the user can never reach their
  // answers. On a persisted `pageshow` (a bfcache restore) we force a fresh
  // load so the slider re-resolves the URL to the real slide. Loaders stay
  // forward-only. `persisted` is false on a normal first load, so this is a
  // no-op except on actual bfcache restores.
  const handlePageShow = (event: PageTransitionEvent) => {
    if (event.persisted) {
      window.location.reload();
    }
  };

  useEffect(() => {
    // The popstate event does not get fired on all changes to window.location (like hash changes invoked
    // programmatically via window.location.hash = '#/new-hash'), but it does get fired for actions like pressing
    // the back and forward buttons. This is why we use it here. Using react-router-dom would save us this hassle, but
    // would also increase the bundle size.
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('pageshow', handlePageShow);

    // We call the handleUrlChange function initially to ensure it runs on component mount
    // This is so we can fire our logic on programmatic navigation
    handleUrlChange();


    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('pageshow', handlePageShow);
    };

  }, [window.location.hash, window.location.pathname]);
}
