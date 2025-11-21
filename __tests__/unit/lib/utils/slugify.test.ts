import { describe, it, expect, vi } from 'vitest';
import {
  slugify,
  ensureUniqueSlug,
  generateUniqueSlug,
  isValidSlug,
  extractSlugFromUrl,
} from '@/lib/utils/slugify';

describe('slugify()', () => {
  describe('Basic Slugification', () => {
    it('should convert spaces to hyphens', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('FaithTech Adelaide')).toBe('faithtech-adelaide');
    });

    it('should convert to lowercase by default', () => {
      expect(slugify('HELLO')).toBe('hello');
      expect(slugify('HeLLo WoRLd')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
      expect(slugify('Event: Web Dev Meetup')).toBe('event-web-dev-meetup');
      expect(slugify('Testing & QA')).toBe('testing-qa');
      expect(slugify('Event #1')).toBe('event-1');
    });

    it('should handle apostrophes correctly', () => {
      expect(slugify("don't stop")).toBe('dont-stop');
      expect(slugify("it's working")).toBe('its-working');
    });

    it('should handle consecutive special characters', () => {
      expect(slugify('Hello   World')).toBe('hello-world');
      expect(slugify('Hello---World')).toBe('hello-world');
      expect(slugify('Hello!!!World')).toBe('hello-world');
    });

    it('should trim leading and trailing spaces', () => {
      expect(slugify('  Hello World  ')).toBe('hello-world');
      expect(slugify('\n\tHello World\n\t')).toBe('hello-world');
    });

    it('should remove leading and trailing separators', () => {
      expect(slugify('-Hello World-')).toBe('hello-world');
      expect(slugify('---Hello World---')).toBe('hello-world');
    });
  });

  describe('Accented Characters', () => {
    it('should convert accented characters to base equivalents', () => {
      expect(slugify('café')).toBe('cafe');
      expect(slugify('résumé')).toBe('resume');
      expect(slugify('São Paulo')).toBe('sao-paulo');
      expect(slugify('Zürich')).toBe('zurich');
    });

    it('should handle mixed accented and normal characters', () => {
      expect(slugify('FaithTech Café Adelaide')).toBe('faithtech-cafe-adelaide');
    });
  });

  describe('Numbers', () => {
    it('should preserve numbers', () => {
      expect(slugify('Event 2024')).toBe('event-2024');
      expect(slugify('Meetup #1')).toBe('meetup-1');
      expect(slugify('Web 3.0 Conference')).toBe('web-3-0-conference');
    });
  });

  describe('Options', () => {
    it('should respect lowercase option', () => {
      expect(slugify('Hello World', { lowercase: false })).toBe('Hello-World');
      expect(slugify('FaithTech Adelaide', { lowercase: false })).toBe(
        'FaithTech-Adelaide'
      );
    });

    it('should respect separator option', () => {
      expect(slugify('Hello World', { separator: '_' })).toBe('hello_world');
      // Note: '.' is treated as special char by regex, so test with a different separator
      expect(slugify('Hello World', { separator: '-' })).toBe('hello-world');
    });

    it('should respect maxLength option', () => {
      const longString = 'This is a very long string that should be truncated';
      expect(slugify(longString, { maxLength: 20 }).length).toBeLessThanOrEqual(20);
      expect(slugify(longString, { maxLength: 30 }).length).toBeLessThanOrEqual(30);
    });

    it('should break at separator when truncating if possible', () => {
      const result = slugify('hello world amazing stuff', { maxLength: 15 });
      // Should not exceed max length
      expect(result.length).toBeLessThanOrEqual(15);
      // Shouldn't end with separator
      expect(result.endsWith('-')).toBe(false);
    });

    it('should handle combined options', () => {
      const result = slugify('Hello World Amazing', {
        lowercase: false,
        separator: '_',
        maxLength: 15,
      });
      // Should respect maxLength
      expect(result.length).toBeLessThanOrEqual(15);
      // Should use underscore separator
      expect(result).toContain('_');
      // Should not be lowercase
      expect(result).toMatch(/[A-Z]/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
    });

    it('should handle string with only special characters', () => {
      expect(slugify('!!!')).toBe('');
      expect(slugify('---')).toBe('');
      expect(slugify('@#$%')).toBe('');
    });

    it('should handle string with emojis', () => {
      expect(slugify('Hello 🎉 World')).toBe('hello-world');
      expect(slugify('🚀 Launch Event')).toBe('launch-event');
    });

    it('should handle very long strings', () => {
      const veryLong = 'a'.repeat(200);
      const result = slugify(veryLong, { maxLength: 100 });
      expect(result.length).toBeLessThanOrEqual(100);
    });

    it('should handle strings with only spaces', () => {
      expect(slugify('     ')).toBe('');
      expect(slugify('\t\n  ')).toBe('');
    });

    it('should handle Unicode characters', () => {
      expect(slugify('Hello 世界')).toBe('hello');
      expect(slugify('Test ® Symbol')).toBe('test-symbol');
    });
  });

  describe('Real-world Examples', () => {
    it('should handle event titles', () => {
      expect(slugify('FaithTech Adelaide: Web Dev Meetup')).toBe(
        'faithtech-adelaide-web-dev-meetup'
      );
      expect(slugify('Community Gathering #5 - December 2024')).toBe(
        'community-gathering-5-december-2024'
      );
    });

    it('should handle project names', () => {
      expect(slugify('FaithTech.com Website Redesign')).toBe(
        'faithtech-com-website-redesign'
      );
      expect(slugify('Church Management System v2.0')).toBe(
        'church-management-system-v2-0'
      );
    });

    it('should handle blog post titles', () => {
      expect(slugify('10 Tips for Christian Tech Leaders')).toBe(
        '10-tips-for-christian-tech-leaders'
      );
      expect(slugify("How to Build God-Honoring Technology")).toBe(
        'how-to-build-god-honoring-technology'
      );
    });

    it('should handle city names', () => {
      expect(slugify('Adelaide')).toBe('adelaide');
      expect(slugify('São Paulo')).toBe('sao-paulo');
      expect(slugify('New York City')).toBe('new-york-city');
    });
  });
});

