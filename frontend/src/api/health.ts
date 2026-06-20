import { api } from './client';

import type { components } from './schema';

type HealthCheck = components['schemas']['HealthCheck'];

export async function getHealth(): Promise<HealthCheck> {
  const res = await api.GET('/health');
  if (res.error) throw res.error;
  return res.data;
}
