import createClient from 'openapi-fetch';

import type { paths } from './schema';

// TODO(vite-step): перенести в import.meta.env.VITE_API_BASE_URL + прокси в vite.config.ts
export const api = createClient<paths>({ baseUrl: 'http://localhost:3000' });
