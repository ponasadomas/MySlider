# MySlider — Class-Hook Contract

This is the public CSS API. Every class name listed below is part of MySlider's contract with consumers: it will be rendered, it will keep its name, and consumers can target it from their own SCSS to restyle the entire funnel — the CSS Zen Garden way.

Class names follow a BEM-ish convention. The library promises:

- **Block prefix:** every class begins with `slider__` so the library can never conflict with consumer styles.
- **Stable names:** classes in this document don't change without a major version bump.
- **Predictable structure:** the same role always uses the same class name across slides.

If a class isn't in this document, it's internal — don't target it from CSS, it may move.

---

## §1. Core structure

Rendered by `Slider`, `Slides`, `Slide`, and the framework chrome.

| Class | Where | Role |
|---|---|---|
| `.slider` | `<main>` in `Slider` | Outer container, full-viewport |
| `.slider__form` | `<form>` inside `.slider` | Form wrapping the entire funnel for native submit semantics |
| `.slider__header` | `<header>` | Top UI bar (logo, category, top progress bar) |
| `.slider__header-content` | `<div>` inside `.slider__header` | Inner alignment wrapper |
| `.slider__header-logoHolder` | Optional `<div>` | Holds the logo when `sliderSettings.header.showLogo` is set |
| `.slider__header-categoryHolder` | Optional `<div>` | Holds the current slide's category text |
| `.slider__header-progressBarHolder` | Optional `<div>` | Holds the progress bar when positioned `top` |
| `.slider__header-exitLink` | Optional `<a>` | Exit link (rendered when `sliderSettings.header.exitLink` is set). `label` accepts any ReactNode. |
| `.slider__header-questionCount` | Optional `<p>` | "Question N of total" (rendered when `sliderSettings.header.showQuestionCount` is a function — consumer formats the markup; i18n is consumer-owned). |
| `.slider__scroll-area` | `<div>` | Wraps `.slider__body` + `.slider__footer` — the natural scroll container when the consumer wants the footer to flow after the body instead of sitting at the viewport bottom. |
| `.slider__body` | `<div>` | Slide viewport — where slides actually render |
| `.slider__footer` | `<footer>` | Bottom UI bar (back button + bottom progress bar) |
| `.slider__footer-content` | `<div>` inside `.slider__footer` | Inner alignment wrapper |
| `.slider__footer-reassurance` | Optional `<p>` | Reassurance/privacy line below the footer-content row (rendered when `sliderSettings.footer.reassurance` is set; accepts any ReactNode). |
| `.slider__slide-holder` | `<div>` per slide | Per-slide animation wrapper (absolutely positioned) |
| `.slider__slide-container` | `<div>` inside `.slider__slide-holder` | Per-slide content container |
| `.slider__slide-content` | `<div>` | Inner wrapper around the active layout |

## §2. State modifiers

Toggled by the framework based on runtime state. Style these to react to slider state.

| Class | Means | When applied |
|---|---|---|
| `.slider__show` | Slider is visible | After mount, when not loading |
| `.slider__hide` | Slider is hidden | While loading screen is active |
| `.slider__UIElement-hide` | Hide header/footer chrome | During breather/breatherLotus slides |
| `.slider__disableEvents` | Mouse events disabled | During transition between slides |
| `.slider__activeAnimation` | Animation in progress | During GSAP transitions |

## §3. Buttons (`Button`)

Composed via `classNames()` — multiple modifiers can stack.

**Type modifiers:**
| Class | Prop |
|---|---|
| `.slider__button-flat` | `flat` |
| `.slider__button-outline` | `outline` |
| `.slider__button-bezel` | `bezel` |

**Variant modifiers:**
| Class | Prop |
|---|---|
| `.slider__button-primary` | `primary` |
| `.slider__button-secondary` | `secondary` |
| `.slider__button-transparent` | `transparent` |
| `.slider__button-pill` | `pill` |
| `.slider__button-disabled` | `disabled` |
| `.slider__button-disposable` | `disposable` |

