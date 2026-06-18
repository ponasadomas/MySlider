# `userProfile` identity contract

A single browser identity object in **localStorage** under the key `userProfile`,
shared by every surface of a project — landing pages, the MySlider funnel, and
analytics / Meta CAPI. It carries no PII.

```jsonc
// localStorage["userProfile"]
{
  "id":           "uuid-v4",  // persistent per-browser user UUID  (a.k.a. userUuid)
  "submissionId": "uuid-v4",  // per-submission UUID (idempotency key + CAPI event_id)
  // ...apps may add their own fields (utm_data, email, answers, ...) — preserved
}
```

## Field lifecycles

- **`id` (userUuid)** — persistent. **MUST be minted at first touch on the landing
  page** (see "Wiring" below), so it exists before the funnel and before any
  pixel fires. Reused across all funnels/sessions forever (until localStorage is
  cleared).
- **`submissionId`** — one per submission run. Created when a funnel run starts,
  **reused across MySlider's 3× retry and across page reloads**, and **rotated
  (deleted) after a successful submit** so the next run is a new submission. This
  is what makes retries idempotent (UNIQUE `submission_uuid` server-side) and
  gives the browser Pixel + server CAPI the same `event_id` to dedup on.

## Who reads/writes it

- **MySlider** (`src/utils/userProfile.ts`, exported from the package): reads `id`
  (mints a *fallback* only on direct funnel entry), creates/reads `submissionId`,
  injects both into the submitted `sliderMetadata`, and rotates `submissionId` on
  success. A consumer that passes its own `userUuid`/`submissionUuid` in
  `sliderMetadata` still wins.
- **Each project's landing-page identity module** (per-project copy, kept in sync
  with this contract): mints `id` at first touch. Same key, same fields.
- **Analytics / CAPI**: read `userProfile.id` + `userProfile.submissionId` — the
  exact ids the backend received.

## Wiring (don't forget!)

1. **Every static/landing page** must run the identity module in `<head>` so `id`
   is minted on first touch:
   - astrolumi: `getOrMintVisitorId()` from `@assets/scripts/userProfile`, called
     in `static-pages/src/layouts/BaseLayout.astro`.
   - inhead: the `userProfile` module's mint call in its `BaseLayout.astro`.
2. **Funnels** need no per-app UUID code — MySlider injects `userUuid` +
   `submissionUuid` from this contract automatically. (Do NOT also mint a
   `submissionUuid` app-side; that would bypass persistence + rotation.)
3. **Backend** (`/api/submitData.php`) already accepts `submissionUuid`/`userUuid`
   from `sliderMetadata` (validates as UUID; server-generates if absent) and is
   idempotent on `submission_uuid`.

## Keep copies in sync

There is intentionally **no shared npm package** — the module is ~50 lines. Each
project keeps a copy of the landing-page identity module; MySlider has its own
accessor. All three implement THIS contract (key `userProfile`, fields `id` +
`submissionId`, non-destructive merge). If you change the contract, update all.
