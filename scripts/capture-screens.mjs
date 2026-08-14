/**
 * Capture the product screenshots this site embeds.
 *
 * These images used to be produced by hand, which meant that every time the
 * app's design changed the site quietly went stale — and it did: after the
 * 2026-08 palette swap the site showed a lime phone on a navy page. This
 * script exists so regenerating them is one command.
 *
 * Reads the QA credentials from the APP repo's .env.local; nothing is stored
 * here. Run the app's dev server first, then:
 *
 *   node scripts/capture-screens.mjs [appBaseUrl] [appRepoPath]
 *   node scripts/capture-screens.mjs http://localhost:5173
 *
 * Writes public/screens/<name>-420.webp and -840.webp, the two widths the
 * DeviceFrame component references in its srcset.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2] || 'http://localhost:5173';
const APP_REPO = process.argv[3] || 'D:/GameFit Claude-Base44';
const OUT = 'public/screens';

// 420x910 is the frame's own aspect. Capturing at that ratio avoids the
// letterboxing you get from shooting a phone viewport and rescaling.
const WIDTH = 420;
const HEIGHT = 910;

const SHOTS = [
  { path: '/dashboard', name: 'dashboard', wait: 3500 },
  { path: '/avatar', name: 'avatar', wait: 3000 },
  { path: '/train', name: 'train', wait: 2500 },
  { path: '/leaderboard', name: 'leaderboard', wait: 3000 },
  { path: '/coach', name: 'coach', wait: 2500 },
  { path: '/profile', name: 'profile', wait: 3000 },
];

const envPath = path.join(APP_REPO, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error(`No .env.local at ${envPath}. Pass the app repo path as argv[3].`);
  process.exit(1);
}
const env = {};
for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
  const t = line.trim();
  if (t && !t.startsWith('#') && t.includes('=')) {
    const [k, ...v] = t.split('=');
    env[k] = v.join('=');
  }
}
if (!env.TEST_USER_EMAIL || !env.TEST_USER_PASSWORD) {
  console.error('.env.local has no TEST_USER_EMAIL / TEST_USER_PASSWORD.');
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
// A second page is used purely as a PNG -> WebP encoder via canvas, so the
// site does not need an image-processing dependency for a once-a-phase task.
const encoder = await (await browser.newContext()).newPage();

async function toWebp(pngBuffer, outFile, targetWidth, quality = 0.86) {
  const b64 = pngBuffer.toString('base64');
  const dataUrl = await encoder.evaluate(async ({ b64, targetWidth, quality }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = targetWidth;
    c.height = Math.round((img.height / img.width) * targetWidth);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', quality);
  }, { b64, targetWidth, quality });
  fs.writeFileSync(outFile, Buffer.from(dataUrl.split(',')[1], 'base64'));
  return fs.statSync(outFile).size;
}

try {
  const ctx = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: 'dark',
  });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', env.TEST_USER_EMAIL);
  await page.fill('input[type="password"]', env.TEST_USER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForTimeout(3000);

  for (const s of SHOTS) {
    await page.goto(`${BASE}${s.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(s.wait);
    const png = await page.screenshot();
    const a = await toWebp(png, `${OUT}/${s.name}-840.webp`, 840);
    const b = await toWebp(png, `${OUT}/${s.name}-420.webp`, 420);
    console.log(`${s.name}: 840w ${(a / 1024).toFixed(0)}KB · 420w ${(b / 1024).toFixed(0)}KB`);
  }
  await ctx.close();
} finally {
  await browser.close();
}
console.log('DONE');