**Role modifiers:**
| Class | Prop |
|---|---|
| `.slider__button-back` | `navigation="back"` |
| `.slider__button-forward` | `navigation="forward"` |

**Container & ripple:**
| Class | Role |
|---|---|
| `.slider__buttonContainer` | Optional wrapping `<div>` (when `addContainer`) |
| `.slider__ripple` | Material-style ripple span |
| `.slider__ripple-active` | Ripple in active phase |

**Disabled-click nudge:**

Pass `onDisabledClick` to a `Button` and a `disabled` button stays clickable (no native `disabled` attr — just `aria-disabled="true"` + `.slider__button-disabled`); clicks while disabled route to that callback instead of navigating. Layout slides pair it with the `useNudge()` hook: clicking a disabled Continue button toggles `.is-nudged` for ~600ms on whatever element is blocking submission (the text/specify field, the date row, the email or consent box, the multipleChoice list). MySlider only toggles the class — the consuming project's CSS decides what `.is-nudged` looks like (a shake, a glow…).

## §4. Progress bar (`ProgressBar`)

| Class | Role |
|---|---|
| `.slider__progressBar-container` | Outer container |
| `.slider__progressBar-line` | The track |
| `.slider__progressBar-filler` | The fill bar |
| `.slider__progressBar-bubble` | The position bubble |
| `.slider__progressBar-text` | The "X of Y" text |

## §5. Form primitives

Shared form-element scaffolding used by multi-choice / open-ended slides.

| Class | Role |
|---|---|
| `.slider__formElements` | Group of inputs |
| `.slider__formElements-container` | One input row |
| `.slider__formElements-label` | Label wrapper |
| `.slider__radioButton` | Radio input wrapper |
| `.slider__checkbox` | Checkbox input wrapper |
| `.slider__checkboxHolder` | Checkbox container |
| `.slider__checkboxPicture` | Checkbox-with-image variant |
| `.slider__checkboxPictureHolder` | Picture-checkbox container |

## §6. Layout-specific hooks

Each layout has a top-level class matching its `slideType`, plus internal element hooks.

### SingleChoiceSlide / MultipleChoiceSlide
- (No layout-specific class in v1 — use the form primitives in §5 to style.)
- *v2 cleanup: add `.slider__singleChoiceSlide` and `.slider__multipleChoiceSlide` for consistency with the rest.*

| Class | Role |
|---|---|
| `.slider__singleChoiceSlide-kicker` | Optional kicker line above the question (rendered when `slideContents.kicker` is set) |
| `.slider__multipleChoiceSlide-kicker` | Optional kicker line above the question (rendered when `slideContents.kicker` is set) |
| `.slider__radioButton-specify` | Modifier on the `<li>` of a SingleChoice answer carrying `specify` — wraps the answer label + its reveal field |
| `.slider__radioButton-specifyField` | The collapsible wrapper around the "please specify" text `<input>` (rendered for a `specify` answer; reveal it via `:has(input[type='radio']:checked)`) |
| `.slider__buttonContainer` / `.slider__button-forward` | The Continue button — rendered **only** while the `specify` answer is the current selection. Plain answers advance on click as usual; the `specify` answer reveals its field + this button instead, and the button submits the typed text. |

### SingleChoicePictureSlide / MultipleChoicePictureSlide
- *v2 cleanup: add `.slider__singleChoicePictureSlide` and `.slider__multipleChoicePictureSlide`.*

| Class | Role |
|---|---|
| `.slider__singleChoicePictureSlide-kicker` | Optional kicker line above the question (rendered when `slideContents.kicker` is set) |
| `.slider__radioButton-inlineSvg` | Per-answer inline SVG wrapper (rendered when `answer.image` is `{ inlineSvg }`). The raw SVG is injected as a child, so `fill`/`stroke: currentColor` will inherit the wrapper's color and react to selected state. |

