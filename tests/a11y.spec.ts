import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROUTES } from './routes';

for (const route of ROUTES) {
  test(`${route} has no accessibility violations`, async ({ page }) => {
    await page.goto(route);
    // Contrast is judged on the settled page. The hero's entrance fades text
    // in over ~0.6s, and a scan that lands mid-fade reads a partly
    // transparent paragraph as a contrast failure (seen as a 1-in-4 flake on
    // the home route). Wait for every finite, time-based animation to finish;
    // the looping ones (chip float, orbit) move position only and never
    // change contrast. Scroll-driven animations (the rank ladder) are skipped:
    // they only finish when scrolled, so waiting on them hangs. Capped at 3s.
    await page.evaluate(() =>
      Promise.race([
        Promise.all(
          document
            .getAnimations()
            .filter((a) => a.timeline === document.timeline)
            .filter((a) => a.effect?.getTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => undefined)),
        ),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]),
    );
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const summary = results.violations.map(
      (v) => `${v.id} (${v.impact}) — ${v.nodes.length} node(s): ${v.help}\n` +
        v.nodes.map((n) => `    ${n.target.join(' ')}`).join('\n')
    );
    expect(summary, `violations on ${route}`).toEqual([]);
  });
}

// WebKit (Playwright's bundled build, matching Safari's default "Text Boxes
// and Lists Only" Full Keyboard Access setting) does not put <a> elements in
// the keyboard Tab order — only form controls and buttons are Tab stops
// unless the user has opted into full keyboard access. That is a browser
// default, not an app defect: it affects a small share of real Safari users
// the same way. The axe-core scans above already run identically on both
// engines and report zero violations on both. These two tests assert actual
// Tab-key sequencing, so they are meaningful only on Chromium; WebKit is
// intentionally excluded rather than the assertion being weakened.
test('mobile menu traps focus and closes on Escape', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit excludes links from the Tab order by default — see comment above.');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: /open menu/i }).click();
  const dialog = page.getByRole('dialog', { name: /navigation/i });
  await expect(dialog).toBeVisible();

  // The panel autofocuses its first link (the close button, though focusable,
  // is intentionally skipped so focus lands on primary content).
  const firstLink = dialog.locator('a[href]').first();
  await expect(firstLink).toBeFocused();

  // Tabbing all the way around — one press per focusable element in the
  // panel — returns focus to the same element. That only happens if every
  // Tab press stayed inside the panel's cycle rather than escaping to
  // browser chrome or content behind the overlay, i.e. the trap holds.
  const focusables = dialog.locator('a[href], button:not([disabled])');
  const count = await focusables.count();
  for (let i = 0; i < count; i++) {
    await page.keyboard.press('Tab');
  }
  await expect(firstLink).toBeFocused();

  // Shift+Tab from the very first element in DOM order (the close button)
  // wraps to the last, confirming the boundary is enforced both directions.
  const closeButton = dialog.getByRole('button', { name: /close menu/i });
  await closeButton.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(focusables.last()).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('skip link is the first focusable element', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit excludes links from the Tab order by default — see comment above.');

  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText(/skip to content/i);
});