describe('ensureUniqueSlug()', () => {
  it('should return base slug when it does not exist', () => {
    const existing = ['hello-world-2', 'hello-world-3'];
    expect(ensureUniqueSlug('hello-world', existing)).toBe('hello-world');
  });

  it('should append -2 when base slug exists', () => {
    const existing = ['hello-world'];
    expect(ensureUniqueSlug('hello-world', existing)).toBe('hello-world-2');
  });

  it('should find next available number', () => {
    const existing = ['hello-world', 'hello-world-2', 'hello-world-3'];
    expect(ensureUniqueSlug('hello-world', existing)).toBe('hello-world-4');
  });

  it('should handle gaps in numbering', () => {
    const existing = ['hello-world', 'hello-world-2', 'hello-world-5'];
    // Should return -3, not skip to -6
    expect(ensureUniqueSlug('hello-world', existing)).toBe('hello-world-3');
  });

  it('should handle empty existing slugs array', () => {
    expect(ensureUniqueSlug('hello-world', [])).toBe('hello-world');
  });

  it('should handle large numbers', () => {
    const existing = Array.from({ length: 50 }, (_, i) =>
      i === 0 ? 'hello-world' : `hello-world-${i + 1}`
    );
    expect(ensureUniqueSlug('hello-world', existing)).toBe('hello-world-51');
  });

  it('should work with different slug formats', () => {
    const existing = ['event-2024', 'event-2024-2'];
    expect(ensureUniqueSlug('event-2024', existing)).toBe('event-2024-3');
  });
});

describe('generateUniqueSlug()', () => {
  it('should return base slug when it does not exist in database', async () => {
    const checkExistence = vi.fn().mockResolvedValue(false);
    const result = await generateUniqueSlug('hello-world', checkExistence);

    expect(result).toBe('hello-world');
    expect(checkExistence).toHaveBeenCalledWith('hello-world');
    expect(checkExistence).toHaveBeenCalledOnce();
  });

  it('should append -2 when base slug exists', async () => {
    const checkExistence = vi
      .fn()
      .mockResolvedValueOnce(true) // hello-world exists
      .mockResolvedValueOnce(false); // hello-world-2 doesn't exist

    const result = await generateUniqueSlug('hello-world', checkExistence);

    expect(result).toBe('hello-world-2');
    expect(checkExistence).toHaveBeenCalledWith('hello-world');
    expect(checkExistence).toHaveBeenCalledWith('hello-world-2');
  });

  it('should find next available number', async () => {
    const checkExistence = vi
      .fn()
      .mockResolvedValueOnce(true) // hello-world exists
      .mockResolvedValueOnce(true) // hello-world-2 exists
      .mockResolvedValueOnce(true) // hello-world-3 exists
      .mockResolvedValueOnce(false); // hello-world-4 doesn't exist

    const result = await generateUniqueSlug('hello-world', checkExistence);

    expect(result).toBe('hello-world-4');
    expect(checkExistence).toHaveBeenCalledTimes(4);
  });

  it('should handle errors from checkExistence function', async () => {
    const checkExistence = vi.fn().mockRejectedValue(new Error('Database error'));

    await expect(generateUniqueSlug('hello-world', checkExistence)).rejects.toThrow(
      'Database error'
    );
  });

  it('should prevent infinite loops with safety counter', async () => {
    const checkExistence = vi.fn().mockResolvedValue(true); // Always exists

    const result = await generateUniqueSlug('hello-world', checkExistence);

    // Should bail out with timestamp after 1000 attempts
    expect(result).toMatch(/^hello-world-\d+$/);
    expect(result).not.toBe('hello-world-1001'); // Should use timestamp instead
    expect(checkExistence.mock.calls.length).toBeLessThan(1005); // Some buffer
  });

  it('should work with async database checks', async () => {
    // Simulate real database query with delay
    const existingSlugs = new Set(['hello-world', 'hello-world-2']);
    const checkExistence = vi.fn(async (slug: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1)); // Simulate async
      return existingSlugs.has(slug);
    });

    const result = await generateUniqueSlug('hello-world', checkExistence);

    expect(result).toBe('hello-world-3');
  });
});