### SingleChoiceRankerSlide
| Class | Role |
|---|---|
| `.slider__singleChoiceRankerSlide` | Root |
| `.slider__singleChoiceRankerSlide-answers` | Answer list |
| `.slider__singleChoiceRankerSlide-answersHolder` | Answer container |

### CopyBlockSlide
| Class | Role |
|---|---|
| `.slider__copyBlockSlide` | Root |
| `.slider__copyBlock` | Inner block |
| `.slider__copyBlock-image` | Image element |
| `.slider__copyBlock-copyImage` | Inline copy image |
| `.slider__copyBlock-svg-image` | SVG image variant |

### HeadlineBlockSlide
| Class | Role |
|---|---|
| `.slider__headlineBlockSlide` | Root |
| `.slider__headlineBlock` | Inner block |

### EmailSlide
| Class | Role |
|---|---|
| `.slider__emailSlide` | Root |
| `.slider__emailSlide-kicker` | Optional kicker line above the headline (rendered when `kicker` is set) |
| `.slider__emailSlide-card` | Framed card wrapping the email field + consent checkbox |
| `.slider__emailSlide-field` | The email `<label>` — caption + input row |
| `.slider__emailSlide-fieldCaption` | Caption above the input (`inputLabel`) |
| `.slider__emailSlide-fieldRow` | Row wrapping the `<input>` (host for a decorative icon) |
| `.slider__emailSlide-consent` | Consent `<label>` — checkbox + box + text (rendered when `consent` is set) |
| `.slider__emailSlide-consentBox` | Styled checkbox indicator (sibling of the visually-hidden `<input>`) |
| `.slider__emailSlide-consentText` | Consent label text (may contain HTML) |
| `.slider__emailSlide-policyText` | Privacy/policy text (rendered when `policyText` is set) |

### TextInputSlide
| Class | Role |
|---|---|
| `.slider__textInputSlide` | Root |
| `.slider__textInputSlide-kicker` | Optional kicker line above the question (rendered when `kicker` is set) |
| `.slider__textInputSlide-card` | Framed card wrapping the input field |
| `.slider__textInputSlide-field` | The input `<label>` — caption + input row |
| `.slider__textInputSlide-fieldCaption` | Caption above the input (rendered when `inputLabel` is set) |
| `.slider__textInputSlide-fieldRow` | Row wrapping the `<input>` (host for a decorative icon) |

### PhoneNumberSlide
| Class | Role |
|---|---|
| `.slider__phoneNumberSlide` | Root |
| `.slider__phoneNumberSlide-form` | Form wrapper |
| `.slider__phoneNumberSlide-caption` | Caption text |

### BirthDaySlide
| Class | Role |
|---|---|
| `.slider__birthDaySlide` | Root |
| `.slider__birthDaySlide-kicker` | Optional kicker line above the question (rendered when `slideContents.kicker` is set) |
| `.slider__birthDaySlide-card` | Framed card wrapping the day/month/year selects |
| `.slider__birthDaySlide-label` | Script label inside the card (rendered when `dobLabel` is set) |
| `.slider__birthDaySlide-grid` | 3-up grid holding the day / month / year fields |
| `.slider__birthDaySlide-field` | One `<label>` field wrapper — caption + `<select>` + caret |
| `.slider__birthDaySlide-fieldCaption` | Small uppercase caption above each select |
| `.slider__birthDaySlide-caret` | Decorative dropdown caret (`pointer-events: none`) |
| `.slider__birthDaySlide-hint` | Optional hint line below the selects (rendered when `hint` is set) |
| `.slider__birthDaySlide-hint-complete` | Modifier on the hint, applied once all three fields are filled |

