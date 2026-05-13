# MySlider — Architecture (Phase 2)

Concrete design decisions for v2. Once you sign off on the open items at the bottom, Phase 3 can execute end-to-end without coming back for more design questions.

The whole architecture is anchored by the [MySlider design philosophy](../../.claude/projects/-Users-ponasadomas-GitHub-astrolumi-com/memory/project_myslider_philosophy.md): CSS-Zen-Garden ethos. Library ships clean, semantic, well-classed bones; consumer ships every visual opinion.

---

## 1. Decisions locked

| Topic | Decision |
|---|---|
| Repo | New standalone repo at `/Users/ponasadomas/GitHub/MySlider/` |
| Name | `myslider` |
| Distribution | Personal use only — **not published to npm** |
| Layout resolution | **Registry pattern** (consumer registers only layouts they use) |
| Asset shipping | **Externalized** — all images/icons/videos/sounds come via `sliderData` from the consumer |
| CSS | **Structural only** — positioning, transitions, layout mechanics. No colors, fonts, visual paddings, button looks. |
| Build tool | `tsup` |
| Source of truth | v1 source at `/Users/ponasadomas/GitHub/SliderFramework/` stays untouched (other projects depend on it) |

---

## 2. Repo layout

```
MySlider/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
├── src/
│   ├── index.ts                    # Main entry — exports core
│   ├── layouts.ts                  # Per-layout exports (tree-shakable)
│   ├── types.ts                    # Public types
│   ├── core/
│   │   ├── SliderProvider.tsx
│   │   ├── Slider.tsx
│   │   ├── Slides.tsx
│   │   ├── Slide.tsx               # ← rewritten to use registry
│   │   ├── SliderContext.ts
│   │   └── useSliderContext.ts     # ← renamed from .tsx
│   ├── components/                 # Internal building blocks
│   │   ├── Button/
│   │   ├── ProgressBar/
│   │   ├── GradientBlur/
│   │   ├── ResponsiveImageOutput/
│   │   └── TransitionLoader/
│   ├── hooks/                      # All useXxx hooks
│   ├── animations/                 # 4 GSAP transition hooks
│   ├── utils/                      # URL, preload, validation, notifications
│   ├── layouts/                    # 19 slide components (each exportable)
│   └── styles/
│       ├── slider.scss             # Structural-only base
│       └── transitions.scss        # Transition mechanics
└── dist/                           # Build output (gitignored)
```

Notes:
- `assets/scss/notyf.scss` is **dropped** from the lib. If consumer enables notyf notifications, they import notyf's own CSS.
- `assets/scss/slider.scss` (already structural-only — already aligned with the Zen Garden ethos) becomes `src/styles/slider.scss`.
- `layouts/AudioPlayer/AudioPlayer.scss` is **dropped** from the lib. AudioPlayer becomes content-agnostic; consumer styles it via their own SCSS.
- `layouts/CoachAnimationSlide/` — **dropped entirely from v2.** Rarely used; will be reimplemented later on top of the v2 frame when needed.
- `layouts/ReviewsFacebook/icons/` (4 PNGs) — **removed entirely**. ReviewsFacebook accepts reaction icon URLs via props.

## 3. Public API (the `exports` map)

```jsonc
// package.json
{
  "name": "myslider",
  "exports": {
    ".": { "import": "./dist/index.mjs", "types": "./dist/index.d.ts" },
    "./layouts": { "import": "./dist/layouts.mjs", "types": "./dist/layouts.d.ts" },
    "./styles": "./dist/styles/slider.css",
    "./styles/source": "./src/styles/slider.scss"
  }
}
```

What consumers import:

```ts
// Core engine
import { SliderProvider, Slider } from 'myslider';
import type { SliderDataTypes, SliderSettingsType, SliderLogicType } from 'myslider';

// Only the layouts this funnel actually uses
import { SingleChoiceSlide, EmailSlide, CtaSlide } from 'myslider/layouts';

// Either the compiled structural CSS:
import 'myslider/styles';
// or the SCSS source for customization:
@use 'myslider/styles/source';
```

That's the complete surface. No deep paths, no internal-folder reach-ins.

## 4. Layout registry pattern (the tree-shaking fix)

**Before (v1):** `Slide.tsx` imports all 19 layouts and matches by type string.

**After (v2):** consumer registers only what they use, passes the map to `SliderProvider`:

