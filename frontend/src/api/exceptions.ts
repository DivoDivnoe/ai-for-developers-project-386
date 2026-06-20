import { api } from './client';
import { unwrap } from './unwrap';

import type { components } from './schema';

type ScheduleException = components['schemas']['ScheduleException'];
type CreateScheduleExceptionRequest = components['schemas']['CreateScheduleExceptionRequest'];

export function listExceptions(): Promise<ScheduleException[]> {
  return unwrap<ScheduleException[]>(api.GET('/exceptions'));
}

export function createException(body: CreateScheduleExceptionRequest): Promise<ScheduleException> {
  return unwrap<ScheduleException>(api.POST('/exceptions', { body }));
}

export function updateException(
  id: string,
  body: CreateScheduleExceptionRequest,
): Promise<ScheduleException> {
  return unwrap<ScheduleException>(api.PUT('/exceptions/{id}', { params: { path: { id } }, body }));
}

export async function removeException(id: string): Promise<void> {
  const { response } = await api.DELETE('/exceptions/{id}', { params: { path: { id } } });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
}
