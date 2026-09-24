/**
 * Normalizes user-entered website URLs: adds https:// if no scheme was
 * given, and lowercases the hostname. Returns null if the result isn't
 * a valid, safe (http/https only) URL.
 */
export function normalizeUrl(raw: string): string | null {
  if (!raw) return null;
  let value = raw.trim();

  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(value)) {
    value = `https://${value}`;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  // Restrict dangerous protocols such as javascript:, data:, file: — only
  // http/https website URLs are ever accepted anywhere in this app.
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (!url.hostname || !url.hostname.includes('.')) return null;

  url.hostname = url.hostname.toLowerCase();
  return url.toString();
}

export function isValidHttpUrl(raw: string): boolean {
  return normalizeUrl(raw) !== null;
}

/** Same http/https-only restriction, used for CTA / overlay link fields. */
export function sanitizeLinkUrl(raw: string): string {
  if (!raw) return '';
  const normalized = normalizeUrl(raw);
  return normalized ?? '';
}
