// Screenshot the header and footer lockup at desktop and mobile widths.
// node scripts/shot-logo.mjs <baseURL> <outDir>
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const base = process.argv[2] || 'http://localhost:4321';
const out = process.argv[3] || 'logo-shots';
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();

for (const [label, width, height] of [['desktop', 1280, 800], ['mobile', 375, 812]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(400);

  await page.locator('header').screenshot({ path: path.join(out, `header-${label}.png`) });
  console.log('wrote', `header-${label}.png`);

  // `.last()`: a card in the page body also uses <footer>, so a bare locator
  // is ambiguous under Playwright's strict mode. The site footer is last.
  const siteFooter = page.locator('footer').last();
  await siteFooter.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await siteFooter.screenshot({ path: path.join(out, `footer-${label}.png`) });
  console.log('wrote', `footer-${label}.png`);

  await page.close();
}

await browser.close();
