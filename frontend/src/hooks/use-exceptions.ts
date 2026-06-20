import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createException,
  listExceptions,
  removeException,
  updateException,
} from '../api/exceptions';
import { queryKeys } from '../api/query-keys';

import type { ApiError } from '../api/client';
import type { CreateScheduleExceptionRequest, ScheduleException } from '../api/exceptions';

export const useExceptionsQuery = () =>
  useQuery<ScheduleException[], ApiError>({
    queryKey: queryKeys.exceptions,
    queryFn: listExceptions,
  });

export const useCreateExceptionMutation = () => {
  const qc = useQueryClient();
  return useMutation<ScheduleException, ApiError, CreateScheduleExceptionRequest>({
    mutationFn: createException,
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.exceptions }),
  });
};

export const useUpdateExceptionMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    ScheduleException,
    ApiError,
    { id: string; body: CreateScheduleExceptionRequest }
  >({
    mutationFn: ({ id, body }) => updateException(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.exceptions }),
  });
};

export const useRemoveExceptionMutation = () => {
  const qc = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: removeException,
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.exceptions }),
  });
};
