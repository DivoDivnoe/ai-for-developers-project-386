import { Hono } from "hono";

import { availabilityRoute } from "./routes/availability.js";
import { bookingsRoute } from "./routes/bookings.js";
import { exceptionsRoute } from "./routes/exceptions.js";
import { healthRoute } from "./routes/health.js";
import { ownerRoute } from "./routes/owner.js";
import { slotsRoute } from "./routes/slots.js";

import type { Store } from "./store/types.js";
import type { AppVariables } from "./types.js";


export const createApp = (store: Store): Hono<{ Variables: AppVariables }> => {
  const app = new Hono<{ Variables: AppVariables }>();

  app.use("*", async (c, next) => {
    c.set("store", store);
    await next();
  });

  app.route("/health", healthRoute);
  app.route("/owner", ownerRoute);
  app.route("/slots", slotsRoute);
  app.route("/bookings", bookingsRoute);
  app.route("/availability", availabilityRoute);
  app.route("/exceptions", exceptionsRoute);

  return app;
};
