import { describe, it, expect } from 'vitest';

import { createApp } from '../../src/app.js';
import { createStore } from '../../src/store/store.js';

describe('GET /owner', () => {
  it('returns owner info', async () => {
    const app = createApp(createStore());
    const res = await app.request('/owner');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ name: 'Alex Petrov', email: 'alex@callbooking.demo' });
  });
});
