import type { components } from "../../generated/schema.js";

export type BookingRecord = components["schemas"]["Booking"];
export type AvailabilityIntervalRecord = components["schemas"]["AvailabilityInterval"];
export type ScheduleExceptionRecord = components["schemas"]["ScheduleException"];
export type OwnerRecord = components["schemas"]["Owner"];

export interface Store {
  listBookings(): BookingRecord[];
  getBooking(id: string): BookingRecord | undefined;
  createBooking(booking: BookingRecord): void;
  updateBooking(id: string, booking: BookingRecord): BookingRecord | undefined;

  listAvailability(): AvailabilityIntervalRecord[];
  getAvailability(id: string): AvailabilityIntervalRecord | undefined;
  createAvailability(interval: AvailabilityIntervalRecord): void;
  updateAvailability(id: string, interval: AvailabilityIntervalRecord): AvailabilityIntervalRecord | undefined;
  deleteAvailability(id: string): boolean;

  listExceptions(): ScheduleExceptionRecord[];
  getException(id: string): ScheduleExceptionRecord | undefined;
  createException(exception: ScheduleExceptionRecord): void;
  updateException(id: string, exception: ScheduleExceptionRecord): ScheduleExceptionRecord | undefined;
  deleteException(id: string): boolean;

  getOwner(): OwnerRecord;
}