```tsx
import { SliderProvider, Slider } from 'myslider';
import {
  SingleChoiceSlide,
  EmailSlide,
  CtaSlide,
} from 'myslider/layouts';

const layouts = {
  singleChoice: SingleChoiceSlide,
  emailSlide: EmailSlide,
  ctaSlide: CtaSlide,
} as const;

export function QuizFunnel() {
  return (
    <SliderProvider
      sliderData={sliderData}
      sliderLogic={sliderLogic}
      sliderSettings={sliderSettings}
      sliderMetadata={metadata}
      layouts={layouts}            // ← new prop
    >
      <Slider showLoadingScreen={false} />
    </SliderProvider>
  );
}
```

Internally, `Slide.tsx` becomes ~10 lines:

```tsx
const { sliderData, layouts } = useSliderContext();
const slide = sliderData.find(s => s.slug === currentSlug);
const Layout = layouts[slide.type];
if (!Layout) return <h1>Error: unregistered slide type "{slide.type}"</h1>;
return <Layout slideContents={slide} />;
```

**Result:** a funnel registering 3 layouts ships 3 layouts. The unused 16 are tree-shaken away by the bundler.

## 5. Style strategy (CSS Zen Garden hooks)

The library ships **one** SCSS file (`slider.scss`) plus its compiled `.css`. Contents = structural only:

- `#root { height: 100%; width: 100%; }`
- `.slider`, `.slider__form`, `.slider__body`, `.slider__header`, `.slider__footer` — positioning + sizing
- `.slider__slide-holder`, `.slider__slide-container` — absolute positioning for transitions
- State classes: `.slider__hide`, `.slider__show`, `.slider__UIElement-hide`, `.slider__disableEvents`, `.slider__activeAnimation`

