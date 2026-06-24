import { Hono } from 'hono';

import type { AppVariables } from '../types.js';

const ownerRoute = new Hono<{ Variables: AppVariables }>();

ownerRoute.get('/', (c) => c.json(c.var.store.getOwner()));

export { ownerRoute };
