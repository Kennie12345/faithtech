/**
 * Slugify Utility
 *
 * Converts strings to URL-safe slugs for use in routing
 * Used by: Events, Projects, Blog Posts, Cities
 *
 * Examples:
 * - "Hello World" → "hello-world"
 * - "FaithTech Adelaide!" → "faithtech-adelaide"
 * - "Event: Web Dev Meetup 2024" → "event-web-dev-meetup-2024"
 */

/**
 * Convert a string to a URL-safe slug
 *
 * @param input - The string to slugify
 * @param options - Optional configuration
 * @returns URL-safe slug
 *
 * @example
 * slugify("Hello World!") // "hello-world"
 * slugify("FaithTech Adelaide: Web Dev Meetup") // "faithtech-adelaide-web-dev-meetup"
 * slugify("Event #1 - Testing & QA") // "event-1-testing-qa"
 */
export function slugify(
  input: string,
  options: {
    lowercase?: boolean;
    separator?: string;
    maxLength?: number;
  } = {}
): string {
  const {
    lowercase = true,
    separator = '-',
    maxLength = 100,
  } = options;

  let slug = input.trim();

  // Convert to lowercase
  if (lowercase) {
    slug = slug.toLowerCase();
  }

  // Replace accented characters with their base equivalents
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Remove apostrophes (don't → dont, it's → its)
  slug = slug.replace(/[']/g, '');

  // Replace non-alphanumeric characters (except hyphens) with separator
  slug = slug.replace(/[^a-z0-9-]+/gi, separator);

  // Remove consecutive separators
  const separatorRegex = new RegExp(`${separator}{2,}`, 'g');
  slug = slug.replace(separatorRegex, separator);

  // Remove leading and trailing separators
  slug = slug.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');

  // Truncate to max length (break at separator if possible)
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Try to break at last separator within maxLength
    const lastSeparatorIndex = slug.lastIndexOf(separator);
    if (lastSeparatorIndex > maxLength * 0.8) {
      slug = slug.substring(0, lastSeparatorIndex);
    }
  }

  return slug;
}

/**
 * Generate a unique slug by appending a number if needed
 *
 * @param baseSlug - The base slug to check
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug (baseSlug or baseSlug-2, baseSlug-3, etc.)
 *
 * @example
 * const existing = ['hello-world', 'hello-world-2'];
 * ensureUniqueSlug('hello-world', existing); // "hello-world-3"
 */
export function ensureUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  // If base slug doesn't exist, return it
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Try appending numbers until we find a unique slug
  let counter = 2;
  let candidateSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(candidateSlug)) {
    counter++;
    candidateSlug = `${baseSlug}-${counter}`;
  }

  return candidateSlug;
}

/**
 * Generate a unique slug by querying existing slugs from database
 * This is an async version that checks the database directly
 *
 * @param baseSlug - The base slug to check
 * @param checkExistence - Async function that checks if slug exists in DB
 * @returns Unique slug
 *
 * @example
 * async function checkEventSlug(slug: string) {
 *   const { data } = await supabase
 *     .from('events')
 *     .select('id')
 *     .eq('slug', slug)
 *     .single();
 *   return !!data;
 * }
 *
 * const uniqueSlug = await generateUniqueSlug('hello-world', checkEventSlug);
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkExistence: (slug: string) => Promise<boolean>
): Promise<string> {
  // Check if base slug is available
  const baseExists = await checkExistence(baseSlug);
  if (!baseExists) {
    return baseSlug;
  }

  // Try appending numbers until we find a unique slug
  let counter = 2;
  let candidateSlug = `${baseSlug}-${counter}`;

  while (await checkExistence(candidateSlug)) {
    counter++;
    candidateSlug = `${baseSlug}-${counter}`;

    // Safety: prevent infinite loops
    if (counter > 1000) {
      // Append timestamp as last resort
      candidateSlug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return candidateSlug;
}

/**
 * Validate if a string is a valid slug
 *
 * @param slug - The slug to validate
 * @returns True if valid slug format
 *
 * @example
 * isValidSlug('hello-world') // true
 * isValidSlug('hello world') // false (spaces)
 * isValidSlug('hello-world!') // false (special char)
 */
export function isValidSlug(slug: string): boolean {
  // Slug must contain only lowercase alphanumeric and hyphens
  // Cannot start or end with hyphen
  // Cannot contain consecutive hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Extract a slug from a full URL
 *
 * @param url - The URL to extract slug from
 * @returns The slug portion or null if not found
 *
 * @example
 * extractSlugFromUrl('/adelaide/events/web-dev-meetup') // 'web-dev-meetup'
 * extractSlugFromUrl('https://faithtech.au/blog/hello-world') // 'hello-world'
 */
export function extractSlugFromUrl(url: string): string | null {
  try {
    // Handle both full URLs and paths
    const pathParts = url.split('/').filter(Boolean);

    // Return last part as slug (assuming convention of /[citySlug]/[contentType]/[slug])
    return pathParts[pathParts.length - 1] || null;
  } catch {
    return null;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  slugify,
  ensureUniqueSlug,
  generateUniqueSlug,
  isValidSlug,
  extractSlugFromUrl,
};
