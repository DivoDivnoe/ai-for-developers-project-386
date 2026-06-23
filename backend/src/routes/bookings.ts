import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";


import { notFound } from "../lib/errors.js";
import { createBooking } from "../services/booking.js";
import { uuidParam, createBookingBody } from "../validation/schemas.js";

import type { AppVariables } from "../types.js";

const bookingsRoute = new Hono<{ Variables: AppVariables }>();

bookingsRoute.get("/", (c) => c.json(c.var.store.listBookings()));

bookingsRoute.post("/", zValidator("json", createBookingBody), (c) => {
  const body = c.req.valid("json");
  const booking = createBooking(c.var.store, body);
  return c.json(booking, 200);
});

bookingsRoute.get("/:id", zValidator("param", uuidParam), (c) => {
  const { id } = c.req.valid("param");
  const booking = c.var.store.getBooking(id);
  if (!booking) throw notFound("Booking not found");
  return c.json(booking);
});

bookingsRoute.delete("/:id", zValidator("param", uuidParam), (c) => {
  const { id } = c.req.valid("param");
  const booking = c.var.store.getBooking(id);
  if (!booking) throw notFound("Booking not found");
  const cancelled = { ...booking, status: "cancelled" as const };
  c.var.store.updateBooking(id, cancelled);
  return c.json(cancelled);
});

export { bookingsRoute };
