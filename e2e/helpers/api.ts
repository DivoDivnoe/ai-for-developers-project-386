import type { APIRequestContext } from '@playwright/test';

const API_BASE = `http://localhost:${process.env['PORT'] || 3000}`;

export const seedAvailability = async (
  request: APIRequestContext,
  overrides?: Record<string, unknown>,
) => {
  const body = {
    dayOfWeek: 'monday',
    startTime: '09:00',
    endTime: '17:00',
    ...overrides,
  };
  const res = await request.post(`${API_BASE}/availability`, { data: body });
  return res.json();
};

export const seedException = async (
  request: APIRequestContext,
  overrides?: Record<string, unknown>,
) => {
  const body = {
    startDate: '2026-06-29',
    endDate: '2026-06-29',
    ...overrides,
  };
  const res = await request.post(`${API_BASE}/exceptions`, { data: body });
  return res.json();
};

export const seedBooking = async (
  request: APIRequestContext,
  overrides?: Record<string, unknown>,
) => {
  const body = {
    startAt: '2026-06-29T09:00:00.000Z',
    duration: 30,
    name: 'Seed User',
    email: 'seed@example.com',
    ...overrides,
  };
  const res = await request.post(`${API_BASE}/bookings`, { data: body });
  return res.json();
};

export const resetStore = async (request: APIRequestContext) => {
  await request.post(`${API_BASE}/__test/reset`);
};
