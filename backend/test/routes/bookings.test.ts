import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { createApp } from '../../src/app.js';
import { createStore } from '../../src/store/store.js';
import { MONDAY, MONDAY_0900, PAST_DATE } from '../helpers/constants.js';
import { createTestAvailability, createTestBooking } from '../helpers/factories.js';

describe('GET /bookings', () => {
  it('returns empty array when no bookings exist', async () => {
    const app = createApp(createStore());

    const res = await app.request('/bookings');

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it('returns all bookings when records exist', async () => {
    const store = createStore();
    const b1 = createTestBooking();
    const b2 = createTestBooking();
    store.createBooking(b1);
    store.createBooking(b2);
    const app = createApp(store);

    const res = await app.request('/bookings');

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body).toEqual([b1, b2]);
  });
});

describe('POST /bookings', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(MONDAY));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a booking with valid input and seeded availability', async () => {
    const store = createStore();
    store.createAvailability(createTestAvailability());
    const app = createApp(store);

    const res = await app.request('/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startAt: MONDAY_0900,
        duration: 30,
        name: 'Alice',
        email: 'alice@example.com',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      startAt: MONDAY_0900,
      duration: 30,
      name: 'Alice',
      email: 'alice@example.com',
      status: 'confirmed',
    });
    expect(typeof body.id).toBe('string');
    expect(body.id).toHaveLength(36); // UUID
  });

  it('includes comment in response when provided', async () => {
    const store = createStore();
    store.createAvailability(createTestAvailability());
    const app = createApp(store);

    const res = await app.request('/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startAt: MONDAY_0900,
        duration: 30,
        name: 'Bob',
        email: 'bob@example.com',
        comment: 'Need projector',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.comment).toBe('Need projector');
  });

  it('returns 400 when email is missing', async () => {
    const app = createApp(createStore());

    const res = await app.request('/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startAt: MONDAY_0900,
        duration: 30,
        name: 'Alice',
      }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid startAt format', async () => {
    const app = createApp(createStore());

    const res = await app.request('/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startAt: 'not-a-date',
        duration: 30,
        name: 'Alice',
        email: 'alice@example.com',
      }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 409 when booking is in the past', async () => {
    const store = createStore();
    store.createAvailability(createTestAvailability());
    const app = createApp(store);

    const res = await app.request('/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startAt: PAST_DATE,
        duration: 30,
        name: 'Alice',
        email: 'alice@example.com',
      }),
    });

    expect(res.status).toBe(409);
  });

  it('returns 409 when no slots are available for the requested time', async () => {
    const app = createApp(createStore());

    const res = await app.request('/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startAt: MONDAY_0900,
        duration: 30,
        name: 'Alice',
        email: 'alice@example.com',
      }),
    });

    expect(res.status).toBe(409);
  });
});

describe('GET /bookings/:id', () => {
  it('returns the booking when found', async () => {
    const store = createStore();
    const booking = createTestBooking();
    store.createBooking(booking);
    const app = createApp(store);

    const res = await app.request(`/bookings/${booking.id}`);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(booking);
  });

  it('returns 404 when booking is not found', async () => {
    const app = createApp(createStore());

    const res = await app.request('/bookings/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid UUID in path param', async () => {
    const app = createApp(createStore());

    const res = await app.request('/bookings/not-a-uuid');

    expect(res.status).toBe(400);
  });
});

describe('DELETE /bookings/:id', () => {
  it('cancels the booking and returns it with status cancelled', async () => {
    const store = createStore();
    const booking = createTestBooking();
    store.createBooking(booking);
    const app = createApp(store);

    const res = await app.request(`/bookings/${booking.id}`, {
      method: 'DELETE',
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      ...booking,
      status: 'cancelled',
    });
  });

  it('returns 404 when booking to cancel is not found', async () => {
    const app = createApp(createStore());

    const res = await app.request('/bookings/00000000-0000-0000-0000-000000000000', {
      method: 'DELETE',
    });

    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid UUID in delete path param', async () => {
    const app = createApp(createStore());

    const res = await app.request('/bookings/not-a-uuid', { method: 'DELETE' });

    expect(res.status).toBe(400);
  });
});

describe('bookings round-trip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(MONDAY));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('POST then GET /bookings includes the created booking', async () => {
    const store = createStore();
    store.createAvailability(createTestAvailability());
    const app = createApp(store);

    const postRes = await app.request('/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startAt: MONDAY_0900,
        duration: 30,
        name: 'Charlie',
        email: 'charlie@example.com',
      }),
    });
    expect(postRes.status).toBe(200);
    const created = await postRes.json();

    const getRes = await app.request('/bookings');
    expect(getRes.status).toBe(200);
    const all = await getRes.json();
    expect(all).toEqual([created]);
  });
});
