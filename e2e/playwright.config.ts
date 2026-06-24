import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: 'list',
  timeout: 15_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    reducedMotion: 'reduce',
  },
  webServer: [
    {
      command: 'pnpm -C ../backend dev',
      port: 3000,
      reuseExistingServer: !process.env['CI'],
      timeout: 10_000,
    },
    {
      command: 'pnpm -C ../frontend dev',
      port: 5173,
      reuseExistingServer: !process.env['CI'],
      timeout: 10_000,
    },
  ],
});
