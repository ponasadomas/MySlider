# SliderFramework v1 — Audit

Read-only assessment of `/Users/ponasadomas/GitHub/SliderFramework/` to inform MySlider's design. Headline at the top, details below.

## TL;DR — the good news

The slider is **far more portable than expected**. No webpack-magic imports, no `require.context`, no `process.env` reads, no `~package` SCSS resolution. Just standard ESM `import x from './foo.png'` and standard SCSS imports — both of which Vite handles natively. The "rebuild for Vite" task is mostly *packaging*, not rewriting.

## TL;DR — the real problems

Not bundler-isms. Real structural issues v2 needs to address:

1. **Layouts are statically imported in `Slide.tsx`.** All 19 layouts ship even when a funnel uses 5. Biggest tree-shaking blocker.
2. **No `tsconfig.json` and no build output.** v1 isn't a package — it's a folder consumers alias to. Imports work because the consumer's TS+webpack compile the `.tsx` source directly.
3. **Four unused dependencies in `package.json`.** `google-libphonenumber`, `libphonenumber-js`, `react-international-phone`, `core-js` — never imported anywhere in source. Pure bloat.
4. **`sass` and `sass-loader` are runtime deps.** Wrong category — those belong to the consumer's build, not the library.
5. **No public API contract.** Consumers reach into deep paths (`@slider/components/SliderProvider/SliderProvider`). v2 should expose a flat surface.

---

## 1. File catalog

```
SliderFramework/
├── animations/         4 GSAP-based slide-transition hooks (Fade/Horizontal/None/Vertical)
├── components/         9 core components — Slider, SliderProvider, Slides, Slide, ProgressBar, Button, GradientBlur, ResponsiveImageOutput, TransitionLoader
├── context/SliderContext/   React context + useSliderContext hook
├── hooks/              10 hooks — navigation, URL, answers, sound, tags, preload, etc.
├── layouts/            19 slide types (see §5)
├── types/              contextTypes.ts + slideTypes.ts
├── utils/              17 utility functions — URL parsing, image preload, validation, notifications
├── assets/scss/        2 SCSS files: slider.scss (main) + notyf.scss (notification styles)
└── package.json        No tsconfig, no build, no README
```

Totals: ~70 source files, ~3 SCSS files, ~17 bundled PNG images (CoachAnimationSlide + ReviewsFacebook icons).

## 2. Public API surface (what consumers actually import)

Searched bM's `quiz-funnel/src` for every `@slider/*` import. The contract MySlider must preserve is **tiny**:

| Imported from | Used as | Notes |
|---|---|---|
| `@slider/components/SliderProvider/SliderProvider` | `SliderProvider` (named export) | The root context provider |
| `@slider/components/Slider/Slider` | `Slider` (default export, lazy-loaded) | The render root |
| `@slider/types/slideTypes` | `SliderDataTypes` | Type only |
| `@slider/types/contextTypes` | `SliderLogicType`, `SliderSettingsType` | Types only |

**Layouts are not imported by consumers.** They resolve internally inside `Slide.tsx` via a `slideType → component` map. This is convenient (consumers just write `type: 'emailSlide'` in `sliderData`) but **defeats tree-shaking entirely** — every funnel ships every layout.

## 3. Webpack-isms (the portability check)

| Pattern checked | Found? | Verdict |
|---|---|---|
| `require.context` | No | ✅ |
| CJS `require()` | No | ✅ |
| `process.env.*` reads | No | ✅ |
| `~package` SCSS syntax | No | ✅ |
| Asset imports `import x from './foo.png'` | Yes (14 in CoachAnimationSlide, 0 elsewhere) | ✅ Vite-native, works as-is |
| SCSS imports `import './Foo.scss'` | Yes (3 occurrences) | ✅ Vite-native |
| Webpack-specific dynamic imports (`/* webpackChunkName */` comments) | No | ✅ |
| Hard-coded webpack aliases inside source | No | ✅ |

**No webpack-isms.** Everything resolves via standard ESM. Vite, esbuild, Rollup, modern webpack — all handle the patterns as-is.

## 4. Dependency matrix

