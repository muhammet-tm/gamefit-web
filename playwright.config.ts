import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },
  projects: [
    // csp.spec.ts starts its own header-applying server on a fixed port, so it
    // runs once in a dedicated single-worker project rather than twice in
    // parallel across the two browser projects.
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/csp.spec.ts',
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
      testIgnore: '**/csp.spec.ts',
    },
    {
      name: 'security',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/csp.spec.ts',
      fullyParallel: false,
    },
  ],
  webServer: {
    // Not `astro preview`: as of Astro 7 it daemonises when stdout is not a
    // TTY, exiting 0 immediately, which Playwright reads as "server died".
    // sirv serves the same dist/ output and stays in the foreground.
    // --dev disables sirv's boot-time file cache. Without it, a server kept
    // alive by reuseExistingServer keeps serving the previous build's asset
    // manifest and 404s the newly-hashed CSS and JS after a rebuild, which
    // shows up as a rare, unreproducible test failure.
    command: 'npm run build && npx sirv dist --port 4321 --dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
