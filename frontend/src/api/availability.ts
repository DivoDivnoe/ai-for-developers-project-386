import { api } from './client';
import { unwrap } from './unwrap';

import type { components } from './schema';

type AvailabilityInterval = components['schemas']['AvailabilityInterval'];
type CreateAvailabilityIntervalRequest = components['schemas']['CreateAvailabilityIntervalRequest'];

export function listAvailability(): Promise<AvailabilityInterval[]> {
  return unwrap<AvailabilityInterval[]>(api.GET('/availability'));
}

export function createAvailability(
  body: CreateAvailabilityIntervalRequest,
): Promise<AvailabilityInterval> {
  return unwrap<AvailabilityInterval>(api.POST('/availability', { body }));
}

export function updateAvailability(
  id: string,
  body: CreateAvailabilityIntervalRequest,
): Promise<AvailabilityInterval> {
  return unwrap<AvailabilityInterval>(
    api.PUT('/availability/{id}', { params: { path: { id } }, body }),
  );
}

export async function removeAvailability(id: string): Promise<void> {
  const { response } = await api.DELETE('/availability/{id}', { params: { path: { id } } });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
}
