import { api } from './client';

import type { components } from './schema';

export type ScheduleException = components['schemas']['ScheduleException'];
export type CreateScheduleExceptionRequest =
  components['schemas']['CreateScheduleExceptionRequest'];

export const listExceptions = async (): Promise<ScheduleException[]> => {
  const res = await api.GET('/exceptions');
  if (res.error) throw res.error;
  return res.data;
};

export const createException = async (
  body: CreateScheduleExceptionRequest,
): Promise<ScheduleException> => {
  const res = await api.POST('/exceptions', { body });
  if (res.error) throw res.error;
  return res.data;
};

export const updateException = async (
  id: string,
  body: CreateScheduleExceptionRequest,
): Promise<ScheduleException> => {
  const res = await api.PUT('/exceptions/{id}', { params: { path: { id } }, body });
  if (res.error) throw res.error;
  return res.data;
};

export const removeException = async (id: string): Promise<void> => {
  const res = await api.DELETE('/exceptions/{id}', { params: { path: { id } } });
  if (res.error) throw res.error;
  return res.data;
};
