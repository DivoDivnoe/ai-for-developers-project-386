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
}

export const generateSlots = (input: GenerateSlotsInput): Slot[] => {
  const { date, duration, availability, exceptions, bookings } = input;
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

  // Exception with times overrides regular availability
  const exceptionsWithTimes = applicableExceptions.filter(
    (e) => e.startTime && e.endTime,
  );

  let timeWindows: Array<{ startTime: string; endTime: string }>;

  if (exceptionsWithTimes.length > 0) {
    timeWindows = exceptionsWithTimes.map((e) => ({
      startTime: e.startTime!,
      endTime: e.endTime!,
    }));
  } else {
    timeWindows = availability
      .filter((a) => a.dayOfWeek === dayName)
      .map((a) => ({ startTime: a.startTime, endTime: a.endTime }));
  }

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

  // Exclude slots that overlap with confirmed bookings
  // Overlap: A_start < B_end AND B_start < A_end
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed",
  );

  const availableSlots = allSlots.filter((slot) => {
    return !confirmedBookings.some((booking) => {
      const bookingEnd = addMinutes(
        parseISO(booking.startAt),
        booking.duration,
      ).toISOString();
      return slot.startAt < bookingEnd && booking.startAt < slot.endAt;
    });
  });

  availableSlots.sort((a, b) => a.startAt.localeCompare(b.startAt));

  return availableSlots;
};