### OpenEndedQuestionSlide
| Class | Role |
|---|---|
| `.slider__openEndedQuestion` | Root (note: `Slide` suffix dropped here in v1 — inconsistent) |
| `.slider__openEndedQuestion-form` | Form wrapper |

### BreatherSlide
| Class | Role |
|---|---|
| `.slider__breatherSlide` | Root |
| `.slider__breatherSlide-container` | Inner container |
| `.slider__breatherSlide-content` | Content wrapper |
| `.slider__breatherSlide-headline` | Headline element |
| `.slider__breatherSlide-circle` | Animated breathing circle |
| `.slider__breatherSlide-svg` | SVG wrapper |
| `.slider__breatherSlide-svgRect` | SVG rect element |

### BreatherLotusSlide
| Class | Role |
|---|---|
| `.slider__breatherLotusSlide` | Root |
| `.slider__breatherLotusSlide-container` | Inner container |
| `.slider__breatherLotusSlide-content` | Content wrapper |
| `.slider__breatherLotusSlide-headline` | Headline element |
| `.slider__breatherLotusSlide-square` | Animated square |
| `.slider__breatherLotusSlide-svg` | SVG wrapper |
| `.slider__breatherLotusSlide-svgRect` | SVG rect element |

### CalculatingSlide
| Class | Role |
|---|---|
| `.slider__calculatingSlide` | Root |
| `.slider__calculatingSlide-content` | Content wrapper |
| `.slider__calculatingSlide-section` | A section row |
| `.slider__calculatingSlide-percentage` | Percentage text |
| `.slider__calculatingSlide-progressBar--container` | Bar container *(BEM `--` modifier syntax — inconsistent with rest)* |
| `.slider__calculatingSlide-progressBar--bar` | The bar |
| `.slider__calculatingSlide-progressBar--dot` | The dot |

### LoadingSlide
Generic, fully skinnable loading screen — MySlider ships only the behaviour (message cycle, timing, hide-chrome, one-shot auto-advance once the last message has shown). The consuming project owns every visual. Add `'loadingSlide'` to `sliderLogic.specialSlideTypes` so it gets the fade transition.

The behaviour is the `useLoadingSequence(slideContents)` hook (exported from the package root) — `LoadingSlide` is the plain default that renders it. For visuals CSS can't express on the empty `-stage` div (extra DOM layers, orbiting elements…), a consuming project can register its **own** component for the `loadingSlide` type and build it on the same hook.

| Class | Role |
|---|---|
| `.slider__loadingSlide` | Root |
| `.slider__loadingSlide-content` | Content wrapper |
| `.slider__loadingSlide-stage` | Empty styling hook — decorate with the loader visual (CSS animation, background, SVG…). MySlider renders nothing inside it. |
| `.slider__loadingSlide-title` | Optional persistent headline (rendered when `slideContents.title` is set) |
| `.slider__loadingSlide-message` | The current cycling message. Gets `.is-visible` toggled on/off so CSS can fade it — the fade-out `transition` should be ≤ ~450ms to finish inside its slot. |

### TrialPriceSlide
| Class | Role |
|---|---|
| `.slider__trialPriceSlide` | Root |
| `.slider__trialPriceSlide-selection` | Selection group |
| `.slider__trialPriceSlide-arrow` | Arrow indicator |
| `.slider__trialPriceSlide-explanation` | Explanation text |
| `.slider__trialCopyBlock` | Trial copy block *(no `Slide` suffix — inconsistent)* |

### ReportSlide
| Class | Role |
|---|---|
| `.slider__reportSlide` | Root |
| `.slider__report` | Inner block |
| `.slider__report-image` | Image element |
| `.slider__report-copyImage` | Inline copy image |
| `.slider__report-svg-image` | SVG image |
| `.slider__report-scoreBar` | Score bar |
| `.slider__report-bubble` | Score bubble |
| `.slider__report-levels` | Levels container |
| `.slider__report-legend` | Legend |

