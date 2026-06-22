import { api } from './client';

import type { components } from './schema';

export type HealthCheck = components['schemas']['HealthCheck'];

export const getHealth = async (): Promise<HealthCheck> => {
  const res = await api.GET('/health');
  if (res.error) throw res.error;
  return res.data;
};
