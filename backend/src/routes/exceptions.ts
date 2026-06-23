import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { notFound } from "../lib/errors.js";
import { uuidParam, createExceptionBody } from "../validation/schemas.js";

import type { AppVariables } from "../types.js";


const exceptionsRoute = new Hono<{ Variables: AppVariables }>();

exceptionsRoute.get("/", (c) => c.json(c.var.store.listExceptions()));

exceptionsRoute.post("/", zValidator("json", createExceptionBody), (c) => {
  const body = c.req.valid("json");
  const exception = { id: crypto.randomUUID(), ...body };
  c.var.store.createException(exception);
  return c.json(exception, 200);
});

exceptionsRoute.put(
  "/:id",
  zValidator("param", uuidParam),
  zValidator("json", createExceptionBody),
  (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const updated = c.var.store.updateException(id, { id, ...body });
    if (!updated) throw notFound("Schedule exception not found");
    return c.json(updated);
  },
);

exceptionsRoute.delete("/:id", zValidator("param", uuidParam), (c) => {
  const { id } = c.req.valid("param");
  if (!c.var.store.deleteException(id)) {
    throw notFound("Schedule exception not found");
  }
  return c.body(null, 204);
});

export { exceptionsRoute };
