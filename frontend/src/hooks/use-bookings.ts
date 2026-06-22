import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cancelBooking, createBooking, getBooking, listBookings } from '../api/bookings';
import { queryKeys } from '../api/query-keys';

import type { Booking, CreateBookingRequest } from '../api/bookings';
import type { ApiError } from '../api/client';

export const useBookingsQuery = () =>
  useQuery<Booking[], ApiError>({
    queryKey: queryKeys.bookings.all,
    queryFn: listBookings,
  });

export const useBookingQuery = (id: string | undefined) =>
  useQuery<Booking, ApiError>({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: id ? () => getBooking(id) : skipToken,
  });

export const useCreateBookingMutation = () => {
  const qc = useQueryClient();
  return useMutation<Booking, ApiError, CreateBookingRequest>({
    mutationFn: createBooking,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
      void qc.invalidateQueries({ queryKey: queryKeys.slots.all });
    },
  });
};

export const useCancelBookingMutation = () => {
  const qc = useQueryClient();
  return useMutation<Booking, ApiError, string>({
    mutationFn: cancelBooking,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
      void qc.invalidateQueries({ queryKey: queryKeys.slots.all });
    },
  });
};
