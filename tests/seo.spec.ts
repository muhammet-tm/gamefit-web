import { test, expect } from '@playwright/test';
import { ROUTES } from './routes';

// robots.txt once shipped to production containing the literal string
// REPLACE_WITH_SITE_URL, because the plan asked a human to substitute it at
// deploy time. These assert the generated files are actually resolved.

test('robots.txt contains no unresolved placeholder', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const body = await res.text();

  expect(body, 'robots.txt shipped with a placeholder').not.toMatch(/REPLACE|TODO|\{\{|YOUR[-_]/i);
  expect(body).toMatch(/^User-agent: \*/m);
  expect(body, 'robots.txt should advertise the sitemap').toMatch(/^Sitemap: https?:\/\/\S+\/sitemap-index\.xml$/m);
});

test('the sitemap lists every routed page', async ({ request }) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.status()).toBe(200);

  const first = await request.get('/sitemap-0.xml');
  const xml = await first.text();

  for (const route of ROUTES) {
    // Astro emits directory-style URLs with a trailing slash.
    const expected = route === '/' ? '/' : `${route}/`;
    expect(xml, `${route} is missing from the sitemap`).toContain(`${expected}</loc>`);
  }
});

test('every page declares a canonical URL matching its own path', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical, `${route} has no canonical URL`).toBeTruthy();
    expect(canonical, `${route} canonical points elsewhere`).toContain(route === '/' ? '/' : route);
  }
});

test('every page has a unique title and description', async ({ page }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const route of ROUTES) {
    await page.goto(route);
    const title = await page.title();
    const desc = await page.locator('meta[name="description"]').getAttribute('content');

    expect(title, `${route} has no title`).toBeTruthy();
    expect(desc, `${route} has no meta description`).toBeTruthy();
    expect(titles.has(title), `${route} reuses the title "${title}"`).toBe(false);
    expect(descriptions.has(desc!), `${route} reuses another page's description`).toBe(false);

    titles.add(title);
    descriptions.add(desc!);
  }
});