### ReviewsFacebook
| Class | Role |
|---|---|
| `.slider__reviewsFacebook` | Root |
| `.slider__reviewsFacebook-container` | Inner container |
| `.slider__reviewsFacebook-columns` | Columns layout |
| `.slider__reviewsFacebook-review` | Single review card |
| `.slider__reviewsFacebook-reviewContainer` | Review container |
| `.slider__reviewsFacebook-reactions` | Reactions row |

### CtaSlide
| Class | Role |
|---|---|
| `.slider__ctaSlide` | Root |

### AudioPlayer
| Class | Role |
|---|---|
| `.slider__audioPlayer` | Root |
| `.slider__audioPlayer-button` | Play/pause button |
| `.slider__audioPlayer-time` | Time display |

## §7. Visual helpers

| Class | Role |
|---|---|
| `.slider__gradientBlur` | Gradient blur overlay (used by 7 layouts) |
| `.slider__rightAside` | Right-aligned aside (used by Report/CalculatingSlide) |
| `.slider__section` | Generic section divider |
| `.slider__subtext-top` | Subtext above slide content |
| `.slider__subtext-bottom` | Subtext below slide content |
| `.slider__svg-image` | Inline SVG-rendered image |

## §8. Transition loader

| Class | Role |
|---|---|
| `.slider__transitionElement` | Loader overlay |
| `.slider__transitionElement-svgLoader` | SVG spinner inside loader |

---

## §9. Inconsistencies & decisions for v2

The audit surfaced naming inconsistencies in v1. v2 fixes them. **None of these break consumer CSS** — v2 will ship both names (new + legacy alias) for one major version, then drop legacy in v3.

| Issue | v1 | v2 |
|---|---|---|
| Non-prefixed loader classes (`.pl`, `.pl__ball1`, `.pl__ball2`, `.pl__ring`, `.pause`) — leak into global namespace | `pl`, `pause` | Renamed to `.slider__loader`, `.slider__loader-ball1`, etc. |
| Non-prefixed `.multipleChoice` | `multipleChoice` | `slider__multipleChoiceSlide` |
| Non-prefixed `.radioButton__image`, `.checkbox__image` | `radioButton__image` | `slider__radioButton-image`, `slider__checkbox-image` |
| Non-prefixed responsive helpers `.swapDesktop`, `.swapMobile` | `swapDesktop` | `slider__swapDesktop`, `slider__swapMobile` |
| Inconsistent `--` BEM modifier (only in CalculatingSlide progressBar) | `progressBar--bar` | Normalize to single `-` like the rest: `progressBar-bar` |
| `slider__openEndedQuestion` missing `Slide` suffix | `openEndedQuestion` | `slider__openEndedQuestionSlide` |
| `slider__trialCopyBlock` no slide context | `trialCopyBlock` | `slider__trialPriceSlide-trialCopyBlock` |
| Missing layout root classes on SingleChoice* / MultipleChoice* (no `.slider__singleChoiceSlide` root) | (missing) | Added — every layout has a `slider__<slideType>` root |

## §10. v2 naming rules

Codified so future contributors don't drift again:

1. **Every public class starts with `slider__`.** No exceptions.
2. **Block-element separator is `__`** (two underscores). Block-modifier separator is single `-`.
3. **Every layout has a root class** named `slider__<slideType>` matching the `type` value in `sliderData`.
4. **Internal elements** inside a layout are named `slider__<slideType>-<element>` (single dash).
5. **State modifiers** are siblings, not nested: `.slider__show`, not `.slider .show`.
6. **No non-prefixed helper classes.** If it ends up in MySlider's rendered HTML, it has the `slider__` prefix.
7. **Documented or doesn't exist.** Any class name not in this document is internal and may change without warning.

---

## §11. Total class count

- **§1–§8 documented hooks:** ~110 stable class names
- **§9 renamed in v2:** ~15 classes
- All future PRs that add classes must update this document.
