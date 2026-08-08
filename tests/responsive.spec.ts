import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { ROUTES } from './routes';

// Horizontal overflow is the most common responsive defect and the least
// likely to be noticed on a desktop: one element wider than the viewport and
// the whole page scrolls sideways on a phone.

const WIDTHS = [375, 768, 1440];

for (const width of WIDTHS) {
  for (const route of ROUTES) {
    test(`${route} does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await page.waitForTimeout(300);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(
        scrollWidth,
        `${route} is ${scrollWidth - clientWidth}px wider than the ${width}px viewport`
      ).toBeLessThanOrEqual(clientWidth + 1);
    });
  }
}

// Budgets from DESIGN.md §10. Measured against the built output rather than
// network traffic, so the number does not depend on which assets a particular
// page happened to request.
test('the build stays inside its asset budgets', () => {
  const dir = 'dist/_astro';
  let js = 0;
  let css = 0;

  for (const file of readdirSync(dir)) {
    const size = gzipSync(readFileSync(join(dir, file))).length;
    if (file.endsWith('.js')) js += size;
    if (file.endsWith('.css')) css += size;
  }

  const jsKb = js / 1024;
  const cssKb = css / 1024;

  expect(jsKb, `JavaScript is ${jsKb.toFixed(1)} KB gzipped, budget is 30 KB`).toBeLessThan(30);
  expect(cssKb, `CSS is ${cssKb.toFixed(1)} KB gzipped, budget is 20 KB`).toBeLessThan(20);
});

test('images declare their dimensions so nothing shifts on load', async ({ page }) => {
  await page.goto('/features');
  const undimensioned = await page.$$eval('img', (imgs) =>
    imgs
      .filter((i) => !i.getAttribute('width') || !i.getAttribute('height'))
      .map((i) => i.getAttribute('src') ?? '(no src)')
  );
  expect(undimensioned, 'every img needs width and height to prevent layout shift').toEqual([]);
});
