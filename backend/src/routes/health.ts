import { Hono } from "hono";

const healthRoute = new Hono();

healthRoute.get("/", (c) => c.json({ status: "ok" }));

export { healthRoute };
