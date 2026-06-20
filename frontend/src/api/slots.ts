import { api } from './client';

import type { components } from './schema';

type Slot = components['schemas']['Slot'];
type MeetingDuration = components['schemas']['MeetingDuration'];

export async function getSlots(query: {
  date: string;
  duration: MeetingDuration;
}): Promise<Slot[]> {
  const res = await api.GET('/slots', { params: { query } });
  if (res.error) throw res.error;
  return res.data;
}
