/**
 * Generate a UUID v4 string (`"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"`, 36 chars
 * — fits a `CHAR(36)` column exactly).
 *
 * Uses native `crypto.randomUUID` when available (every modern browser in a
 * secure context — HTTPS / localhost), falling back to `crypto.getRandomValues`
 * for rare non-secure/older environments. No npm dependency.
 */
export function uuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
