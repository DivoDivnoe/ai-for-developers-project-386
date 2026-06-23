import { parseISO, getDay, parse, addMinutes } from "date-fns";

import type { components } from "../../generated/schema.js";
import type {
  AvailabilityIntervalRecord,
  ScheduleExceptionRecord,
  BookingRecord,
} from "../store/types.js";

type Slot = components["schemas"]["Slot"];

// JS getDay() returns 0=Sunday..6=Saturday
const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

interface GenerateSlotsInput {
  date: string;
  duration: 15 | 30;
  availability: AvailabilityIntervalRecord[];
  exceptions: ScheduleExceptionRecord[];
  bookings: BookingRecord[];
  now?: Date;
}

interface TimeWindow {
  startTime: string;
  endTime: string;
}

// Subtract one time window from another on the same date.
// Returns the remaining intervals (0, 1, or 2 pieces).
const subtractWindow = (
  window: TimeWindow,
  subStart: string,
  subEnd: string,
  baseDate: Date,
): TimeWindow[] => {
  const wStart = parse(window.startTime, "HH:mm", baseDate);
  const wEnd = parse(window.endTime, "HH:mm", baseDate);
  const sStart = parse(subStart, "HH:mm", baseDate);
  const sEnd = parse(subEnd, "HH:mm", baseDate);

  // No overlap
  if (sEnd <= wStart || sStart >= wEnd) return [window];

  // Sub fully covers window → nothing left
  if (sStart <= wStart && sEnd >= wEnd) return [];

  // Gap on the left: [wStart, sStart]
  const left: TimeWindow | null =
    sStart > wStart
      ? { startTime: window.startTime, endTime: subStart }
      : null;

  // Gap on the right: [sEnd, wEnd]
  const right: TimeWindow | null =
    sEnd < wEnd
      ? { startTime: subEnd, endTime: window.endTime }
      : null;

  return [left, right].filter((v): v is TimeWindow => v !== null);
};

export const generateSlots = (input: GenerateSlotsInput): Slot[] => {
  const { date, duration, availability, exceptions, bookings, now = new Date() } = input;
  const targetDate = parseISO(date);
  const dayName = DAY_NAMES[getDay(targetDate)];

  // ISO date strings (YYYY-MM-DD) are lexicographically comparable
  const applicableExceptions = exceptions.filter(
    (e) => e.startDate <= date && date <= e.endDate,
  );

  // Exception with no times blocks the entire day
  const hasBlockingException = applicableExceptions.some(
    (e) => !e.startTime || !e.endTime,
  );
  if (hasBlockingException) return [];

  // Start with regular availability windows for this day
  const availabilityWindows: TimeWindow[] = availability
    .filter((a) => a.dayOfWeek === dayName)
    .map((a) => ({ startTime: a.startTime, endTime: a.endTime }));

  // Partial exceptions (with both times) subtract from availability
  const exceptionsWithTimes = applicableExceptions.filter(
    (e) => e.startTime && e.endTime,
  );

  const timeWindows =
    exceptionsWithTimes.length > 0
      ? exceptionsWithTimes.reduce<TimeWindow[]>(
          (windows, ex) =>
            windows.flatMap((w) =>
              subtractWindow(w, ex.startTime!, ex.endTime!, targetDate),
            ),
          availabilityWindows,
        )
      : availabilityWindows;

  // Generate all possible slots within each time window
  const allSlots: Slot[] = [];

  for (const window of timeWindows) {
    let current = parse(window.startTime, "HH:mm", targetDate);
    const windowEnd = parse(window.endTime, "HH:mm", targetDate);

    while (addMinutes(current, duration) <= windowEnd) {
      const slotEnd = addMinutes(current, duration);
      allSlots.push({
        startAt: current.toISOString(),
        endAt: slotEnd.toISOString(),
        duration,
      });
      current = addMinutes(current, duration);
    }
  }

  // Deduplicate slots by startAt (overlapping time windows can produce duplicates)
  const uniqueSlots = [
    ...new Map(allSlots.map((s) => [s.startAt, s])).values(),
  ];

  // Exclude slots that overlap with confirmed bookings
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed",
  );

  const availableSlots = uniqueSlots.filter((slot) => {
    return !confirmedBookings.some((booking) => {
      const bookingEnd = addMinutes(
        parseISO(booking.startAt),
        booking.duration,
      ).toISOString();
      return slot.startAt < bookingEnd && booking.startAt < slot.endAt;
    });
  });

  // Exclude slots in the past
  const futureSlots = availableSlots.filter(
    (slot) => slot.startAt >= now.toISOString(),
  );

  futureSlots.sort((a, b) => a.startAt.localeCompare(b.startAt));

  return futureSlots;
};
