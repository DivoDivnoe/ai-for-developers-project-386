import { parseISO } from "date-fns";

import { conflict } from "../lib/errors.js";

import { generateSlots } from "./slots.js";

import type { Store, BookingRecord } from "../store/types.js";


interface CreateBookingInput {
  startAt: string;
  duration: 15 | 30;
  name: string;
  email: string;
  comment?: string;
}

export const createBooking = (store: Store, input: CreateBookingInput): BookingRecord => {
  const { startAt, duration, name, email, comment } = input;

  // Reject bookings in the past
  if (parseISO(startAt) <= new Date()) {
    throw conflict("Cannot book a slot in the past");
  }

  // Verify the requested time falls within available slots
  const dateStr = startAt.slice(0, 10);
  const availableSlots = generateSlots({
    date: dateStr,
    duration,
    availability: store.listAvailability(),
    exceptions: store.listExceptions(),
    bookings: store.listBookings(),
  });

  if (!availableSlots.some((slot) => slot.startAt === startAt)) {
    throw conflict("This time slot is not available");
  }

  const booking: BookingRecord = {
    id: crypto.randomUUID(),
    startAt,
    duration,
    name,
    email,
    ...(comment !== undefined && { comment }),
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  store.createBooking(booking);
  return booking;
};
