import { api } from './client';
import { unwrap } from './unwrap';

import type { components } from './schema';

type HealthCheck = components['schemas']['HealthCheck'];

export function getHealth(): Promise<HealthCheck> {
  return unwrap<HealthCheck>(api.GET('/health'));
}