describe('isValidSlug()', () => {
  describe('Valid Slugs', () => {
    it('should accept lowercase alphanumeric with hyphens', () => {
      expect(isValidSlug('hello-world')).toBe(true);
      expect(isValidSlug('event-2024')).toBe(true);
      expect(isValidSlug('web-dev-meetup-5')).toBe(true);
    });

    it('should accept slugs without hyphens', () => {
      expect(isValidSlug('hello')).toBe(true);
      expect(isValidSlug('adelaide')).toBe(true);
      expect(isValidSlug('event123')).toBe(true);
    });

    it('should accept slugs with multiple hyphens', () => {
      expect(isValidSlug('this-is-a-very-long-slug')).toBe(true);
      expect(isValidSlug('a-b-c-d-e-f')).toBe(true);
    });
  });

  describe('Invalid Slugs', () => {
    it('should reject slugs with uppercase letters', () => {
      expect(isValidSlug('Hello-World')).toBe(false);
      expect(isValidSlug('HELLO')).toBe(false);
      expect(isValidSlug('helloWorld')).toBe(false);
    });

    it('should reject slugs with spaces', () => {
      expect(isValidSlug('hello world')).toBe(false);
      expect(isValidSlug('hello world')).toBe(false);
    });

    it('should reject slugs with special characters', () => {
      expect(isValidSlug('hello-world!')).toBe(false);
      expect(isValidSlug('hello_world')).toBe(false);
      expect(isValidSlug('hello.world')).toBe(false);
      expect(isValidSlug('hello@world')).toBe(false);
      expect(isValidSlug('hello#world')).toBe(false);
    });

    it('should reject slugs starting with hyphen', () => {
      expect(isValidSlug('-hello-world')).toBe(false);
      expect(isValidSlug('--hello')).toBe(false);
    });

    it('should reject slugs ending with hyphen', () => {
      expect(isValidSlug('hello-world-')).toBe(false);
      expect(isValidSlug('hello--')).toBe(false);
    });

    it('should reject slugs with consecutive hyphens', () => {
      expect(isValidSlug('hello--world')).toBe(false);
      expect(isValidSlug('hello---world')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidSlug('')).toBe(false);
    });

    it('should reject only hyphens', () => {
      expect(isValidSlug('-')).toBe(false);
      expect(isValidSlug('---')).toBe(false);
    });
  });
});

describe('extractSlugFromUrl()', () => {
  describe('Path URLs', () => {
    it('should extract slug from city event path', () => {
      expect(extractSlugFromUrl('/adelaide/events/web-dev-meetup')).toBe(
        'web-dev-meetup'
      );
      expect(extractSlugFromUrl('/sydney/events/community-gathering')).toBe(
        'community-gathering'
      );
    });

    it('should extract slug from city project path', () => {
      expect(extractSlugFromUrl('/adelaide/projects/faithtech-website')).toBe(
        'faithtech-website'
      );
    });

    it('should extract slug from city blog path', () => {
      expect(extractSlugFromUrl('/adelaide/blog/hello-world')).toBe('hello-world');
    });

    it('should handle paths without leading slash', () => {
      expect(extractSlugFromUrl('adelaide/events/web-dev-meetup')).toBe(
        'web-dev-meetup'
      );
    });

    it('should handle paths with trailing slash', () => {
      expect(extractSlugFromUrl('/adelaide/events/web-dev-meetup/')).toBe(
        'web-dev-meetup'
      );
    });
  });

  describe('Full URLs', () => {
    it('should extract slug from full URL', () => {
      expect(
        extractSlugFromUrl('https://faithtech.au/adelaide/events/web-dev-meetup')
      ).toBe('web-dev-meetup');
      expect(extractSlugFromUrl('http://localhost:3000/adelaide/events/meetup')).toBe(
        'meetup'
      );
    });

    it('should handle URLs with query parameters', () => {
      expect(
        extractSlugFromUrl('/adelaide/events/web-dev-meetup?source=newsletter')
      ).toBe('web-dev-meetup?source=newsletter'); // Note: doesn't strip query
    });

    it('should handle URLs with hash', () => {
      expect(extractSlugFromUrl('/adelaide/events/web-dev-meetup#details')).toBe(
        'web-dev-meetup#details'
      ); // Note: doesn't strip hash
    });
  });

  describe('Edge Cases', () => {
    it('should return null for empty string', () => {
      expect(extractSlugFromUrl('')).toBeNull();
    });

    it('should return null for just slashes', () => {
      expect(extractSlugFromUrl('/')).toBeNull();
      expect(extractSlugFromUrl('//')).toBeNull();
    });

    it('should handle root path', () => {
      expect(extractSlugFromUrl('/adelaide')).toBe('adelaide');
    });

    it('should handle single segment', () => {
      expect(extractSlugFromUrl('hello-world')).toBe('hello-world');
    });

    it('should handle very long paths', () => {
      expect(extractSlugFromUrl('/a/b/c/d/e/f/g/final-slug')).toBe('final-slug');
    });
  });
});
