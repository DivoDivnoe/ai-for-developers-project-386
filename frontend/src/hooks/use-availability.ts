import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAvailability,
  listAvailability,
  removeAvailability,
  updateAvailability,
} from '../api/availability';
import { queryKeys } from '../api/query-keys';

import type { AvailabilityInterval, CreateAvailabilityIntervalRequest } from '../api/availability';
import type { ApiError } from '../api/client';

export const useAvailabilityQuery = () =>
  useQuery<AvailabilityInterval[], ApiError>({
    queryKey: queryKeys.availability,
    queryFn: listAvailability,
  });

export const useCreateAvailabilityMutation = () => {
  const qc = useQueryClient();
  return useMutation<AvailabilityInterval, ApiError, CreateAvailabilityIntervalRequest>({
    mutationFn: createAvailability,
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.availability }),
  });
};

export const useUpdateAvailabilityMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    AvailabilityInterval,
    ApiError,
    { id: string; body: CreateAvailabilityIntervalRequest }
  >({
    mutationFn: ({ id, body }) => updateAvailability(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.availability }),
  });
};

export const useRemoveAvailabilityMutation = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: removeAvailability,
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.availability }),
  });
};
