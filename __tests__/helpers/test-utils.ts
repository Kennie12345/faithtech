import { vi } from 'vitest';

/**
 * Waits for the specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a mock for the Next.js cookies() function
 */
export function createMockCookies(cookies: Record<string, string> = {}) {
  return {
    get: vi.fn((name: string) => ({
      name,
      value: cookies[name] || '',
    })),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn((name: string) => name in cookies),
    getAll: vi.fn(() =>
      Object.entries(cookies).map(([name, value]) => ({ name, value }))
    ),
  };
}

/**
 * Creates a mock for the Next.js headers() function
 */
export function createMockHeaders(headers: Record<string, string> = {}) {
  return {
    get: vi.fn((name: string) => headers[name.toLowerCase()] || null),
    has: vi.fn((name: string) => name.toLowerCase() in headers),
    entries: vi.fn(() => Object.entries(headers)),
    keys: vi.fn(() => Object.keys(headers)),
    values: vi.fn(() => Object.values(headers)),
    forEach: vi.fn(),
  };
}

/**
 * Creates a mock for the Next.js redirect() function
 */
export function createMockRedirect() {
  const mockRedirect = vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  });
  return mockRedirect;
}

/**
 * Creates a mock for the Next.js notFound() function
 */
export function createMockNotFound() {
  const mockNotFound = vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  });
  return mockNotFound;
}

/**
 * Helper to test that a function throws a redirect
 */
export function expectRedirect(fn: () => Promise<any>, expectedPath: string) {
  return expect(fn()).rejects.toThrow(`NEXT_REDIRECT: ${expectedPath}`);
}

/**
 * Helper to test that a function throws a notFound
 */
export function expectNotFound(fn: () => Promise<any>) {
  return expect(fn()).rejects.toThrow('NEXT_NOT_FOUND');
}

/**
 * Creates a FormData object from a plain object
 */
export function createFormData(data: Record<string, string | Blob>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

/**
 * Converts a Date to ISO string for comparison in tests
 */
export function toISOString(date: Date | string): string {
  return typeof date === 'string' ? date : date.toISOString();
}

/**
 * Creates a date in the future (relative to now)
 */
export function futureDate(daysFromNow: number = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

/**
 * Creates a date in the past (relative to now)
 */
export function pastDate(daysAgo: number = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

/**
 * Generates a random UUID for testing
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates a random slug for testing
 */
export function generateSlug(prefix: string = 'test'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}
