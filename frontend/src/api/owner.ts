import { api } from './client';
import { unwrap } from './unwrap';

import type { components } from './schema';

type Owner = components['schemas']['Owner'];

export function getOwner(): Promise<Owner> {
  return unwrap<Owner>(api.GET('/owner'));
}
