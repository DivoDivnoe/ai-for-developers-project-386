import { useQuery } from '@tanstack/react-query';

import { getOwner } from '../api/owner';
import { queryKeys } from '../api/query-keys';

import type { ApiError } from '../api/client';
import type { Owner } from '../api/owner';

export const useOwnerQuery = () =>
  useQuery<Owner, ApiError>({
    queryKey: queryKeys.owner,
    queryFn: getOwner,
  });
