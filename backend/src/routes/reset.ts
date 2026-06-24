import { Hono } from 'hono';

import type { AppVariables } from '../types.js';

export const resetRoute = new Hono<{ Variables: AppVariables }>();

resetRoute.post('/', (c) => {
  if (process.env['NODE_ENV'] === 'production') {
    return c.json({ message: 'Not Found' }, 404);
  }
  c.var.store.reset();
  return c.json({ status: 'ok' });
});
