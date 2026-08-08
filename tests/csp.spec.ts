import { test, expect } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { ROUTES } from './routes';

// vercel.json headers never apply locally, so without this the CSP would
// first be exercised in production. This serves the built output under the
// real policy and proves the site still works beneath it.
//
// The failure this guards against is specific and severe: Astro inlines its
// island hydration bootstrap, so a naive `script-src 'self'` blocks it and
// nothing on the page hydrates — while every other test, which runs without
// headers, stays green.

const PORT = 4322;
const BASE = `http://localhost:${PORT}`;

// One worker for this file. The server binds a fixed port, and parallel
// workers would each try to claim it.
test.describe.configure({ mode: 'serial' });

let server: ChildProcess;

test.beforeAll(async () => {
  server = spawn('node', ['scripts/serve-with-headers.mjs', String(PORT)], {
    stdio: 'pipe',
    shell: false,
  });
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server did not start')), 15000);
    server.stdout?.on('data', (d: Buffer) => {
      if (d.toString().includes('serve-with-headers')) {
        clearTimeout(timer);
        resolve();
      }
    });
    server.on('error', reject);
  });
});

test.afterAll(() => {
  server?.kill();
});

for (const route of ROUTES) {
  test(`${route} loads with no CSP violations`, async ({ page }) => {
    const violations: string[] = [];
    page.on('console', (m) => {
      const t = m.text();
      if (/content security policy|refused to (execute|load|apply)/i.test(t)) {
        violations.push(t.slice(0, 300));
      }
    });

    const res = await page.goto(`${BASE}${route}`);
    expect(res?.status()).toBe(200);
    await page.waitForTimeout(700);

    expect(violations, `CSP blocked something on ${route}`).toEqual([]);
  });
}

test('security headers are actually served', async ({ page }) => {
  const res = await page.goto(`${BASE}/`);
  const h = res!.headers();
  expect(h['content-security-policy']).toBeTruthy();
  expect(h['strict-transport-security']).toContain('max-age=');
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['content-security-policy']).not.toContain("script-src 'self' 'unsafe-inline'");
});

test('structured data survives the policy', async ({ page }) => {
  await page.goto(`${BASE}/`);
  const ld = await page.locator('script[type="application/ld+json"]').textContent();
  expect(ld).toBeTruthy();
  expect(() => JSON.parse(ld!)).not.toThrow();
});

test('the header script still runs under the policy', async ({ page }) => {
  await page.goto(`${BASE}/`);
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(400);
  const cls = await page.locator('header').getAttribute('class');
  expect(cls, 'header should gain its border class once scrolled').toContain('border-gf-border');
});

test('form islands still hydrate under the policy', async ({ page }) => {
  await page.goto(`${BASE}/beta`);
  await page.waitForTimeout(800);
  // Hydration is proven by client-side validation running: a bad email must
  // be rejected in the browser rather than submitted.
  await page.getByLabel('Email address').fill('not-an-email');
  await page.getByRole('button', { name: /join the waitlist/i }).click();
  await expect(page.getByText(/enter a valid email/i)).toBeVisible();
});
