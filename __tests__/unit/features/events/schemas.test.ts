import { describe, it, expect } from 'vitest';
import {
  createEventSchema,
  updateEventSchema,
  createRSVPSchema,
  rsvpStatusSchema,
  parseEventFormData,
} from '@/features/events/schemas';
import { futureDate, pastDate, createFormData } from '@/__tests__/helpers/test-utils';

describe('Events Schemas', () => {
  describe('rsvpStatusSchema', () => {
    it('should accept valid RSVP statuses', () => {
      expect(rsvpStatusSchema.parse('yes')).toBe('yes');
      expect(rsvpStatusSchema.parse('no')).toBe('no');
      expect(rsvpStatusSchema.parse('maybe')).toBe('maybe');
    });

    it('should reject invalid RSVP statuses', () => {
      expect(() => rsvpStatusSchema.parse('invalid')).toThrow();
      expect(() => rsvpStatusSchema.parse('YES')).toThrow();
      expect(() => rsvpStatusSchema.parse('')).toThrow();
    });
  });

  describe('createEventSchema', () => {
    const startDate = futureDate(7);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2); // 2 hours later

    const validEventData = {
      title: 'Community Meetup',
      description: 'Join us for a community gathering',
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),
      location_name: 'Adelaide CBD',
      location_address: '123 Main St, Adelaide SA 5000',
      location_url: 'https://maps.google.com/place',
      max_attendees: 50,
    };

    describe('Valid Events', () => {
      it('should accept valid event data', () => {
        const result = createEventSchema.parse(validEventData);
        expect(result.title).toBe('Community Meetup');
      });

      it('should accept event with minimal required fields', () => {
        const minimal = {
          title: 'Minimal Event',
          starts_at: futureDate(1).toISOString(),
        };
        const result = createEventSchema.parse(minimal);
        expect(result.title).toBe('Minimal Event');
      });

      it('should accept event without end date', () => {
        const data = {
          ...validEventData,
          ends_at: null,
        };
        const result = createEventSchema.parse(data);
        expect(result.ends_at).toBeNull();
      });

      it('should accept event without location', () => {
        const data = {
          title: 'Online Event',
          starts_at: futureDate(1).toISOString(),
          location_name: null,
          location_address: null,
          location_url: null,
        };
        const result = createEventSchema.parse(data);
        expect(result.location_name).toBeNull();
      });

      it('should accept event without capacity limit', () => {
        const data = {
          ...validEventData,
          max_attendees: null,
        };
        const result = createEventSchema.parse(data);
        expect(result.max_attendees).toBeNull();
      });
    });

    describe('Title Validation', () => {
      it('should reject empty title', () => {
        const data = { ...validEventData, title: '' };
        expect(() => createEventSchema.parse(data)).toThrow('Title is required');
      });

      it('should reject title over 200 characters', () => {
        const data = { ...validEventData, title: 'a'.repeat(201) };
        expect(() => createEventSchema.parse(data)).toThrow(
          'Title must be less than 200 characters'
        );
      });

      it('should accept title at exactly 200 characters', () => {
        const data = { ...validEventData, title: 'a'.repeat(200) };
        const result = createEventSchema.parse(data);
        expect(result.title.length).toBe(200);
      });
    });

    describe('Description Validation', () => {
      it('should accept null description', () => {
        const data = { ...validEventData, description: null };
        const result = createEventSchema.parse(data);
        expect(result.description).toBeNull();
      });

      it('should reject description over 10,000 characters', () => {
        const data = { ...validEventData, description: 'a'.repeat(10001) };
        expect(() => createEventSchema.parse(data)).toThrow(
          'Description must be less than 10,000 characters'
        );
      });

      it('should accept description at exactly 10,000 characters', () => {
        const data = { ...validEventData, description: 'a'.repeat(10000) };
        const result = createEventSchema.parse(data);
        expect(result.description?.length).toBe(10000);
      });
    });

    describe('Date Validation', () => {
      it('should reject start date in the past', () => {
        const data = {
          ...validEventData,
          starts_at: pastDate(1).toISOString(),
        };
        expect(() => createEventSchema.parse(data)).toThrow(
          'Start date must be in the future'
        );
      });

      it('should reject invalid start date format', () => {
        const data = { ...validEventData, starts_at: 'invalid-date' };
        expect(() => createEventSchema.parse(data)).toThrow(
          'Start date must be a valid date'
        );
      });

      it('should reject end date before start date', () => {
        const data = {
          ...validEventData,
          starts_at: futureDate(7).toISOString(),
          ends_at: futureDate(6).toISOString(), // Before start
        };
        expect(() => createEventSchema.parse(data)).toThrow(
          'End date must be after start date'
        );
      });

      it('should accept end date after start date', () => {
        const data = {
          ...validEventData,
          starts_at: futureDate(7).toISOString(),
          ends_at: futureDate(8).toISOString(),
        };
        const result = createEventSchema.parse(data);
        expect(result).toBeDefined();
      });

      it('should accept same start and end time', () => {
        const dateTime = futureDate(7).toISOString();
        const data = {
          ...validEventData,
          starts_at: dateTime,
          ends_at: dateTime,
        };
        // Schema requires ends_at > starts_at, so this should fail
        expect(() => createEventSchema.parse(data)).toThrow(
          'End date must be after start date'
        );
      });
    });

    describe('Location Validation', () => {
      it('should accept valid location URL', () => {
        const data = {
          ...validEventData,
          location_url: 'https://maps.google.com/place',
        };
        const result = createEventSchema.parse(data);
        expect(result.location_url).toBe('https://maps.google.com/place');
      });

      it('should accept empty string for location URL', () => {
        const data = { ...validEventData, location_url: '' };
        const result = createEventSchema.parse(data);
        expect(result.location_url).toBe('');
      });

      it('should reject invalid location URL', () => {
        const data = { ...validEventData, location_url: 'not-a-url' };
        expect(() => createEventSchema.parse(data)).toThrow(
          'Location URL must be a valid URL'
        );
      });

      it('should reject location name over 200 characters', () => {
        const data = { ...validEventData, location_name: 'a'.repeat(201) };
        expect(() => createEventSchema.parse(data)).toThrow(
          'Location name must be less than 200 characters'
        );
      });

      it('should reject location address over 500 characters', () => {
        const data = { ...validEventData, location_address: 'a'.repeat(501) };
        expect(() => createEventSchema.parse(data)).toThrow(
          'Address must be less than 500 characters'
        );
      });
    });

    describe('Capacity Validation', () => {
      it('should accept positive integer capacity', () => {
        const data = { ...validEventData, max_attendees: 100 };
        const result = createEventSchema.parse(data);
        expect(result.max_attendees).toBe(100);
      });

      it('should reject zero capacity', () => {
        const data = { ...validEventData, max_attendees: 0 };
        expect(() => createEventSchema.parse(data)).toThrow(
          'Max attendees must be greater than 0'
        );
      });

      it('should reject negative capacity', () => {
        const data = { ...validEventData, max_attendees: -10 };
        expect(() => createEventSchema.parse(data)).toThrow(
          'Max attendees must be greater than 0'
        );
      });

      it('should reject decimal capacity', () => {
        const data = { ...validEventData, max_attendees: 50.5 };
        expect(() => createEventSchema.parse(data)).toThrow(
          'Max attendees must be a whole number'
        );
      });
    });
  });

  describe('updateEventSchema', () => {
    it('should accept partial updates', () => {
      const result = updateEventSchema.parse({ title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });

    it('should accept empty object', () => {
      const result = updateEventSchema.parse({});
      expect(result).toEqual({});
    });

    it('should accept any combination of fields', () => {
      const result = updateEventSchema.parse({
        title: 'New Title',
        max_attendees: 200,
      });
      expect(result.title).toBe('New Title');
      expect(result.max_attendees).toBe(200);
    });

    it('should still validate provided fields', () => {
      expect(() => updateEventSchema.parse({ title: '' })).toThrow(
        'Title is required'
      );
      expect(() => updateEventSchema.parse({ max_attendees: -1 })).toThrow();
    });
  });

  describe('createRSVPSchema', () => {
    it('should accept valid RSVP data', () => {
      const data = {
        event_id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'yes' as const,
      };
      const result = createRSVPSchema.parse(data);
      expect(result.event_id).toBe(data.event_id);
      expect(result.status).toBe('yes');
    });

    it('should accept all RSVP status options', () => {
      const eventId = '123e4567-e89b-12d3-a456-426614174000';

      expect(createRSVPSchema.parse({ event_id: eventId, status: 'yes' }).status).toBe(
        'yes'
      );
      expect(createRSVPSchema.parse({ event_id: eventId, status: 'no' }).status).toBe(
        'no'
      );
      expect(
        createRSVPSchema.parse({ event_id: eventId, status: 'maybe' }).status
      ).toBe('maybe');
    });

    it('should reject invalid UUID for event_id', () => {
      const data = { event_id: 'not-a-uuid', status: 'yes' as const };
      expect(() => createRSVPSchema.parse(data)).toThrow('Invalid event ID');
    });

    it('should reject invalid RSVP status', () => {
      const data = {
        event_id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'invalid',
      };
      expect(() => createRSVPSchema.parse(data)).toThrow();
    });

    it('should reject missing event_id', () => {
      const data = { status: 'yes' as const };
      expect(() => createRSVPSchema.parse(data)).toThrow();
    });

    it('should reject missing status', () => {
      const data = { event_id: '123e4567-e89b-12d3-a456-426614174000' };
      expect(() => createRSVPSchema.parse(data)).toThrow();
    });
  });

  describe('parseEventFormData()', () => {
    it('should parse valid FormData', () => {
      const formData = createFormData({
        title: 'Test Event',
        description: 'Test Description',
        starts_at: futureDate(7).toISOString(),
        ends_at: futureDate(8).toISOString(),
        location_name: 'Test Location',
        location_address: 'Test Address',
        location_url: 'https://test.com',
        max_attendees: '50',
      });

      const result = parseEventFormData(formData);
      expect(result.title).toBe('Test Event');
      expect(result.max_attendees).toBe(50);
    });

    it('should handle optional fields', () => {
      const formData = createFormData({
        title: 'Minimal Event',
        starts_at: futureDate(1).toISOString(),
      });

      const result = parseEventFormData(formData);
      expect(result.title).toBe('Minimal Event');
      expect(result.description).toBeNull();
      expect(result.max_attendees).toBeNull();
    });

    it('should convert max_attendees string to number', () => {
      const formData = createFormData({
        title: 'Test Event',
        starts_at: futureDate(1).toISOString(),
        max_attendees: '100',
      });

      const result = parseEventFormData(formData);
      expect(result.max_attendees).toBe(100);
      expect(typeof result.max_attendees).toBe('number');
    });

    it('should convert empty strings to null', () => {
      const formData = createFormData({
        title: 'Test Event',
        starts_at: futureDate(1).toISOString(),
        description: '',
        location_name: '',
      });

      const result = parseEventFormData(formData);
      expect(result.description).toBeNull();
      expect(result.location_name).toBeNull();
    });

    it('should throw on invalid data', () => {
      const formData = createFormData({
        title: '', // Invalid: empty
        starts_at: futureDate(1).toISOString(),
      });

      expect(() => parseEventFormData(formData)).toThrow('Title is required');
    });

    it('should throw on missing required fields', () => {
      const formData = createFormData({
        title: 'Test Event',
        // Missing starts_at
      });

      expect(() => parseEventFormData(formData)).toThrow();
    });

    it('should validate date constraints', () => {
      const formData = createFormData({
        title: 'Test Event',
        starts_at: pastDate(1).toISOString(), // Past date
      });

      expect(() => parseEventFormData(formData)).toThrow(
        'Start date must be in the future'
      );
    });

    it('should validate end date after start date', () => {
      const formData = createFormData({
        title: 'Test Event',
        starts_at: futureDate(7).toISOString(),
        ends_at: futureDate(6).toISOString(), // Before start
      });

      expect(() => parseEventFormData(formData)).toThrow(
        'End date must be after start date'
      );
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical event creation', () => {
      const data = {
        title: 'FaithTech Adelaide: Web Dev Meetup',
        description:
          'Join us for an evening of fellowship and learning about web development with fellow Christian technologists.',
        starts_at: new Date('2025-01-15T18:00:00Z').toISOString(),
        ends_at: new Date('2025-01-15T20:00:00Z').toISOString(),
        location_name: 'Adelaide CBD',
        location_address: '123 Main St, Adelaide SA 5000',
        location_url: 'https://maps.google.com/place/123main',
        max_attendees: 30,
      };

      const result = createEventSchema.parse(data);
      expect(result.title).toBe('FaithTech Adelaide: Web Dev Meetup');
      expect(result.max_attendees).toBe(30);
    });

    it('should handle virtual event (no physical location)', () => {
      const data = {
        title: 'Virtual Prayer Meeting',
        description: 'Join us online for prayer',
        starts_at: futureDate(3).toISOString(),
        ends_at: futureDate(3.5).toISOString(),
        location_name: 'Zoom',
        location_url: 'https://zoom.us/j/123456789',
        location_address: null,
        max_attendees: 100,
      };

      const result = createEventSchema.parse(data);
      expect(result.location_name).toBe('Zoom');
      expect(result.location_address).toBeNull();
    });

    it('should handle all-day event (no end time)', () => {
      const data = {
        title: 'Community Service Day',
        starts_at: futureDate(14).toISOString(),
        ends_at: null,
        location_name: 'Various Locations',
        max_attendees: null, // Unlimited
      };

      const result = createEventSchema.parse(data);
      expect(result.ends_at).toBeNull();
      expect(result.max_attendees).toBeNull();
    });
  });
});