Source-grep verified actual import locations.

### Unused (delete from package.json)
- `google-libphonenumber` — never imported
- `libphonenumber-js` — never imported
- `react-international-phone` — never imported
- `core-js` — never imported

### Should be peer (consumer installs)
- `react` ^18 (already peer)
- `react-dom` ^18 (already peer)
- `gsap` ^3 (already peer) — used by all 4 animation hooks

### Should be optional peer (consumer installs *if* the relevant slide is used)
- `react-phone-number-input` — only `PhoneNumberSlide` uses it
- `react-confetti` — only `CoachAnimationSlide` uses it
- `resize-observer-polyfill` — `SingleChoiceSlide`, `MultipleChoiceSlide`, `CoachAnimationSlide`. (Modern browsers ship `ResizeObserver` natively — could potentially drop the polyfill entirely.)
- `use-sound` — `useSound` hook, `useSliderAnswersSubmit`, `useHandleLastAnswer`. Funnels with `soundOn: false` could skip it.
- `notyf` — only `utils/notyfNotifications.ts`. If a funnel doesn't show notifications, not needed.

### Direct deps (keep)
- `classnames` — used across most components

### Move to devDependencies / drop from runtime
- `sass`, `sass-loader` — these are consumer's build-time concerns

**Net effect:** of v1's 11 runtime deps, **4 are dead, 5 should be optional peer, 1 direct, 1 wrong-category.** A v2 funnel using basic slides ships none of the optional libs.

## 5. Layout catalog

19 slide types currently statically imported in `Slide.tsx`:

```
SingleChoiceSlide          MultipleChoiceSlide       MultipleChoicePictureSlide
SingleChoicePictureSlide   SingleChoiceRankerSlide   OpenEndedQuestionSlide
CopyBlockSlide             HeadlineBlockSlide        ReportSlide
EmailSlide                 PhoneNumberSlide          CtaSlide
BreatherSlide              BreatherLotusSlide        CalculatingSlide
TrialPriceSlide            CoachAnimationSlide       ReviewsFacebookSlide
AudioPlayer
```

Each carries its own deps (see §4). Tree-shaking these requires changing the slide-resolution pattern (see §8).

## 6. URL routing internals

The slider owns the URL. Three patterns to know:

- **Hash or path routing.** Controlled by `sliderSettings.navigation.type: '#' | '/'`. The same code handles both.
- **`window.popstate` listener** in `useUrlChangeEffect.ts:149`. Reacts to back/forward. No router library — intentional, to keep bundle small (comment at line 147).
- **Programmatic nav** via `navigateToSlugUrl(slug, { replace? })` in `utils/navigateToSlugUrl.ts` — uses `history.pushState` / `history.replaceState`.
- **Skip prevention** via `sliderSettings.navigation.skippingAllowed`. If false, URL-jumping past unanswered questions redirects to the first unanswered.

### Implications for Astro

- A catch-all route (`src/pages/[...slug].astro`) lets the slider keep owning the URL within that route's namespace.
- `client:only="react"` on the mount is necessary — slider reads `window.location` during init.
- Astro view transitions would intercept navigation and break the popstate logic. Disable them for funnel routes.
- Minor v1 quirk: `useUrlChangeEffect.ts:159` lists `window.location.hash` and `window.location.pathname` as `useEffect` deps. Those aren't reactive — the effect actually re-runs because `popstate` calls `handleUrlChange` directly. Harmless, but v2 should clean it up.

## 7. Asset shipping

Two slide types bundle their own images:

- **`CoachAnimationSlide`** — 13 PNGs of coach portraits (gender × age × ethnicity matrix) + 3 "huge" line images. Embedded in the source tree.
- **`ReviewsFacebook`** — 4 reaction icon PNGs (like, heart, care, wow).

**Question for Phase 2:** should v2 keep these baked into the library, or expect consumers to pass image URLs through `sliderData`? Baking them in is convenient but bloats every consumer that uses the slide. Externalizing matches the framework's existing pattern (where most slides take content via props).

## 8. The tree-shaking problem (most important)

`Slide.tsx` does:

