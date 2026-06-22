import { useQuery } from '@tanstack/react-query';

import { getHealth } from '../api/health';
import { queryKeys } from '../api/query-keys';

import type { ApiError } from '../api/client';
import type { HealthCheck } from '../api/health';

export const useHealthQuery = () =>
  useQuery<HealthCheck, ApiError>({
    queryKey: queryKeys.health,
    queryFn: getHealth,
  });
