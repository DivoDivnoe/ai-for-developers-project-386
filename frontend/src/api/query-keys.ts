import type { MeetingDuration } from './slots';

type SlotsParams = { date: string; duration: MeetingDuration };

export const queryKeys = {
  health: ['health'] as const,
  owner: ['owner'] as const,
  availability: ['availability'] as const,
  exceptions: ['exceptions'] as const,
  bookings: {
    all: ['bookings'] as const,
    detail: (id: string) => ['bookings', id] as const,
  },
  slots: {
    all: ['slots'] as const,
    list: (params: SlotsParams) => ['slots', params] as const,
  },
} as const;