What it explicitly does NOT do:
- No colors, fonts, borders, shadows
- No button/input/checkbox/radio visual styling
- No layout/slide visual styling (those are 100% consumer's job)
- No media queries (consumer's responsive choices)

**Class-name contract.** v1's existing BEM-ish naming is solid — keep it, document it. The library exports a stable contract:

| Hook | Purpose |
|---|---|
| `.slider` | Outer container |
| `.slider__form` | The form wrapping all slides |
| `.slider__header`, `.slider__footer` | Top/bottom UI bars |
| `.slider__body` | Slide viewport |
| `.slider__slide-holder` | Per-slide animation wrapper |
| `.slider__slide-container` | Per-slide content container |
| `.slider__button`, `.slider__button-back`, `.slider__button-forward` | Buttons (TBD — verify v1 names match) |
| `.slider__progressbar` | Progress bar (TBD — verify) |

Consumers target these in their own SCSS to skin the funnel. Like a CSS Zen Garden submission.

## 6. Asset externalization

One slide currently bundles assets. It gets externalized via `sliderData`.

(CoachAnimationSlide was also going to be externalized but is dropped from v2 entirely — rarely used. Reimplement later on top of the v2 frame if needed.)

### ReviewsFacebook

v1: imports 4 reaction icon PNGs.

v2: receives icon URLs via props:

```ts
type SlideType_ReviewsFacebook = {
  type: 'reviewsFacebook';
  // ...
  reactionIcons: { like: string; heart: string; care: string; wow: string };
};
```

## 7. Peer dep matrix (final)

```jsonc
// package.json
{
  "dependencies": {
    "classnames": "^2.5.1"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "gsap": "^3.12.0"
  },
  "peerDependenciesMeta": {
    "react-phone-number-input":  { "optional": true },
    "use-sound":                 { "optional": true },
    "notyf":                     { "optional": true }
  },
  "devDependencies": {
    "tsup": "...",
    "typescript": "^5",
    "sass": "^1",
    "@types/react": "^18",
    "@types/react-dom": "^18"
  }
}
```

**Dropped from v1:**
- `google-libphonenumber`, `libphonenumber-js`, `react-international-phone`, `core-js` — all dead, never imported.
- `resize-observer-polyfill` — modern browsers ship `ResizeObserver` natively (since 2020). The 3 layouts that use the polyfill switch to the native `window.ResizeObserver`. **Decision locked 2026-05-13.**
- `sass-loader` — webpack-only artifact. Not needed.

**Optional peers** — consumers only install if they use the feature:
- `react-phone-number-input` → required if `PhoneNumberSlide` is registered
- `use-sound` → required if `sliderSettings.soundOn: true`
- `notyf` → required if consumer enables in-slider notifications (see §8)

## 8. Notifications strategy

`utils/notyfNotifications.ts` is used by 2 internal hooks (`useSliderAnswersSubmit`, `useHandleLastAnswer`) to show error/success toasts after data submission.

v2 makes `notyf` optional:
- Replace the static `import 'notyf'` with a lazy `await import('notyf')` inside a `notify()` helper.
- If notyf isn't installed, the helper falls back to `console.warn` when `process.env.NODE_ENV !== 'production'`, and silently no-ops in production. **Decision locked 2026-05-13.**
- Drop the `notyf.scss` import — if consumer enables notifications, they import notyf's own CSS themselves.

This means a funnel that doesn't care about toasts pays zero bundle cost.

## 9. URL routing seam

Keep v1's behavior: `window.popstate` listener, `history.pushState`-driven nav, hash-or-path mode via `sliderSettings.navigation.type: '#' | '/'`. No router library — same reason as v1 (bundle size).

**For Astro consumers:** the catch-all route pattern (`src/pages/[...slug].astro`) lets the slider keep full URL ownership inside its namespace. Document this in the README.

**Future-proof seam (zero cost now):** keep all URL operations behind the existing `utils/navigateToSlugUrl`, `getCurrentSlideSlugFromUrl`, `createSlideUrl` helpers. If a future consumer needs a non-window router (Astro view transitions, React Router), they swap those helpers without touching slide components. **Not building the adapter API in v2.0** — just don't paint into a corner.

## 10. Build & distribution

### Build (tsup)

```ts
// tsup.config.ts
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts', 'src/layouts.ts'],
  format: ['esm'],         // ESM-only — modern bundler-friendly
  dts: true,               // emit .d.ts type files
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'gsap'],
  // SCSS shipped as-is — consumer's bundler handles it
  loader: { '.scss': 'copy' },
});
```

ESM-only is fine — Vite, modern webpack, and Astro all consume ESM natively.

### Distribution: tsconfig path alias (sibling-dir)

For astrolumi.com, the consumer's `tsconfig.json` gets:

```jsonc
{
  "compilerOptions": {
    "paths": {
      "myslider":          ["../../../../MySlider/dist/index.mjs"],
      "myslider/layouts":  ["../../../../MySlider/dist/layouts.mjs"],
      "myslider/styles":   ["../../../../MySlider/dist/styles/slider.css"],
      "myslider/styles/source": ["../../../../MySlider/src/styles/slider.scss"]
    }
  }
}
```

Each consuming project runs MySlider's `npm run build` once (or whenever you update v2), then just imports from `'myslider'`. No npm registry, no submodule.

Astro's Vite needs a matching `vite.config` resolve.alias (Astro reads it automatically from `tsconfig.json` paths — we'll verify in Phase 4).

## 11. Migration path (v1 → v2) for future bM-style port

Documented here so future-you (or future-Claude) knows the diff a funnel author has to make to upgrade:

```diff
- import { SliderProvider } from '@slider/components/SliderProvider/SliderProvider';
- const Slider = React.lazy(() => import('@slider/components/Slider/Slider'));
- import type { SliderDataTypes } from '@slider/types/slideTypes';
+ import { SliderProvider, Slider } from 'myslider';
+ import { SingleChoiceSlide, EmailSlide, /* ... */ } from 'myslider/layouts';
+ import type { SliderDataTypes } from 'myslider';
+ import 'myslider/styles';

  <SliderProvider
    sliderData={sliderData}
    sliderLogic={sliderLogic}
    sliderSettings={sliderSettings}
    sliderMetadata={sliderMetadata}
+   layouts={{ singleChoice: SingleChoiceSlide, emailSlide: EmailSlide /* ... */ }}
  >
```

Plus removing the local copies of any coach-image or reaction-icon assets the funnel was relying on from the framework (since v2 externalizes them).

## 12. What's deferred to a hypothetical v2.1+

Not building now; flagged so they don't become a surprise:

- Router adapter API (Astro view-transitions integration). Seam preserved per §9.
- SSR support. v2 stays `client:only`.
- Per-layout SCSS modules / scoped styles. v2 is plain global classes.
- Storybook, tests, docs site.
- React 19 support. v2 targets React 18; tested only on 18.
- Internationalization helpers.

---

## Open questions (last gate before Phase 3)

1. **Class-name contract verification.** §5's hook table is a sketch — I haven't grep-verified every `className=` across all 19 layouts. Open question is whether to audit upfront (~30 min, produces the definitive Zen-Garden hook table before any porting) or fix in-flight (faster start, risks shipping inconsistencies). Recommendation: upfront audit.
