import createClient from 'openapi-fetch';

import type { components, paths } from './schema';

export type ApiError = components['schemas']['ApiError'];

const baseUrl = import.meta.env.VITE_API_BASE_URL;
if (!baseUrl) {
  throw new Error('VITE_API_BASE_URL is not set; check frontend/.env');
}

export const api = createClient<paths>({ baseUrl });
