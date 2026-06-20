import { api } from './client';
import { unwrap } from './unwrap';

import type { components } from './schema';

type Slot = components['schemas']['Slot'];
type MeetingDuration = components['schemas']['MeetingDuration'];

export function getSlots(query: { date: string; duration: MeetingDuration }): Promise<Slot[]> {
  return unwrap<Slot[]>(api.GET('/slots', { params: { query } }));
}
