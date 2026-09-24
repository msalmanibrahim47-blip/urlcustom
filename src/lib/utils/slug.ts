export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'project';
}

/**
 * Given a desired base slug and the set of slugs already in use, returns
 * a unique slug — appending -2, -3, ... as needed, matching the spec's
 * "abc-restaurant" -> "abc-restaurant-2" behavior.
 */
export function uniqueSlug(base: string, existing: Set<string>): string {
  let candidate = base;
  let counter = 2;
  while (existing.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}
