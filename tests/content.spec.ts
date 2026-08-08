import { test, expect } from '@playwright/test';
import { ROUTES } from './routes';

const BANNED = [
  { pattern: /OpenAI/i, why: 'The app calls Anthropic Claude, not OpenAI (spec §5.2)' },
  { pattern: /GPT-4/i, why: 'The app calls Anthropic Claude, not GPT-4 (spec §5.2)' },
  { pattern: /3D character|3D avatar/i, why: 'The avatar system is layered 2D SVG (spec §5.2)' },
  { pattern: /88%/, why: 'The survey figure is 78%, not 88% (spec §5.2)' },
  // Matches any $NNK figure rather than one specific number, so it still
  // holds if the target changes and it names nothing in a public repo.
  // Market sizes on the site are in billions and are unaffected.
  { pattern: /\$\s?\d+\s?K\b/i, why: 'No raise amount may appear publicly (spec §5.5)' },
  { pattern: /n\s*=\s*51/i, why: 'Sample size is not published on the site (spec §5.1)' },
];

for (const route of ROUTES) {
  test(`${route} contains no banned claims`, async ({ page }) => {
    await page.goto(route);
    const text = await page.locator('body').innerText();
    for (const { pattern, why } of BANNED) {
      expect(text, `${route}: ${why}`).not.toMatch(pattern);
    }
  });
}

test('the research DOI is the verified one', async ({ page }) => {
  await page.goto('/research');
  const link = page.getByRole('link', { name: /read the full paper/i });
  await expect(link).toHaveAttribute('href', 'https://doi.org/10.1007/978-3-032-23883-2_13');
});
