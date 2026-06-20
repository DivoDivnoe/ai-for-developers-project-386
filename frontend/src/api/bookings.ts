import { api } from './client';

import type { components } from './schema';

type Booking = components['schemas']['Booking'];
type CreateBookingRequest = components['schemas']['CreateBookingRequest'];

export async function listBookings(): Promise<Booking[]> {
  const res = await api.GET('/bookings');
  if (res.error) throw res.error;
  return res.data;
}

export async function createBooking(body: CreateBookingRequest): Promise<Booking> {
  const res = await api.POST('/bookings', { body });
  if (res.error) throw res.error;
  return res.data;
}

export async function getBooking(id: string): Promise<Booking> {
  const res = await api.GET('/bookings/{id}', { params: { path: { id } } });
  if (res.error) throw res.error;
  return res.data;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const res = await api.DELETE('/bookings/{id}', { params: { path: { id } } });
  if (res.error) throw res.error;
  return res.data;
}
