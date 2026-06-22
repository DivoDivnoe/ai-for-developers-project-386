import { api } from './client';

import type { components } from './schema';

export type AvailabilityInterval = components['schemas']['AvailabilityInterval'];
export type CreateAvailabilityIntervalRequest =
  components['schemas']['CreateAvailabilityIntervalRequest'];

export const listAvailability = async (): Promise<AvailabilityInterval[]> => {
  const res = await api.GET('/availability');
  if (res.error) throw res.error;
  return res.data;
};

export const createAvailability = async (
  body: CreateAvailabilityIntervalRequest,
): Promise<AvailabilityInterval> => {
  const res = await api.POST('/availability', { body });
  if (res.error) throw res.error;
  return res.data;
};

export const updateAvailability = async (
  id: string,
  body: CreateAvailabilityIntervalRequest,
): Promise<AvailabilityInterval> => {
  const res = await api.PUT('/availability/{id}', { params: { path: { id } }, body });
  if (res.error) throw res.error;
  return res.data;
};

export const removeAvailability = async (id: string): Promise<void> => {
  const res = await api.DELETE('/availability/{id}', { params: { path: { id } } });
  if (res.error) throw res.error;
  return res.data;
};
