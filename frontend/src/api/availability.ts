import { api } from './client';

import type { components } from './schema';

type AvailabilityInterval = components['schemas']['AvailabilityInterval'];
type CreateAvailabilityIntervalRequest = components['schemas']['CreateAvailabilityIntervalRequest'];

export async function listAvailability(): Promise<AvailabilityInterval[]> {
  const res = await api.GET('/availability');
  if (res.error) throw res.error;
  return res.data;
}

export async function createAvailability(
  body: CreateAvailabilityIntervalRequest,
): Promise<AvailabilityInterval> {
  const res = await api.POST('/availability', { body });
  if (res.error) throw res.error;
  return res.data;
}

export async function updateAvailability(
  id: string,
  body: CreateAvailabilityIntervalRequest,
): Promise<AvailabilityInterval> {
  const res = await api.PUT('/availability/{id}', { params: { path: { id } }, body });
  if (res.error) throw res.error;
  return res.data;
}

export async function removeAvailability(id: string): Promise<void> {
  const res = await api.DELETE('/availability/{id}', { params: { path: { id } } });
  if (res.error) throw res.error;
  return res.data;
}
