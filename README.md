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
