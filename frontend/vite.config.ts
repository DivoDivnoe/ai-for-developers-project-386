import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const DEV_PORT = 5173;
const MOCK_PORT = 4010;
const MOCK_TARGET = `http://localhost:${MOCK_PORT}`;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: DEV_PORT,
    proxy: {
      '/api': {
        target: MOCK_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
  },
});
