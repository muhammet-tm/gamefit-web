import { test, expect } from '@playwright/test';

export const ROUTES = [
  '/', '/stats', '/features', '/leaderboard', '/research',
  '/roadmap', '/about', '/contact', '/beta', '/feedback', '/privacy',
];

for (const route of ROUTES) {
  test(`${route} renders with exactly one h1 and no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));

    const response = await page.goto(route);
    expect(response?.status(), `${route} should return 200`).toBe(200);

    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
    await expect(h1s.first()).not.toBeEmpty();

    expect(errors, `console errors on ${route}`).toEqual([]);
  });
}
