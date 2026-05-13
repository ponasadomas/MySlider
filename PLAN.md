# MySlider — Project Plan

A leaner, build-tool-agnostic successor to `SliderFramework`. Same engine concept (React quiz/funnel slider with slide-flow logic), repackaged so it drops cleanly into Astro+Vite, plain Vite, webpack, etc.

## Decisions locked in

- **Standalone repo** at `/Users/ponasadomas/GitHub/MySlider/`. Not a branch, not a fork.
- **`SliderFramework` is untouched.** It stays as-is at `/Users/ponasadomas/GitHub/SliderFramework/` because multiple existing projects depend on its current shape during their builds. We read it as a reference only.
- **Name:** `MySlider` (working name; npm package name TBD in Phase 2).

## Reference projects (read-only)

- **v1 source (the engine we're porting):** `/Users/ponasadomas/GitHub/SliderFramework/`
- **Real-world consumer (proves the v1 patterns work):** `/Users/ponasadomas/GitHub/betterMood app/bM.app-dev/frontend/funnels/quiz-funnel/`
  - Key files: `src/page_quizQuestionnaire.tsx`, `src/pages/QuizQuestionnaire/QuizQuestionnaire.tsx`, `webpack/tools/webpack.aliases.js`, per-funnel `sliderData.ts` / `sliderLogic.ts` / `sliderSettings.ts` / `sliderSoundscape.ts`
- **First new consumer (the target):** `/Users/ponasadomas/GitHub/astrolumi.com/astrolumi.com-dev/frontend/` — Astro 6, Vite under the hood. Funnels will live under `frontend/funnels/<name>/`.

## Goals

1. **Bundler-agnostic.** Builds under Vite (Astro) with no custom loader rules. Webpack still possible but not required.
2. **Distributable.** Installable in another project without "alias up six directories" hacks.
3. **Lean public API.** Single import surface for the engine; layouts importable per-component.
4. **Tree-shakable layouts.** A funnel using 5 of the 20 slide types ships only those 5.
5. **Preserve v1 behavior.** Same `sliderData` / `sliderLogic` / `sliderSettings` shape so v1 consumers can port with minimal diffs.

## Non-goals

- Framework-agnostic / web components. Stays React.
- New UX or visual design.
- Backend integration changes (`submitDataApi`, `receiveDataApi` belong to the consumer).
- Replacing GSAP/libphonenumber/etc. with alternatives.

---

## Phase 1 — Audit (read-only)

Output: an `AUDIT.md` in this repo.

1. Catalog every file in `/Users/ponasadomas/GitHub/SliderFramework/`.
2. Map the **public surface** — grep `bM.app-dev/frontend/funnels/quiz-funnel/src` for every `@slider/...` import. That's the contract MySlider must preserve.
3. Identify **webpack-isms**:
   - Asset imports (`import x from './foo.png'`) that rely on webpack asset modules
   - SCSS `@use`/`@import` paths using webpack-specific resolution (`~package` syntax, etc.)
   - `require.context`, CJS `require()`
   - `process.env.*` reads assuming DefinePlugin
   - Dynamic imports written in webpack-specific form
4. Dependency matrix — for each v1 `package.json` dep, note where it's used and whether it should be: direct, peer, or **optional** peer.
5. Dead code — anything not reachable from the surface in step 2.
6. URL-routing internals — document `useUrlChangeEffect`, `navigateToSlugUrl`, `getCurrentSlideSlugFromUrl`, `createSlideUrl`. Note assumptions about deployment shape (hash vs path routing — see `sliderSettings.navigation.type: '#' | '/'`).

**Stop & review with user before Phase 2.**

## Phase 2 — Design

Output: `ARCHITECTURE.md` covering the decisions. Each one needs user sign-off.

- **Package shape:** single `myslider` package vs split into `core` + `layouts`. (Lean: single package.)
- **Distribution channel:** npm public, npm private, GitHub package, git submodule, or sibling-dir + tsconfig paths.
- **Build output:** `tsup` or `vite` lib mode → ESM + CJS + `.d.ts`.
- **Public API:** lock the exact `exports` map and what each entry point exposes.
- **Styles:** ship pre-compiled CSS vs SCSS source (recommendation: SCSS source — user prefers customizable styling via `@use`).
- **URL routing:** keep `window.location` coupling, design a future seam for router adapters.
- **Peer dep matrix:** which deps are peer (react, react-dom, gsap), which are optional peer (notyf, libphonenumber, use-sound, react-confetti, ...), which stay direct (classnames).

**Stop & review with user before Phase 3.**

## Phase 3 — Build

1. `package.json` with `exports` map, sideEffects flagging for CSS.
2. `tsconfig.json` with `declaration: true`, ESM target.
3. Build config (tsup or vite lib mode).
4. Port source from SliderFramework, **fixing every webpack-ism from Phase 1**.
5. Apply peer-dep split.
6. Per-layout entry points for tree-shaking.
7. Minimal `README.md`: install, peer-deps, quickstart, public API table.

No tests, storybook, or docs site in v1.0 unless user asks.

## Phase 4 — Spike in astrolumi.com

Smallest possible proof.

1. Scaffold `astrolumi.com-dev/frontend/funnels/spike/` as an Astro project with `@astrojs/react`.
2. Install/link MySlider (per Phase 2 distribution decision).
3. Catch-all route `src/pages/[...slug].astro` mounting `<SliderProvider>` + `<Slider client:only="react" />`.
4. Stub `sliderData` with three slides: a `SingleChoiceSlide`, an `EmailSlide`, a `CtaSlide`.
5. Walk through all three in dev. Fix what breaks. Log each fix in `PORTING_NOTES.md`.

**Stop & show user.**

## Phase 5 — Production wiring

1. Add `live-funnels` script to `astrolumi.com-dev/frontend/package.json`. **Keep the `live-*` naming convention.**
2. Wire it into `live-all`.
3. Port one real funnel end-to-end (user picks which).

---

## Standing user preferences

- **External SCSS** via `<style lang="scss">@use './Foo.scss';</style>` in Astro components, not inline `<style>` blocks.
- **`live-all` script name** is the user's cross-project convention. Don't rename.
- **Heavy design binaries** live in Google Drive, not the repo.
- User is **comfortable with React/TS/SCSS** but **lacks build-tooling / packaging knowledge.** Explain those decisions in plain terms before making them. Don't drop jargon without context.

## Stop-and-confirm gates

- End of Phase 1 (audit report)
- End of Phase 2 (architecture decisions)
- End of Phase 4 (spike works / what broke)
- Any one-way-door decision (publishing to a registry, choosing the package name, etc.)
