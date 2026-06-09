# MySlider

Build-tool-agnostic React quiz/funnel slider. Successor to [SliderFramework](../SliderFramework).

> Status: under construction. See `PLAN.md`, `AUDIT.md`, `ARCHITECTURE.md`, `CLASS_HOOKS.md` for the design.

## Design philosophy

CSS-Zen-Garden ethos. The library ships **clean, semantic, well-classed bones** + functional behavior (state machine, transitions, URL routing, data submission). The **consuming project** owns every visual decision via its own SCSS, and provides every image/icon/video/sound through `sliderData`.

## Quickstart (preview — Phase 3 in progress)

```tsx
import { SliderProvider, Slider } from 'myslider';
import { SingleChoiceSlide, EmailSlide, CtaSlide } from 'myslider/layouts';
import 'myslider/styles';

const layouts = {
  singleChoice: SingleChoiceSlide,
  emailSlide: EmailSlide,
  ctaSlide: CtaSlide,
};

export function Funnel() {
  return (
    <SliderProvider
      sliderData={sliderData}
      sliderLogic={sliderLogic}
      sliderSettings={sliderSettings}
      sliderMetadata={{}}
      layouts={layouts}
    >
      <Slider showLoadingScreen={false} />
    </SliderProvider>
  );
}
```

## Peer dependencies

Required: `react@^18`, `react-dom@^18`, `gsap@^3`.

Optional (only install if you register the relevant slide / enable the feature):

- `react-phone-number-input` — for `PhoneNumberSlide`
- `use-sound` — when `sliderSettings.soundOn: true`
- `notyf` — when in-slider notifications are enabled

## Public API

| Import | What |
|---|---|
| `myslider` | `SliderProvider`, `Slider`, all public types |
| `myslider/layouts` | Each slide layout as a named export |
| `myslider/styles` | Compiled structural CSS |
| `myslider/styles/source` | Raw SCSS source (for SCSS-consuming projects) |

See [CLASS_HOOKS.md](./CLASS_HOOKS.md) for the full list of CSS class hooks consumers can target.

## Embedding in an SPA

For funnels that live inside a single-page app (rather than posting to a backend
and redirecting away), the `navigation` settings let the funnel finish and close
**in place**, without ever touching `window.location` (no page reload):

- `onComplete?: () => void` — called when the final slide is completed. When
  set, MySlider hands control straight to it and skips the transition screen,
  data submit and `createRedirectUrlAfterDataSubmit` redirect.
- `onExit?: () => void` — called when Back is pressed on the **first** slide, so
  the host can close its overlay instead of `history.back()`.
- `persistProgress?: boolean` (default `true`) — set `false` to always start on
  the first slide, ignoring saved sessionStorage/URL progress.

## VideoSlide

Unlike the other layouts (structural bones only), `VideoSlide` ships a complete,
self-contained video player — framed 9:16 stage, custom controls + scrubber,
auto-hiding scrim, optional synced captions, and a completion overlay. It is
still theme-driven: colours come from the `--vp-accent` / `--vp-bg` CSS variables
(set them on any ancestor), and the consumer supplies the `videoSrc` and the
surrounding background.
