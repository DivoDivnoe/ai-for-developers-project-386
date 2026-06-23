import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { generateSlots } from "../services/slots.js";
import { getSlotsQuery } from "../validation/schemas.js";

import type { AppVariables } from "../types.js";


const slotsRoute = new Hono<{ Variables: AppVariables }>();

slotsRoute.get("/", zValidator("query", getSlotsQuery), (c) => {
  const { date, duration } = c.req.valid("query");

  const slots = generateSlots({
    date,
    duration,
    availability: c.var.store.listAvailability(),
    exceptions: c.var.store.listExceptions(),
    bookings: c.var.store.listBookings(),
  });

  return c.json(slots);
});

export { slotsRoute };
