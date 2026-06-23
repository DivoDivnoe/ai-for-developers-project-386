import { describe, it, expect } from "vitest";

import { createApp } from "../../src/app.js";
import { createStore } from "../../src/store/store.js";
import { createTestAvailability } from "../helpers/factories.js";

describe("GET /availability", () => {
  it("returns empty array when no availability intervals exist", async () => {
    const app = createApp(createStore());

    const res = await app.request("/availability");

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns all availability intervals when records exist", async () => {
    const store = createStore();
    const a1 = createTestAvailability();
    const a2 = createTestAvailability();
    store.createAvailability(a1);
    store.createAvailability(a2);
    const app = createApp(store);

    const res = await app.request("/availability");

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body).toEqual([a1, a2]);
  });
});

describe("POST /availability", () => {
  it("creates an availability interval with valid input", async () => {
    const app = createApp(createStore());

    const res = await app.request("/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: "monday",
        startTime: "09:00",
        endTime: "17:00",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      dayOfWeek: "monday",
      startTime: "09:00",
      endTime: "17:00",
    });
    expect(typeof body.id).toBe("string");
    expect(body.id).toHaveLength(36);
  });

  it("returns 400 when dayOfWeek is missing", async () => {
    const app = createApp(createStore());

    const res = await app.request("/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: "09:00",
        endTime: "17:00",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid dayOfWeek value", async () => {
    const app = createApp(createStore());

    const res = await app.request("/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: "notaday",
        startTime: "09:00",
        endTime: "17:00",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when endTime is not after startTime", async () => {
    const app = createApp(createStore());

    const res = await app.request("/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: "monday",
        startTime: "10:00",
        endTime: "09:00",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when startTime is missing", async () => {
    const app = createApp(createStore());

    const res = await app.request("/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: "monday",
        endTime: "17:00",
      }),
    });

    expect(res.status).toBe(400);
  });
});

describe("PUT /availability/:id", () => {
  it("updates an existing availability interval", async () => {
    const store = createStore();
    const a = createTestAvailability({ startTime: "09:00", endTime: "17:00" });
    store.createAvailability(a);
    const app = createApp(store);

    const res = await app.request(`/availability/${a.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: "tuesday",
        startTime: "10:00",
        endTime: "18:00",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      id: a.id,
      dayOfWeek: "tuesday",
      startTime: "10:00",
      endTime: "18:00",
    });
  });

  it("returns 404 when availability interval is not found", async () => {
    const app = createApp(createStore());

    const res = await app.request(
      "/availability/00000000-0000-0000-0000-000000000000",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: "monday",
          startTime: "09:00",
          endTime: "17:00",
        }),
      },
    );

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid body even when id exists", async () => {
    const store = createStore();
    const a = createTestAvailability();
    store.createAvailability(a);
    const app = createApp(store);

    const res = await app.request(`/availability/${a.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: "09:00",
        endTime: "17:00",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid UUID in path param", async () => {
    const app = createApp(createStore());

    const res = await app.request("/availability/not-a-uuid", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: "monday",
        startTime: "09:00",
        endTime: "17:00",
      }),
    });

    expect(res.status).toBe(400);
  });
});

describe("DELETE /availability/:id", () => {
  it("deletes an availability interval and returns 204", async () => {
    const store = createStore();
    const a = createTestAvailability();
    store.createAvailability(a);
    const app = createApp(store);

    const res = await app.request(`/availability/${a.id}`, {
      method: "DELETE",
    });

    expect(res.status).toBe(204);
  });

  it("returns 404 when availability interval to delete is not found", async () => {
    const app = createApp(createStore());

    const res = await app.request(
      "/availability/00000000-0000-0000-0000-000000000000",
      { method: "DELETE" },
    );

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid UUID in delete path param", async () => {
    const app = createApp(createStore());

    const res = await app.request("/availability/not-a-uuid", {
      method: "DELETE",
    });

    expect(res.status).toBe(400);
  });
});

describe("availability round-trip", () => {
  it("DELETE removes the interval so GET no longer returns it", async () => {
    const store = createStore();
    const a1 = createTestAvailability();
    const a2 = createTestAvailability();
    store.createAvailability(a1);
    store.createAvailability(a2);
    const app = createApp(store);

    const deleteRes = await app.request(`/availability/${a1.id}`, {
      method: "DELETE",
    });
    expect(deleteRes.status).toBe(204);

    const getRes = await app.request("/availability");
    expect(getRes.status).toBe(200);
    const body = await getRes.json();
    expect(body).toEqual([a2]);
  });
});
