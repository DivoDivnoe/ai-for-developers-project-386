import { MONDAY, MONDAY_0900 } from './constants.js';

import type {
  AvailabilityIntervalRecord,
  BookingRecord,
  ScheduleExceptionRecord,
} from '../../src/store/types.js';

export const createTestAvailability = (
  overrides?: Partial<AvailabilityIntervalRecord>,
): AvailabilityIntervalRecord => ({
  id: crypto.randomUUID(),
  dayOfWeek: 'monday',
  startTime: '09:00',
  endTime: '17:00',
  ...overrides,
});

export const createTestException = (
  overrides?: Partial<ScheduleExceptionRecord>,
): ScheduleExceptionRecord => ({
  id: crypto.randomUUID(),
  startDate: MONDAY,
  endDate: MONDAY,
  startTime: '09:00',
  endTime: '17:00',
  ...overrides,
});

export const createTestBooking = (overrides?: Partial<BookingRecord>): BookingRecord => ({
  id: crypto.randomUUID(),
  startAt: MONDAY_0900,
  duration: 30,
  name: 'Test User',
  email: 'test@example.com',
  status: 'confirmed',
  createdAt: '2026-06-20T00:00:00.000Z',
  ...overrides,
});
