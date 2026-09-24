export function buildWhatsappUrl(phoneNumber: string, message: string): string {
  const digits = phoneNumber.replace(/[^\d]/g, '');
  const params = new URLSearchParams();
  if (message) params.set('text', message);
  const query = params.toString();
  return `https://wa.me/${digits}${query ? `?${query}` : ''}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [4.345, 'week'], [12, 'month'], [Infinity, 'year']
  ];
  let value = seconds;
  let unit = 'second';
  for (const [size, name] of units) {
    if (value < size) { unit = name; break; }
    value = Math.floor(value / size);
    unit = name;
  }
  if (value <= 1 && unit === 'second') return 'just now';
  return `${value} ${unit}${value !== 1 ? 's' : ''} ago`;
}

/** Very small classname joiner so we don't need an extra dependency. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function detectDeviceType(userAgent: string | null): 'desktop' | 'tablet' | 'mobile' | 'unknown' {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad/.test(ua)) return 'tablet';
  if (/mobile|iphone|android/.test(ua)) return 'mobile';
  return 'desktop';
}
