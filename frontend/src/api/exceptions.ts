import { api } from './client';

import type { components } from './schema';

type ScheduleException = components['schemas']['ScheduleException'];
type CreateScheduleExceptionRequest = components['schemas']['CreateScheduleExceptionRequest'];

export async function listExceptions(): Promise<ScheduleException[]> {
  const res = await api.GET('/exceptions');
  if (res.error) throw res.error;
  return res.data;
}

export async function createException(
  body: CreateScheduleExceptionRequest,
): Promise<ScheduleException> {
  const res = await api.POST('/exceptions', { body });
  if (res.error) throw res.error;
  return res.data;
}

export async function updateException(
  id: string,
  body: CreateScheduleExceptionRequest,
): Promise<ScheduleException> {
  const res = await api.PUT('/exceptions/{id}', { params: { path: { id } }, body });
  if (res.error) throw res.error;
  return res.data;
}

export async function removeException(id: string): Promise<void> {
  const res = await api.DELETE('/exceptions/{id}', { params: { path: { id } } });
  if (res.error) throw res.error;
  return res.data;
}
