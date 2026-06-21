import { api } from './client';

import type { components } from './schema';

export type Booking = components['schemas']['Booking'];
export type CreateBookingRequest = components['schemas']['CreateBookingRequest'];

export const listBookings = async (): Promise<Booking[]> => {
  const res = await api.GET('/bookings');
  if (res.error) throw res.error;
  return res.data;
};

export const createBooking = async (body: CreateBookingRequest): Promise<Booking> => {
  const res = await api.POST('/bookings', { body });
  if (res.error) throw res.error;
  return res.data;
};

export const getBooking = async (id: string): Promise<Booking> => {
  const res = await api.GET('/bookings/{id}', { params: { path: { id } } });
  if (res.error) throw res.error;
  return res.data;
};

export const cancelBooking = async (id: string): Promise<Booking> => {
  const res = await api.DELETE('/bookings/{id}', { params: { path: { id } } });
  if (res.error) throw res.error;
  return res.data;
};
