import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createApp } from "../../src/app.js";
import { createStore } from "../../src/store/store.js";
import { MONDAY, MONDAY_0900, MONDAY_0930 } from "../helpers/constants.js";
import { createTestAvailability, createTestException } from "../helpers/factories.js";

describe("GET /slots", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-22T08:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns slots for valid request with seeded availability", async () => {
    const store = createStore();
    store.createAvailability(
      createTestAvailability({ startTime: "09:00", endTime: "10:00" }),
    );
    const app = createApp(store);

    const res = await app.request(`/slots?date=${MONDAY}&duration=30`);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body[0]).toEqual({
      startAt: MONDAY_0900,
      endAt: MONDAY_0930,
      duration: 30,
    });
    expect(body[1]).toEqual({
      startAt: MONDAY_0930,
      endAt: "2026-06-22T10:00:00.000Z",
      duration: 30,
    });
  });

  it("returns 400 when date query param is missing", async () => {
    const app = createApp(createStore());

    const res = await app.request("/slots?duration=30");

    expect(res.status).toBe(400);
  });

  it("returns 400 when duration query param is missing", async () => {
    const app = createApp(createStore());

    const res = await app.request(`/slots?date=${MONDAY}`);

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid duration value", async () => {
    const app = createApp(createStore());

    const res = await app.request(`/slots?date=${MONDAY}&duration=45`);

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid date format", async () => {
    const app = createApp(createStore());

    const res = await app.request("/slots?date=not-a-date&duration=30");

    expect(res.status).toBe(400);
  });

  it("returns empty array when no availability is configured", async () => {
    const app = createApp(createStore());

    const res = await app.request(`/slots?date=${MONDAY}&duration=30`);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns empty array when a full-day exception blocks the date", async () => {
    const store = createStore();
    store.createAvailability(createTestAvailability());
    store.createException(
      createTestException({ startTime: undefined, endTime: undefined }),
    );
    const app = createApp(store);

    const res = await app.request(`/slots?date=${MONDAY}&duration=30`);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });
});
