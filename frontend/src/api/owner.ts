import { api } from './client';

import type { components } from './schema';

export type Owner = components['schemas']['Owner'];

export async function getOwner(): Promise<Owner> {
  const res = await api.GET('/owner');
  if (res.error) throw res.error;
  return res.data;
}
