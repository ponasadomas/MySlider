/**
 * Accessor for the shared `userProfile` localStorage contract.
 *
 * `userProfile` is a JSON object in localStorage that holds cross-cutting
 * browser identifiers any project surface can read (landing pages, the funnel,
 * analytics / Meta CAPI). MySlider only reads/writes the two id fields and
 * preserves everything else (an app's utm_data/email/etc.):
 *
 *   id            persistent per-browser user UUID. SHOULD be minted at first
 *                 touch by a landing-page script (the separate identity module);
 *                 MySlider mints it here only as a fallback for visitors who
 *                 deep-link straight into the funnel.
 *   submissionId  per-submission UUID — the idempotency key + CAPI/Pixel
 *                 event_id. Created when a funnel run starts, reused across
 *                 MySlider's 3x retry AND page reloads, and ROTATED after a
 *                 successful submit so the next run is a fresh submission.
 *
 * Keep this contract in sync with each project's landing-page identity module.
 */
import { uuidV4 } from './uuid';

const STORAGE_KEY = 'userProfile';

interface UserProfile {
  id?: string;
  submissionId?: string;
  [key: string]: unknown;
}

const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function read(): UserProfile {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as UserProfile) : {};
  } catch {
    return {};
  }
}

/** Non-destructive merge — only the given fields change; others are preserved. */
function patch(partial: UserProfile): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...read(), ...partial }));
  } catch {
    /* quota / private mode — swallow */
  }
}

/** Persistent user UUID (`userProfile.id`); mints + persists if absent. */
export function getOrMintUserUuid(): string {
  const cur = read().id;
  if (typeof cur === 'string' && cur.length > 0) return cur;
  const fresh = uuidV4();
  patch({ id: fresh });
  return fresh;
}

/** Per-submission UUID (`userProfile.submissionId`); stable until rotated. */
export function getOrCreateSubmissionUuid(): string {
  const cur = read().submissionId;
  if (typeof cur === 'string' && cur.length > 0) return cur;
  const fresh = uuidV4();
  patch({ submissionId: fresh });
  return fresh;
}

/** Drop the current submissionId so the next run mints a fresh one. */
export function rotateSubmissionUuid(): void {
  if (!isBrowser()) return;
  const next = read();
  delete next.submissionId;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* swallow */
  }
}
