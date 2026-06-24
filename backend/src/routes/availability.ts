import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { notFound } from '../lib/errors.js';
import { uuidParam, createAvailabilityBody } from '../validation/schemas.js';

import type { AppVariables } from '../types.js';

const availabilityRoute = new Hono<{ Variables: AppVariables }>();

availabilityRoute.get('/', (c) => c.json(c.var.store.listAvailability()));

availabilityRoute.post('/', zValidator('json', createAvailabilityBody), (c) => {
  const body = c.req.valid('json');
  const interval = { id: crypto.randomUUID(), ...body };
  c.var.store.createAvailability(interval);
  return c.json(interval, 200);
});

availabilityRoute.put(
  '/:id',
  zValidator('param', uuidParam),
  zValidator('json', createAvailabilityBody),
  (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const updated = c.var.store.updateAvailability(id, { id, ...body });
    if (!updated) throw notFound('Availability interval not found');
    return c.json(updated);
  },
);

availabilityRoute.delete('/:id', zValidator('param', uuidParam), (c) => {
  const { id } = c.req.valid('param');
  if (!c.var.store.deleteAvailability(id)) {
    throw notFound('Availability interval not found');
  }
  return c.body(null, 204);
});

export { availabilityRoute };
