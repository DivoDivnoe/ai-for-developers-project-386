import { serve } from "@hono/node-server";

import { createApp } from "./app.js";
import { createStore } from "./store/store.js";

serve({ fetch: createApp(createStore()).fetch, port: 3000 });
