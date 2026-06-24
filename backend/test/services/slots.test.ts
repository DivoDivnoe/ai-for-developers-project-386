import { describe, it, expect } from 'vitest';

import { generateSlots } from '../../src/services/slots.js';
import { MONDAY, TUESDAY, MONDAY_0900, MONDAY_0930 } from '../helpers/constants.js';
import {
  createTestAvailability,
  createTestException,
  createTestBooking,
} from '../helpers/factories.js';

// Use a date well before test dates so test slots are treated as "future"
const FAR_PAST = new Date('2020-01-01');

describe('generateSlots', () => {
  // 1
  it('returns empty array when there is no availability', () => {
    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability: [],
      exceptions: [],
      bookings: [],
      now: FAR_PAST,
    });

    expect(result).toEqual([]);
  });

  // 2
  it('generates slots from a single availability window on a matching day', () => {
    const availability = [createTestAvailability({ endTime: '10:00' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings: [],
      now: FAR_PAST,
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ duration: 30 });
    expect(result[1]).toMatchObject({ duration: 30 });
  });

  // 3
  it('returns empty array when availability is for a different day of the week', () => {
    const availability = [createTestAvailability({ dayOfWeek: 'tuesday' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings: [],
      now: FAR_PAST,
    });

    expect(result).toEqual([]);
  });

  // 4
  it('generates correct number of slots for 15-minute duration', () => {
    const availability = [createTestAvailability({ endTime: '09:45' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 15,
      availability,
      exceptions: [],
      bookings: [],
      now: FAR_PAST,
    });

    expect(result).toHaveLength(3);
  });

  // 5
  it('generates slots from multiple availability windows on the same day', () => {
    const availability = [
      createTestAvailability({ endTime: '10:00' }),
      createTestAvailability({ startTime: '14:00', endTime: '15:00' }),
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings: [],
      now: FAR_PAST,
    });

    // 09:00-10:00 → 2 slots, 14:00-15:00 → 2 slots
    expect(result).toHaveLength(4);
    expect(result[0].startAt).toContain('T09:00');
    expect(result[2].startAt).toContain('T14:00');
  });

  // 6
  it('sorts slots by startAt when windows are provided out of order', () => {
    const availability = [
      createTestAvailability({ startTime: '14:00', endTime: '15:00' }),
      createTestAvailability({ startTime: '08:00', endTime: '09:00' }),
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings: [],
      now: FAR_PAST,
    });

    expect(result[0].startAt).toContain('T08:00');
    expect(result[result.length - 1].startAt).toContain('T14:30');
  });

  // 7
  it('returns empty array when a full-day exception blocks the date', () => {
    const availability = [createTestAvailability()];
    const exceptions = [createTestException({ startTime: undefined, endTime: undefined })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    expect(result).toEqual([]);
  });

  // 8 — Partial exception subtracts from regular availability
  it('subtracts partial exception time window from regular availability', () => {
    const availability = [createTestAvailability()]; // 09:00–17:00
    const exceptions = [createTestException({ startTime: '10:00', endTime: '14:00' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    // 09:00–10:00 → 2 slots, 14:00–17:00 → 6 slots
    expect(result).toHaveLength(8);
    expect(result[0].startAt).toContain('T09:00');
    expect(result[1].startAt).toContain('T09:30');
    expect(result[2].startAt).toContain('T14:00');
    expect(result[result.length - 1].endAt).toContain('T17:00');
  });

  // 9 — Partial exceptions without availability produce no slots
  it('returns empty when partial exceptions exist but there is no availability', () => {
    const exceptions = [
      createTestException({ startTime: '10:00', endTime: '11:00' }),
      createTestException({ startTime: '14:00', endTime: '15:00' }),
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability: [],
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    // No availability → nothing to subtract from
    expect(result).toEqual([]);
  });

  // 10
  it('ignores exception when date is outside its range', () => {
    const availability = [createTestAvailability({ endTime: '10:00' })];
    const exceptions = [createTestException({ startDate: TUESDAY, endDate: TUESDAY })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    // Regular Monday availability is used
    expect(result).toHaveLength(2);
  });

  // 11 — Exception subtracts from availability when date equals startDate
  it('subtracts exception window when date equals startDate (and endDate is later)', () => {
    const availability = [createTestAvailability()];
    const exceptions = [
      createTestException({ endDate: '2026-06-26', startTime: '10:00', endTime: '12:00' }),
    ];

    const result = generateSlots({
      date: MONDAY, // equals startDate (default), before endDate
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    // 09:00–10:00 → 2 slots, 12:00–17:00 → 10 slots
    expect(result).toHaveLength(12);
    expect(result[0].startAt).toContain('T09:00');
    expect(result[1].startAt).toContain('T09:30');
    expect(result[2].startAt).toContain('T12:00');
  });

  // 12 — Exception subtracts from availability in multi-day range
  it('subtracts exception window when date falls in the middle of a multi-day range', () => {
    const availability = [createTestAvailability()];
    const exceptions = [
      createTestException({
        startDate: '2026-06-21',
        endDate: '2026-06-23',
        startTime: '10:00',
        endTime: '12:00',
      }),
    ];

    const result = generateSlots({
      date: MONDAY, // 2026-06-22
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    // 09:00–10:00 → 2 slots, 12:00–17:00 → 10 slots
    expect(result).toHaveLength(12);
  });

  // 13
  it('returns empty array when all slots are covered by confirmed bookings', () => {
    const availability = [createTestAvailability({ endTime: '10:00' })]; // 2 slots
    const bookings = [
      createTestBooking({ startAt: MONDAY_0900 }),
      createTestBooking({ startAt: MONDAY_0930 }),
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings,
      now: FAR_PAST,
    });

    expect(result).toEqual([]);
  });

  // 14
  it('returns only free slots when some are booked', () => {
    const availability = [createTestAvailability({ endTime: '10:00' })]; // 2 slots
    const bookings = [createTestBooking()]; // books 09:00–09:30

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings,
      now: FAR_PAST,
    });

    expect(result).toHaveLength(1);
    expect(result[0].startAt).toContain('T09:30');
  });

  // 15
  it('does not block slots for cancelled bookings', () => {
    const availability = [createTestAvailability({ endTime: '09:30' })]; // 1 slot
    const bookings = [createTestBooking({ status: 'cancelled' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings,
      now: FAR_PAST,
    });

    expect(result).toHaveLength(1);
  });

  // 16
  it('excludes slot when booking exactly matches its time', () => {
    const availability = [createTestAvailability({ endTime: '09:30' })]; // 1 slot: 09:00–09:30
    const bookings = [createTestBooking()]; // 09:00–09:30

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings,
      now: FAR_PAST,
    });

    expect(result).toEqual([]);
  });

  // 17
  it('excludes slot when booking starts before and ends inside it', () => {
    const availability = [createTestAvailability({ endTime: '09:30' })]; // 1 slot: 09:00–09:30
    const bookings = [
      createTestBooking({
        startAt: '2026-06-22T08:50:00.000Z', // 08:50–09:20
        duration: 30,
      }),
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings,
      now: FAR_PAST,
    });

    expect(result).toEqual([]);
  });

  // 18
  it('excludes slot when booking starts inside and ends after it', () => {
    const availability = [createTestAvailability({ endTime: '09:30' })]; // 1 slot: 09:00–09:30
    const bookings = [
      createTestBooking({
        startAt: '2026-06-22T09:15:00.000Z', // 09:15–09:45
        duration: 30,
      }),
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings,
      now: FAR_PAST,
    });

    expect(result).toEqual([]);
  });

  // 19
  it('excludes slot when booking fully covers it (superset)', () => {
    const availability = [createTestAvailability({ endTime: '10:00' })]; // 15-min slots: 09:00, 09:15, 09:30, 09:45
    const bookings = [
      createTestBooking({
        startAt: '2026-06-22T08:55:00.000Z', // 08:55–09:25, fully covers 09:00–09:15
        duration: 30,
      }),
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 15,
      availability,
      exceptions: [],
      bookings,
      now: FAR_PAST,
    });

    // 09:00–09:15 excluded, 09:15–09:30 partially overlapped (excluded),
    // 09:30–09:45, 09:45–10:00 free
    expect(result).toHaveLength(2);
    expect(result[0].startAt).toContain('T09:30');
    expect(result[1].startAt).toContain('T09:45');
  });

  // 20
  it('does not exclude adjacent slot (zero-width gap)', () => {
    const availability = [createTestAvailability({ endTime: '10:00' })]; // 2 slots: 09:00, 09:30
    const bookings = [createTestBooking()]; // 09:00–09:30

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings,
      now: FAR_PAST,
    });

    expect(result).toHaveLength(1);
    expect(result[0].startAt).toContain('T09:30');
  });

  // 21
  it('does not generate a slot that would exceed the window boundary', () => {
    const availability = [createTestAvailability({ endTime: '09:45' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings: [],
      now: FAR_PAST,
    });

    // Only 09:00–09:30 fits; 09:30–10:00 would exceed 09:45
    expect(result).toHaveLength(1);
  });

  // 22
  it('returns empty when a blocking exception coexists with a partial exception', () => {
    const availability = [createTestAvailability()];
    const exceptions = [
      createTestException({ startTime: undefined, endTime: undefined }),
      createTestException({ startTime: '10:00', endTime: '12:00' }),
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    expect(result).toEqual([]);
  });

  // 23 — Deduplicate slots from overlapping time windows
  it('deduplicates slots when availability windows overlap', () => {
    const availability = [
      createTestAvailability({ startTime: '09:00', endTime: '10:00' }),
      createTestAvailability({ startTime: '09:30', endTime: '10:30' }),
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings: [],
      now: FAR_PAST,
    });

    // Without dedup: 09:00, 09:30 (dup), 10:00. With dedup: 09:00, 09:30, 10:00
    expect(result).toHaveLength(3);
  });

  // 24 — Multiple bookings overlapping the same slot
  it('excludes a slot when multiple confirmed bookings overlap different parts of the same slot', () => {
    const availability = [createTestAvailability({ endTime: '11:00' })]; // 4 × 30-min slots
    const bookings = [
      createTestBooking({ startAt: '2026-06-22T09:10:00.000Z', duration: 15 }), // 09:10–09:25
      createTestBooking({ startAt: '2026-06-22T09:15:00.000Z', duration: 15 }), // 09:15–09:30
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings,
      now: FAR_PAST,
    });

    // Both bookings overlap 09:00–09:30. Remaining slots: 09:30, 10:00, 10:30
    expect(result).toHaveLength(3);
    expect(result[0].startAt).toContain('T09:30');
  });

  // 25 — Cross-duration: 15-min booking blocks 30-min slot
  it('excludes a 30-minute slot when a 15-minute confirmed booking overlaps it', () => {
    const availability = [createTestAvailability({ endTime: '10:00' })]; // 2 × 30-min slots
    const bookings = [
      createTestBooking({ startAt: MONDAY_0900, duration: 15 }), // 09:00–09:15
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings,
      now: FAR_PAST,
    });

    // 09:00–09:30 excluded, 09:30–10:00 free
    expect(result).toHaveLength(1);
    expect(result[0].startAt).toContain('T09:30');
  });

  // 26 — Cross-duration: 30-min booking blocks multiple 15-min slots
  it('excludes multiple 15-minute slots when a 30-minute confirmed booking spans them', () => {
    const availability = [createTestAvailability({ endTime: '10:00' })]; // 4 × 15-min slots
    const bookings = [
      createTestBooking({ startAt: MONDAY_0900, duration: 30 }), // 09:00–09:30
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 15,
      availability,
      exceptions: [],
      bookings,
      now: FAR_PAST,
    });

    // 09:00–09:15 and 09:15–09:30 excluded, 09:30–09:45 and 09:45–10:00 free
    expect(result).toHaveLength(2);
    expect(result[0].startAt).toContain('T09:30');
    expect(result[1].startAt).toContain('T09:45');
  });

  // 27 — Booking strictly inside slot, no boundary alignment
  it('excludes a slot when a booking is strictly inside it', () => {
    const availability = [createTestAvailability({ endTime: '10:00' })]; // 30-min slots
    const bookings = [
      createTestBooking({
        startAt: '2026-06-22T09:10:00.000Z',
        duration: 15, // 09:10–09:25, strictly inside 09:00–09:30
      }),
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings,
      now: FAR_PAST,
    });

    // 09:00–09:30 excluded, 09:30–10:00 free
    expect(result).toHaveLength(1);
    expect(result[0].startAt).toContain('T09:30');
  });

  // 28 — Exception subtracts when date equals endDate
  it('subtracts exception window when date equals endDate', () => {
    const availability = [createTestAvailability()];
    const exceptions = [
      createTestException({
        startDate: '2026-06-10',
        endDate: MONDAY,
        startTime: '10:00',
        endTime: '12:00',
      }),
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    // 09:00–10:00 → 2 slots, 12:00–17:00 → 10 slots
    expect(result).toHaveLength(12);
  });

  // 29 — Asymmetric exception times (only startTime)
  it('treats exception with only startTime as a full-day block', () => {
    const availability = [createTestAvailability()];
    const exceptions = [createTestException({ startTime: '10:00', endTime: undefined })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    expect(result).toEqual([]);
  });

  // 30 — Window shorter than one slot duration
  it('returns empty array when the time window is shorter than the slot duration', () => {
    const availability = [createTestAvailability({ endTime: '09:15' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings: [],
      now: FAR_PAST,
    });

    // 09:00 + 30 = 09:30 > 09:15, so no slot fits
    expect(result).toEqual([]);
  });

  // 31 — Asymmetric exception times (only endTime, symmetric to #29)
  it('treats exception with only endTime as a full-day block', () => {
    const availability = [createTestAvailability()];
    const exceptions = [createTestException({ startTime: undefined, endTime: '12:00' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    expect(result).toEqual([]);
  });

  // 32 — Partial exception without availability produces no slots
  it('returns empty when partial exceptions overlap but there is no availability', () => {
    const exceptions = [
      createTestException({ startTime: '09:00', endTime: '10:30' }),
      createTestException({ startTime: '09:30', endTime: '11:00' }),
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability: [],
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    // No availability → nothing to subtract from
    expect(result).toEqual([]);
  });

  // --- New tests: Bug 1 — past slot filtering ---

  // 33
  it('filters out slots that start before now', () => {
    const availability = [createTestAvailability({ endTime: '10:00' })]; // 2 slots: 09:00, 09:30

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings: [],
      now: new Date('2026-06-22T09:15:00.000Z'),
    });

    // 09:00–09:30 is past (starts before 09:15), only 09:30–10:00 remains
    expect(result).toHaveLength(1);
    expect(result[0].startAt).toContain('T09:30');
  });

  // 34
  it('keeps slot that starts exactly at now', () => {
    const availability = [createTestAvailability({ endTime: '10:00' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings: [],
      now: new Date('2026-06-22T09:00:00.000Z'),
    });

    // 09:00 equals now — should be kept
    expect(result[0].startAt).toContain('T09:00');
  });

  // 35
  it('returns empty when all slots are in the past', () => {
    const availability = [createTestAvailability({ endTime: '10:00' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions: [],
      bookings: [],
      now: new Date('2026-06-22T11:00:00.000Z'),
    });

    expect(result).toEqual([]);
  });

  // --- New tests: Bug 2 — interval subtraction edge cases ---

  // 36
  it('subtracts exception in the middle of an availability window', () => {
    const availability = [createTestAvailability({ startTime: '09:00', endTime: '17:00' })];
    const exceptions = [createTestException({ startTime: '12:00', endTime: '13:00' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    // 09:00–12:00 → 6 slots, 13:00–17:00 → 8 slots
    expect(result).toHaveLength(14);
    expect(result[0].startAt).toContain('T09:00');
    expect(result[5].startAt).toContain('T11:30');
    expect(result[6].startAt).toContain('T13:00');
    expect(result[result.length - 1].endAt).toContain('T17:00');
  });

  // 37
  it('subtracts exception at the start of an availability window', () => {
    const availability = [createTestAvailability({ startTime: '09:00', endTime: '12:00' })];
    const exceptions = [createTestException({ startTime: '09:00', endTime: '10:00' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    // Only 10:00–12:00 → 4 slots
    expect(result).toHaveLength(4);
    expect(result[0].startAt).toContain('T10:00');
  });

  // 38
  it('subtracts exception at the end of an availability window', () => {
    const availability = [createTestAvailability({ startTime: '09:00', endTime: '12:00' })];
    const exceptions = [createTestException({ startTime: '11:00', endTime: '12:00' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    // Only 09:00–11:00 → 4 slots
    expect(result).toHaveLength(4);
    expect(result[result.length - 1].endAt).toContain('T11:00');
  });

  // 39
  it('subtracts exception that fully covers availability window', () => {
    const availability = [createTestAvailability({ startTime: '10:00', endTime: '11:00' })];
    const exceptions = [createTestException({ startTime: '09:00', endTime: '17:00' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    expect(result).toEqual([]);
  });

  // 40
  it('subtracts multiple non-overlapping exceptions from the same day', () => {
    const availability = [createTestAvailability({ startTime: '09:00', endTime: '17:00' })];
    const exceptions = [
      createTestException({ startTime: '10:00', endTime: '11:00' }),
      createTestException({ startTime: '14:00', endTime: '15:00' }),
    ];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    // 09:00–10:00 → 2 slots, 11:00–14:00 → 6 slots, 15:00–17:00 → 4 slots
    expect(result).toHaveLength(12);
  });

  // 41
  it('subtracts exception that overlaps multiple availability windows', () => {
    const availability = [
      createTestAvailability({ startTime: '09:00', endTime: '12:00' }),
      createTestAvailability({ startTime: '13:00', endTime: '17:00' }),
    ];
    const exceptions = [createTestException({ startTime: '11:00', endTime: '14:00' })];

    const result = generateSlots({
      date: MONDAY,
      duration: 30,
      availability,
      exceptions,
      bookings: [],
      now: FAR_PAST,
    });

    // 09:00–11:00 → 4 slots, 14:00–17:00 → 6 slots
    expect(result).toHaveLength(10);
  });
});
