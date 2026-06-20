import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../api/query-keys';
import { getSlots } from '../api/slots';

import type { ApiError } from '../api/client';
import type { MeetingDuration, Slot } from '../api/slots';

type SlotsParams = { date: string; duration: MeetingDuration };

export const useSlotsQuery = (params: SlotsParams) =>
  useQuery<Slot[], ApiError>({
    queryKey: queryKeys.slots.list(params),
    queryFn: () => getSlots(params),
  });
