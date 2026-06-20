import { api } from './client';
import { unwrap } from './unwrap';

import type { components } from './schema';

type Booking = components['schemas']['Booking'];
type CreateBookingRequest = components['schemas']['CreateBookingRequest'];

export function listBookings(): Promise<Booking[]> {
  return unwrap<Booking[]>(api.GET('/bookings'));
}

export function createBooking(body: CreateBookingRequest): Promise<Booking> {
  return unwrap<Booking>(api.POST('/bookings', { body }));
}

export function getBooking(id: string): Promise<Booking> {
  return unwrap<Booking>(api.GET('/bookings/{id}', { params: { path: { id } } }));
}

export function cancelBooking(id: string): Promise<Booking> {
  return unwrap<Booking>(api.DELETE('/bookings/{id}', { params: { path: { id } } }));
}
