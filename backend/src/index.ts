import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import { createApp } from './app.js';
import { createStore } from './store/store.js';

const apiApp = createApp(createStore());

const app = new Hono();

app.route('/api', apiApp);

app.get('/health', (c) => c.json({ status: 'ok' }));

if (process.env['NODE_ENV'] === 'production') {
  const distPath = '/app/frontend/dist';

  app.get('*', serveStatic({ root: distPath }));
  app.get('*', serveStatic({ root: distPath, path: 'index.html' }));
}

serve({ fetch: app.fetch, port: Number(process.env['PORT']) || 3000 });
