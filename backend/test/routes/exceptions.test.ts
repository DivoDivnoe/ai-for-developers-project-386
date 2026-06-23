import { describe, it, expect } from "vitest";

import { createApp } from "../../src/app.js";
import { createStore } from "../../src/store/store.js";
import { MONDAY } from "../helpers/constants.js";
import { createTestException } from "../helpers/factories.js";

describe("GET /exceptions", () => {
  it("returns empty array when no exceptions exist", async () => {
    const app = createApp(createStore());

    const res = await app.request("/exceptions");

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns all exceptions when records exist", async () => {
    const store = createStore();
    const e1 = createTestException();
    const e2 = createTestException();
    store.createException(e1);
    store.createException(e2);
    const app = createApp(store);

    const res = await app.request("/exceptions");

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body).toEqual([e1, e2]);
  });
});

describe("POST /exceptions", () => {
  it("creates a full-day exception when startTime and endTime are omitted", async () => {
    const app = createApp(createStore());

    const res = await app.request("/exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: MONDAY,
        endDate: MONDAY,
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.id).toBe("string");
    expect(body.id).toHaveLength(36);
    expect(body.startDate).toBe(MONDAY);
    expect(body.endDate).toBe(MONDAY);
    expect(body.startTime).toBeUndefined();
    expect(body.endTime).toBeUndefined();
  });

  it("creates a partial-day exception when startTime and endTime are provided", async () => {
    const app = createApp(createStore());

    const res = await app.request("/exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: MONDAY,
        endDate: MONDAY,
        startTime: "09:00",
        endTime: "17:00",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      startDate: MONDAY,
      endDate: MONDAY,
      startTime: "09:00",
      endTime: "17:00",
    });
  });

  it("includes reason in response when provided", async () => {
    const app = createApp(createStore());

    const res = await app.request("/exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: MONDAY,
        endDate: MONDAY,
        reason: "Holiday",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reason).toBe("Holiday");
  });

  it("returns 400 when endDate is before startDate", async () => {
    const app = createApp(createStore());

    const res = await app.request("/exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: MONDAY,
        endDate: "2026-06-21",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when endTime is not after startTime and both are specified", async () => {
    const app = createApp(createStore());

    const res = await app.request("/exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: MONDAY,
        endDate: MONDAY,
        startTime: "10:00",
        endTime: "09:00",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when startDate is missing", async () => {
    const app = createApp(createStore());

    const res = await app.request("/exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endDate: MONDAY,
      }),
    });

    expect(res.status).toBe(400);
  });
});

describe("PUT /exceptions/:id", () => {
  it("updates an existing exception", async () => {
    const store = createStore();
    const e = createTestException({ reason: "Original reason" });
    store.createException(e);
    const app = createApp(store);

    const res = await app.request(`/exceptions/${e.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: MONDAY,
        endDate: MONDAY,
        reason: "Updated reason",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      id: e.id,
      startDate: MONDAY,
      endDate: MONDAY,
      reason: "Updated reason",
    });
  });

  it("returns 404 when exception is not found", async () => {
    const app = createApp(createStore());

    const res = await app.request(
      "/exceptions/00000000-0000-0000-0000-000000000000",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: MONDAY,
          endDate: MONDAY,
        }),
      },
    );

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid body even when id exists", async () => {
    const store = createStore();
    const e = createTestException();
    store.createException(e);
    const app = createApp(store);

    const res = await app.request(`/exceptions/${e.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endDate: MONDAY,
      }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid UUID in path param", async () => {
    const app = createApp(createStore());

    const res = await app.request("/exceptions/not-a-uuid", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: MONDAY,
        endDate: MONDAY,
      }),
    });

    expect(res.status).toBe(400);
  });
});

describe("DELETE /exceptions/:id", () => {
  it("deletes an exception and returns 204", async () => {
    const store = createStore();
    const e = createTestException();
    store.createException(e);
    const app = createApp(store);

    const res = await app.request(`/exceptions/${e.id}`, {
      method: "DELETE",
    });

    expect(res.status).toBe(204);
  });

  it("returns 404 when exception to delete is not found", async () => {
    const app = createApp(createStore());

    const res = await app.request(
      "/exceptions/00000000-0000-0000-0000-000000000000",
      { method: "DELETE" },
    );

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid UUID in delete path param", async () => {
    const app = createApp(createStore());

    const res = await app.request("/exceptions/not-a-uuid", {
      method: "DELETE",
    });

    expect(res.status).toBe(400);
  });
});

describe("exceptions round-trip", () => {
  it("DELETE removes the exception so GET no longer returns it", async () => {
    const store = createStore();
    const e1 = createTestException();
    const e2 = createTestException();
    store.createException(e1);
    store.createException(e2);
    const app = createApp(store);

    const deleteRes = await app.request(`/exceptions/${e1.id}`, {
      method: "DELETE",
    });
    expect(deleteRes.status).toBe(204);

    const getRes = await app.request("/exceptions");
    expect(getRes.status).toBe(200);
    const body = await getRes.json();
    expect(body).toEqual([e2]);
  });
});
