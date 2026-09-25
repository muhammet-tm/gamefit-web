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
  // The 77% day-3 figure is Quettra data on 125M Android phones across all app
  // categories, published by Andrew Chen in 2015. It was shown as a 2023
  // statistic about fitness apps, which misstates both the year and the scope.
  { pattern: /Andrew Chen,?\s*2023/i, why: 'The 77% figure is Quettra data via Andrew Chen, 2015' },
  { pattern: /77%[^.]{0,40}fitness app/i, why: 'The 77% day-3 figure covers all apps, not fitness apps' },
  // $25.3B traced only to a report mill we could not open; 160+ misstated the
  // project report ("~160 visits" at peak, not interactions); $12.5B in 2023
  // did not match Grand View Research, whose base is $12.1B in 2025.
  { pattern: /\$25\.3\s?B/i, why: 'The AI coaching figure could not be verified' },
  { pattern: /160\+/, why: 'The source reports ~160 peak daily visits, not 160+ interactions' },
  { pattern: /\$12\.5\s?B/i, why: 'Grand View Research gives $12.1B in 2025, not $12.5B in 2023' },
];

for (const route of ROUTES) {
  test(`${route} contains no banned claims`, async ({ page }) => {
    await page.goto(route);
    const text = await page.locator('body').innerText();
    const meta = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    for (const { pattern, why } of BANNED) {
      expect(text, `${route}: ${why}`).not.toMatch(pattern);
      expect(meta, `${route} meta description: ${why}`).not.toMatch(pattern);
    }
  });
}

test('the research DOI is the verified one', async ({ page }) => {
  await page.goto('/research');
  const link = page.getByRole('link', { name: /read the full paper/i });
  await expect(link).toHaveAttribute('href', 'https://doi.org/10.1007/978-3-032-23883-2_13');
});
