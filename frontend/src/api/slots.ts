import { api } from './client';

import type { components } from './schema';

export type Slot = components['schemas']['Slot'];
export type MeetingDuration = components['schemas']['MeetingDuration'];

export const getSlots = async (query: {
  date: string;
  duration: MeetingDuration;
}): Promise<Slot[]> => {
  const res = await api.GET('/slots', { params: { query } });
  if (res.error) throw res.error;
  return res.data;
};