```ts
import { SingleChoiceSlide } from '...';
import { EmailSlide } from '...';
// ... 17 more

const SlideComponentMap = {
  singleChoice: SingleChoiceSlide,
  emailSlide: EmailSlide,
  // ...
};
```

All 19 layouts are statically imported regardless of which `slideType`s the funnel actually uses. Any bundler will include them all because they're referenced.

**v2 fix options** (decide in Phase 2):

- **Option A: Registry pattern.** Consumer imports only the layouts they need and registers them: `<SliderProvider layouts={{ singleChoice: SingleChoiceSlide, emailSlide: EmailSlide }}>`. Maximum tree-shaking. Requires consumers to maintain the registry — slightly more boilerplate.
- **Option B: Per-slot lazy imports.** `Slide.tsx` does `React.lazy(() => import('./layouts/X'))` per slide type. Lazy-loaded at runtime per slide. Zero consumer boilerplate. Initial bundle is tiny; each slide loads on demand. Trade-off: small loading lag on first showing of each slide type unless preloaded.
- **Option C: Hybrid.** A small set of "core" layouts pre-imported (covers ~90% of cases), rest registered or lazy.

Recommendation: **Option A** (registry). Explicit, simple, no runtime overhead, gives consumers full control. Slightly more verbose, but the verbosity is one map literal at the root.

## 9. Other smells worth flagging

- **`SliderProvider` reads `sessionStorage` on init.** Fine in CSR-only / `client:only="react"`. Would break in any SSR context (Astro static pages don't run client `useState` initializers server-side, so this is OK for the Astro use case, but document it.)
- **`window.pageshow` listener** in `Slider.tsx:50` — same constraint, browser-only. Same mitigation.
- **`Slider` is `default export`**, `SliderProvider` is `named export`. Inconsistent. v2 should pick one (recommend named for everything; tooling treats named exports better for tree-shaking).
- **`useSliderContext.tsx`** has a `.tsx` extension despite containing only a hook. Stylistic — should be `.ts`.

## 10. Dead code / candidate-for-deletion

To verify in Phase 1.5, but suspected:

- `utils/notyfNotifications.ts` — uses `notyf`. Is it actually called anywhere in the framework? If only by consumers, it could live in a `@myslider/notifications` subpath rather than the core.
- `components/GradientBlur` — not imported by `Slider.tsx`. May be a utility component consumers can opt into.
- `components/ResponsiveImageOutput` — bM re-exports it from `@assets`, doesn't pull from `@slider`. Possibly an early prototype now superseded.

(Not deleting anything in this audit — these are flags for Phase 2 decisions.)

---

## Bottom-line recommendation

**The v2 work isn't a rewrite — it's a repackage.** Concretely:

1. New repo with `tsconfig`, `package.json` `exports` map, `tsup` (or vite lib mode) build.
2. Copy source from SliderFramework `as-is`, fix only the structural problems:
   - Switch to registry-based layout resolution (kills the tree-shaking problem).
   - Drop the 4 dead deps.
   - Move `sass/sass-loader` out of runtime deps.
   - Move slide-specific libs to optional peer deps.
   - Add `tsconfig.json`.
3. Decide on asset strategy (§7) and dead-code cleanup (§10) in Phase 2.

**Estimated work:** 1 focused day for the package shell + porting, 1 more for the spike + first funnel. Not the multi-week refactor it could've been if the slider were full of webpack-isms.

## Open questions for Phase 2

1. **Layout resolution strategy** — registry, lazy, or hybrid? (See §8.)
2. **Asset shipping** — bake coach/reviews images into the lib or externalize via `sliderData`? (See §7.)
3. **`notyf` notifications** — core or subpath? (See §10.)
4. **`GradientBlur`, `ResponsiveImageOutput`** — keep or drop? (See §10.)
5. **Build tool** — `tsup` (simpler) vs Vite lib mode (familiar from Astro)?
6. **Package name** — final npm name? `myslider` is taken on npm. `@<scope>/slider`? `astrolumi-slider`?
7. **Distribution channel** — npm, GitHub Packages, git submodule, or sibling-dir + tsconfig paths?
