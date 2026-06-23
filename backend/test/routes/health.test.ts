import { describe, it, expect } from "vitest";
import { createApp } from "../../src/app.js";
import { createStore } from "../../src/store/store.js";

describe("GET /health", () => {
  it("returns status ok", async () => {
    const app = createApp(createStore());
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
  });
});
