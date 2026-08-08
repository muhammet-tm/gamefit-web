# GameFit Marketing Site (English) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the complete English-language GameFit marketing site — a long home page composed of eight sections, seven of which are also deep-linkable routes, plus waitlist, feedback and privacy pages.

**Architecture:** Astro renders every page to static HTML at build time. Only four components ship JavaScript, as React islands: the mobile menu, the stat counters, the waitlist form and the feedback form. All content lives in typed data files under `src/content/` so copy changes never require touching a component. Design tokens live in one CSS file consumed by Tailwind 4's `@theme` directive.

**Tech Stack:** Astro 7.2, React 19.2 (`@astrojs/react` 6), Tailwind 4.3 (`@tailwindcss/vite`), Playwright 1.62 + axe-core for verification, Web3Forms for form delivery, Vercel for hosting. Requires Node ≥ 22.12.

**Companion documents:**
- Spec: `docs/specs/2026-08-07-marketing-site-design.md`
- Design system: `DESIGN.md` — every colour, size and rule referenced below is defined there

**Out of scope for this plan:** Arabic localisation. That is plan 2, written after this ships.

---

## File Structure

Files created by this plan, and what each is responsible for.

### Configuration

| Path | Responsibility |
|---|---|
| `astro.config.mjs` | Astro integrations, Vite plugins, site URL |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript paths, strict mode |
| `vercel.json` | Security headers only. No rewrites — Astro emits real static routes |
| `playwright.config.ts` | Test runner config, builds and previews before testing |

### Styles

| Path | Responsibility |
|---|---|
| `src/styles/tokens.css` | **Single source of truth for design tokens.** Tailwind `@theme` block |
| `src/styles/global.css` | Base element styles, font-face declarations, reduced-motion rules |

### Content — data only, no markup

| Path | Responsibility |
|---|---|
| `src/content/site.ts` | Site name, tagline, contact details, social links |
| `src/content/stats.ts` | Every statistic with its mandatory source field |
| `src/content/features.ts` | The three feature pillars |
| `src/content/research.ts` | Paper metadata, DOI, SDT pillars |
| `src/content/roadmap.ts` | Three phases with status |
| `src/content/about.ts` | Founder story, timeline, mission |
| `src/content/sections.ts` | Section registry — id, route, nav label, metadata |

### Layout and shared components

| Path | Responsibility |
|---|---|
| `src/layouts/BaseLayout.astro` | HTML shell, head, skip link, header, footer |
| `src/components/Head.astro` | Title, description, canonical, Open Graph, JSON-LD |
| `src/components/Header.astro` | Sticky nav, wordmark, CTA |
| `src/components/Footer.astro` | Links, contact, legal |
| `src/components/SectionShell.astro` | Section band wrapper: id, background alternation, eyebrow, title |
| `src/components/Button.astro` | The three button variants |
| `src/components/StatTile.astro` | Figure, label, mandatory source |
| `src/components/Card.astro` | Surface card primitive |

### Sections — one file each, rendered on home and on their own route

| Path |
|---|
| `src/sections/Hero.astro` |
| `src/sections/Stats.astro` |
| `src/sections/Features.astro` |
| `src/sections/Leaderboard.astro` |
| `src/sections/Research.astro` |
| `src/sections/Roadmap.astro` |
| `src/sections/About.astro` |
| `src/sections/Contact.astro` |

### Islands — the only files that ship JavaScript

| Path | Responsibility |
|---|---|
| `src/islands/MobileMenu.tsx` | Overlay nav with focus trap |
| `src/islands/CountUp.tsx` | Stat counter, runs once, respects reduced motion |
| `src/islands/WaitlistForm.tsx` | Waitlist form, four states |
| `src/islands/FeedbackForm.tsx` | Feedback form, four states |
| `src/lib/submitForm.ts` | Shared Web3Forms POST + honeypot + rate limit. Not an island |

### Pages

| Path |
|---|
| `src/pages/index.astro` |
| `src/pages/stats.astro`, `features.astro`, `leaderboard.astro`, `research.astro`, `roadmap.astro`, `about.astro`, `contact.astro` |
| `src/pages/beta.astro`, `feedback.astro`, `privacy.astro` |
| `src/pages/404.astro` |

### Tests

| Path | Responsibility |
|---|---|
| `tests/routes.spec.ts` | Every route renders, has one `<h1>`, no console errors |
| `tests/a11y.spec.ts` | axe on every route, zero violations |
| `tests/forms.spec.ts` | All four form states, honeypot, validation |
| `tests/content.spec.ts` | Guards the §5.2 corrections — fails if "OpenAI" or "3D" reappear |
| `tests/responsive.spec.ts` | Screenshots at three widths |

---

## Task 1: Scaffold the project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`

- [ ] **Step 1: Verify Node version**

Run: `node -v`
Expected: `v22.12.0` or higher. Astro 7 will refuse to install below this.

- [ ] **Step 2: Initialise package.json**

Run from `D:\gamefit-web`:

```bash
npm init -y
```

- [ ] **Step 3: Install dependencies**

```bash
npm i astro@^7.2.0 @astrojs/react@^6.0.2 @astrojs/sitemap@^3.7.3 react@^19.2.0 react-dom@^19.2.0 tailwindcss@^4.3.3 @tailwindcss/vite@^4.3.3
npm i -D typescript @types/react@^19 @types/react-dom@^19 @playwright/test@^1.62.1 @axe-core/playwright@^4.12.1 sharp
```

Note: no `@astrojs/vercel` adapter. The site is fully static, so Vercel serves the built output directly. Adding an adapter would introduce a serverless runtime the site does not need and should not have.

- [ ] **Step 4: Write astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  output: 'static',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
```

- [ ] **Step 5: Write tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 6: Replace package.json scripts**

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "playwright test",
    "test:a11y": "playwright test tests/a11y.spec.ts"
  }
}
```

- [ ] **Step 7: Create a placeholder page so the build has something to emit**

`src/pages/index.astro`:

```astro
---
---
<html lang="en">
  <head><title>GameFit</title></head>
  <body><h1>GameFit</h1></body>
</html>
```

- [ ] **Step 8: Verify the build succeeds**

Run: `npm run build`
Expected: `Complete!` and a `dist/index.html` containing `<h1>GameFit</h1>`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro 7 project with React and Tailwind 4"
```

---

## Task 2: Design tokens

Tailwind 4 has no `tailwind.config.js`. Tokens are declared in CSS with `@theme`, which is why `tokens.css` is genuinely the single source of truth rather than a document that drifts from one.

**Files:**
- Create: `src/styles/tokens.css`

- [ ] **Step 1: Write tokens.css**

Values are taken from `DESIGN.md` §2.1, §3.2, §4.1, §5, §6. Note `--color-gf-violet-text` — the accessible violet required by the contrast rule in `DESIGN.md` §2.2.

```css
@import "tailwindcss";

@theme {
  --color-gf-bg: #0D0F14;
  --color-gf-surface: #161A22;
  --color-gf-elevated: #1E2330;
  --color-gf-border: #2A2F3A;
  --color-gf-text: #FFFFFF;
  --color-gf-muted: #8A8F9E;
  --color-gf-lime: #C8FF00;
  --color-gf-amber: #FFB800;
  --color-gf-violet: #7C3AED;
  --color-gf-violet-text: #A78BFA;
  --color-gf-success: #22C55E;
  --color-gf-error: #EF4444;

  --font-display: "Barlow Condensed", ui-sans-serif, system-ui, sans-serif;
  --font-body: "DM Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --text-hero: clamp(3rem, 9vw, 6.5rem);
  --text-h1: clamp(2.25rem, 5.5vw, 4rem);
  --text-h2: clamp(1.5rem, 3vw, 2.25rem);
  --text-h3: clamp(1.125rem, 2vw, 1.375rem);
  --text-stat: clamp(2.5rem, 6vw, 4rem);

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  --ease-out-soft: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-soft: cubic-bezier(0.65, 0, 0.35, 1);

  --container-site: 1200px;
  --container-narrow: 760px;
}
```

- [ ] **Step 2: Verify tokens compile into utilities**

Import it from the placeholder page and build:

`src/pages/index.astro`:

```astro
---
import '../styles/tokens.css';
---
<html lang="en">
  <head><title>GameFit</title></head>
  <body class="bg-gf-bg text-gf-lime"><h1>GameFit</h1></body>
</html>
```

Run: `npm run build`
Then: `grep -o '#C8FF00\|#0D0F14' dist/_astro/*.css | head`
Expected: both hex values present. If absent, the `@theme` block is not being picked up — check that `@import "tailwindcss"` is the first line.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add design tokens as Tailwind 4 theme"
```

---

## Task 3: Self-hosted fonts

`DESIGN.md` §3.1 requires fonts be self-hosted rather than loaded from Google's CDN — one fewer third-party request, and it removes the GDPR exposure.

**Files:**
- Create: `src/styles/global.css`
- Modify: `package.json` (three `@fontsource` dependencies)

- [ ] **Step 1: Install the fonts as packages**

```bash
npm i @fontsource/barlow-condensed @fontsource/dm-sans @fontsource/jetbrains-mono
```

`@fontsource` ships self-hosted woff2 files as npm packages, which Vite fingerprints and emits into `dist/`. This satisfies the same requirement as hand-placing files in `public/fonts/` — no request ever reaches Google — while being reproducible from `package.json` rather than depending on a download tool.

Do **not** fall back to the Google Fonts CDN if this fails. That would breach `DESIGN.md` §3.1.

- [ ] **Step 2: Verify the font files are emitted locally**

Run: `npm run build && ls dist/_astro/*.woff2 | head`
Expected: woff2 files present in the build output.

- [ ] **Step 3: Write global.css**

```css
@import "@fontsource/barlow-condensed/900.css";
@import "@fontsource/dm-sans/400.css";
@import "@fontsource/dm-sans/500.css";
@import "@fontsource/dm-sans/700.css";
@import "@fontsource/jetbrains-mono/500.css";

html {
  background-color: var(--color-gf-bg);
  color-scheme: dark;
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-gf-bg);
  color: var(--color-gf-text);
  font-family: var(--font-body);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 0.95;
}

:focus-visible {
  outline: 2px solid var(--color-gf-lime);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Verify no external font requests remain**

Run: `grep -rn "fonts.googleapis\|fonts.gstatic" src/ public/ || echo "clean"`
Expected: `clean`. Any hit is a GDPR and performance regression.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: self-host fonts, add global base styles"
```

---

## Task 4: Test harness

Test infrastructure comes before the pages so every subsequent task can be written test-first.

**Files:**
- Create: `playwright.config.ts`, `tests/routes.spec.ts`

- [ ] **Step 1: Write playwright.config.ts**

```ts
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
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    // Not `astro preview`: as of Astro 7 it daemonises when stdout is not a
    // TTY, exiting 0 immediately, which Playwright reads as "server died".
    // sirv serves the same dist/ output and stays in the foreground.
    command: 'npm run build && npx sirv dist --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Requires `npm i -D sirv-cli`, added in Step 1a below.

Testing the built output rather than the dev server matters: the dev server does not apply the same CSS bundling or asset hashing, so a passing dev test can hide a broken production build.

- [ ] **Step 1a: Install the static server**

```bash
npm i -D sirv-cli
```

`astro preview` cannot be used here. Verified on 2026-08-07 against Astro 7.2: it prints `Preview server running at http://localhost:4321 (pid NNNN)` and exits with code 0, leaving a detached daemon. Playwright treats the exit as a crashed server and aborts the run. There is a `--background` flag but no way to force foreground, so a plain static server is the correct tool.

- [ ] **Step 2: Install the browser binary**

Run: `npx playwright install chromium`

- [ ] **Step 3: Write the failing route test**

`tests/routes.spec.ts`:

```ts
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
```

- [ ] **Step 4: Run it to confirm it fails**

Run: `npx playwright test tests/routes.spec.ts --project=desktop`
Expected: FAIL. Only `/` exists so far; every other route 404s.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: add Playwright harness and route contract"
```

---

## Task 5: Content data files

Content is data, not markup. Changing a statistic must never mean editing a component.

**Files:**
- Create: `src/content/site.ts`, `src/content/sections.ts`, `src/content/stats.ts`

- [ ] **Step 1: Write site.ts**

```ts
export const site = {
  name: 'GameFit',
  tagline: 'Fitness that sticks. Finally.',
  description:
    'GameFit turns workouts into an RPG — AI coaching, avatar evolution, XP progression and social competition in one adaptive loop, grounded in peer-reviewed behavioural science.',
  email: 'team.gamefit@gmail.com',
  linkedin: 'https://www.linkedin.com/in/muhammet-yalkapov',
  appUrl: 'https://gamefit-app.vercel.app',
  founder: 'Muhammet Yalkapov',
  location: 'Abu Dhabi, United Arab Emirates',
} as const;
```

- [ ] **Step 2: Write sections.ts**

This registry is the single definition of the eight sections. The home page, the nav and the standalone routes all read from it, so they cannot drift apart.

```ts
export interface SectionMeta {
  id: string;
  route: string | null;
  navLabel: string | null;
  title: string;
  metaTitle: string;
  metaDescription: string;
}

export const sections: SectionMeta[] = [
  {
    id: 'hero',
    route: null,
    navLabel: null,
    title: 'Fitness that sticks. Finally.',
    metaTitle: 'GameFit — Fitness, Gamified',
    metaDescription:
      '77% of fitness app users quit within three days. GameFit fixes that with AI coaching, avatar evolution and social competition, grounded in peer-reviewed research.',
  },
  {
    id: 'stats',
    route: '/stats',
    navLabel: 'Stats',
    title: 'The case for GameFit',
    metaTitle: 'The Numbers Behind GameFit',
    metaDescription:
      'The fitness app retention crisis in data: 77% abandonment within three days, a $33.6B market by 2033, and what our research found.',
  },
  {
    id: 'features',
    route: '/features',
    navLabel: 'Features',
    title: 'Not an app. An arena.',
    metaTitle: 'GameFit Features — AI Coaching and Deep Gamification',
    metaDescription:
      'Three systems fused into one adaptive loop: an AI coach powered by Anthropic Claude, 25 evolving avatar tiers, and weekly social competition.',
  },
  {
    id: 'leaderboard',
    route: '/leaderboard',
    navLabel: 'Leaderboard',
    title: 'Climb. Compete. Win.',
    metaTitle: 'GameFit Leaderboards — Weekly Competition',
    metaDescription:
      'Weekly leaderboards reset every Monday. Global rankings and friends-only mode, with four stats tracked from every workout logged.',
  },
  {
    id: 'research',
    route: '/research',
    navLabel: 'Research',
    title: 'Built on science, not hype.',
    metaTitle: 'GameFit Research — Peer-Reviewed in Springer LNNS',
    metaDescription:
      'GameFit was peer-reviewed and published in Springer Lecture Notes in Networks and Systems before it launched, grounded in Self-Determination Theory.',
  },
  {
    id: 'roadmap',
    route: '/roadmap',
    navLabel: 'Roadmap',
    title: 'From prototype to platform.',
    metaTitle: 'GameFit Roadmap — MVP Ready',
    metaDescription:
      'Phase one validated the concept. Phase two is complete: the MVP is built, deployed and working end to end. Phase three is scale.',
  },
  {
    id: 'about',
    route: '/about',
    navLabel: 'About',
    title: 'Built in Abu Dhabi. Scaling to the world.',
    metaTitle: 'About GameFit — Founder Story',
    metaDescription:
      'GameFit began with a real problem: managing a fitness club at 15 and watching members quit from boredom, not effort.',
  },
  {
    id: 'contact',
    route: '/contact',
    navLabel: 'Contact',
    title: "Let's build together.",
    metaTitle: 'Contact GameFit',
    metaDescription:
      'For investment, partnerships or general enquiries — get in touch with the GameFit team.',
  },
];

export const navSections = sections.filter((s) => s.navLabel !== null);
export const routedSections = sections.filter((s) => s.route !== null);
```

- [ ] **Step 3: Write stats.ts**

Every entry has a mandatory `source`. Per spec §5.1, survey figures cite the research rather than a participant count.

```ts
export interface Stat {
  value: string;
  label: string;
  source: string;
  accent: 'lime' | 'amber' | 'violet' | 'plain';
}

export const heroStats: Stat[] = [
  { value: '78%', label: 'Want gamified fitness', source: 'GameFit user survey, peer-reviewed', accent: 'lime' },
  { value: '71%', label: 'Prefer AI-personalised coaching', source: 'GameFit user survey, peer-reviewed', accent: 'amber' },
  { value: '77%', label: 'Quit fitness apps within 3 days', source: 'Andrew Chen, 2023', accent: 'violet' },
];

export const marketStats: Stat[] = [
  { value: '77%', label: 'Fitness apps abandoned within three days', source: 'Andrew Chen, 2023', accent: 'lime' },
  { value: '$33.6B', label: 'Global fitness app market by 2033', source: '13.4% CAGR from $12.5B in 2023', accent: 'amber' },
  { value: '$25.3B', label: 'AI coaching segment by 2033', source: '27.6% CAGR', accent: 'violet' },
  { value: '160+', label: 'Prototype interactions during testing', source: 'Validated November 2025', accent: 'plain' },
];

export const surveyStats: Stat[] = [
  { value: '78%', label: 'Want more engaging exercise', source: 'GameFit user survey, peer-reviewed', accent: 'lime' },
  { value: '71%', label: 'Prefer AI personalisation', source: 'GameFit user survey, peer-reviewed', accent: 'amber' },
  { value: '64%', label: 'Value real-world rewards', source: 'GameFit user survey, peer-reviewed', accent: 'violet' },
];
```

- [ ] **Step 4: Verify it type-checks**

Run: `npx astro check`
Expected: `0 errors`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add site, section and statistics content data"
```

---

## Task 6: Head component and base layout

**Files:**
- Create: `src/components/Head.astro`, `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Write Head.astro**

```astro
---
import { site } from '../content/site';

interface Props {
  title: string;
  description: string;
  path: string;
}

const { title, description, path } = Astro.props;
const canonical = new URL(path, Astro.site).href;
const ogImage = new URL('/og-image.png', Astro.site).href;
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />

<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<meta name="theme-color" content="#0D0F14" />

<meta property="og:type" content="website" />
<meta property="og:site_name" content={site.name} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImage} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage} />

<script type="application/ld+json" set:html={JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: site.name,
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web, iOS, Android',
  description: site.description,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'AED' },
})} />
```

- [ ] **Step 2: Write BaseLayout.astro**

```astro
---
import Head from '../components/Head.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/tokens.css';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  path: string;
}

const { title, description, path } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <Head title={title} description={description} path={path} />
  </head>
  <body class="bg-gf-bg text-gf-text antialiased">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-gf-lime focus:px-4 focus:py-2 focus:font-bold focus:text-gf-bg"
    >
      Skip to content
    </a>
    <Header />
    <main id="main">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

The skip link is the first focusable element, per `DESIGN.md` §9.

- [ ] **Step 3: Commit** (build will fail until Task 7 adds Header and Footer; that is expected)

```bash
git add -A
git commit -m "feat: add head component and base layout"
```

---

## Task 7: Header, mobile menu island, footer

**Files:**
- Create: `src/components/Header.astro`, `src/islands/MobileMenu.tsx`, `src/components/Footer.astro`

- [ ] **Step 1: Write MobileMenu.tsx**

The focus trap and Escape handling are required by `DESIGN.md` §9. Body scroll is locked while open so the page behind does not move.

```tsx
import { useEffect, useRef, useState } from 'react';

interface NavItem { label: string; href: string; }
interface Props { items: NavItem[]; }

export default function MobileMenu({ items }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      (previouslyFocused ?? triggerRef.current)?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-md border border-gf-border md:hidden"
      >
        <span aria-hidden="true" className="text-xl leading-none">☰</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className="fixed inset-0 z-50 flex flex-col bg-gf-bg p-6 md:hidden"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-gf-border"
            >
              <span aria-hidden="true" className="text-xl leading-none">✕</span>
            </button>
          </div>
          <nav className="mt-8 flex flex-col gap-2">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-4 py-4 font-display text-3xl uppercase text-gf-text"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/beta"
              onClick={() => setOpen(false)}
              className="mt-4 rounded-md bg-gf-lime px-4 py-4 text-center font-bold text-gf-bg"
            >
              Join waitlist
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Write Header.astro**

```astro
---
import { navSections } from '../content/sections';
import MobileMenu from '../islands/MobileMenu';

const isHome = Astro.url.pathname === '/';
const items = navSections.map((s) => ({
  label: s.navLabel as string,
  href: isHome ? `#${s.id}` : (s.route as string),
}));
---
<header
  class="sticky top-0 z-40 border-b border-transparent bg-gf-bg/80 backdrop-blur-md transition-colors"
  data-site-header
>
  <div class="mx-auto flex h-16 max-w-[var(--container-site)] items-center justify-between px-[clamp(1.25rem,5vw,4rem)]">
    <a href="/" class="font-display text-2xl uppercase text-gf-lime">GameFit</a>

    <nav aria-label="Primary" class="hidden md:block">
      <ul class="flex items-center gap-8">
        {items.map((item) => (
          <li>
            <a href={item.href} class="text-sm text-gf-muted transition-colors hover:text-gf-text">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>

    <div class="flex items-center gap-3">
      <a
        href="/beta"
        class="hidden rounded-md bg-gf-lime px-5 py-2.5 text-sm font-bold text-gf-bg transition-opacity hover:opacity-90 md:inline-block"
      >
        Join waitlist
      </a>
      <MobileMenu items={items} client:load />
    </div>
  </div>
</header>

<script>
  const header = document.querySelector('[data-site-header]');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('border-gf-border', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
</script>
```

- [ ] **Step 3: Write Footer.astro**

```astro
---
import { site } from '../content/site';
import { routedSections } from '../content/sections';
---
<footer class="border-t border-gf-border bg-gf-surface">
  <div class="mx-auto max-w-[var(--container-site)] px-[clamp(1.25rem,5vw,4rem)] py-16">
    <div class="grid gap-10 md:grid-cols-3">
      <div>
        <p class="font-display text-2xl uppercase text-gf-lime">GameFit</p>
        <p class="mt-3 max-w-xs text-sm text-gf-muted">{site.tagline}</p>
      </div>

      <nav aria-label="Footer">
        <h2 class="text-xs uppercase tracking-widest text-gf-lime">Explore</h2>
        <ul class="mt-4 space-y-2">
          {routedSections.map((s) => (
            <li>
              <a href={s.route} class="text-sm text-gf-muted hover:text-gf-text">{s.navLabel ?? s.title}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div>
        <h2 class="text-xs uppercase tracking-widest text-gf-lime">Get involved</h2>
        <ul class="mt-4 space-y-2">
          <li><a href="/beta" class="text-sm text-gf-muted hover:text-gf-text">Join the waitlist</a></li>
          <li><a href="/feedback" class="text-sm text-gf-muted hover:text-gf-text">Share feedback</a></li>
          <li><a href={`mailto:${site.email}`} class="text-sm text-gf-muted hover:text-gf-text">{site.email}</a></li>
          <li>
            <a href={site.linkedin} rel="noopener noreferrer" target="_blank" class="text-sm text-gf-muted hover:text-gf-text">
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-12 flex flex-col gap-3 border-t border-gf-border pt-6 text-xs text-gf-muted md:flex-row md:items-center md:justify-between">
      <p>© {new Date().getFullYear()} GameFit. Built in Abu Dhabi.</p>
      <a href="/privacy" class="hover:text-gf-text">Privacy</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 4: Verify the build succeeds**

Run: `npm run build`
Expected: `Complete!` with no unresolved import errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add header with accessible mobile menu, and footer"
```

---

## Task 8: Section shell and shared primitives

**Files:**
- Create: `src/components/SectionShell.astro`, `src/components/StatTile.astro`, `src/components/Card.astro`, `src/islands/CountUp.tsx`

- [ ] **Step 1: Write SectionShell.astro**

Handles the band alternation and section rhythm from `DESIGN.md` §4.3, so no section reimplements it.

```astro
---
interface Props {
  id: string;
  eyebrow?: string;
  title?: string;
  band?: 'bg' | 'surface';
  narrow?: boolean;
  as?: 'h1' | 'h2';
}

const { id, eyebrow, title, band = 'bg', narrow = false, as = 'h2' } = Astro.props;
const bandClass = band === 'surface' ? 'bg-gf-surface' : 'bg-gf-bg';
const width = narrow ? 'max-w-[var(--container-narrow)]' : 'max-w-[var(--container-site)]';
const Title = as;
---
<section id={id} class={`${bandClass} py-[clamp(5rem,12vw,10rem)]`}>
  <div class={`mx-auto ${width} px-[clamp(1.25rem,5vw,4rem)]`}>
    {eyebrow && (
      <p class="text-xs font-bold uppercase tracking-[0.12em] text-gf-lime">{eyebrow}</p>
    )}
    {title && (
      <Title class="mt-4 text-[length:var(--text-h1)] text-gf-text">{title}</Title>
    )}
    <slot />
  </div>
</section>
```

- [ ] **Step 2: Write CountUp.tsx**

Per `DESIGN.md` §6, it runs once, and under reduced motion it renders the final value immediately. The final value is also the server-rendered fallback, so a blocked script never leaves a blank number.

```tsx
import { useEffect, useRef, useState } from 'react';

interface Props { value: string; }

export default function CountUp({ value }: Props) {
  const match = value.match(/^([^\d]*)([\d.]+)(.*)$/);
  const prefix = match?.[1] ?? '';
  const target = match ? parseFloat(match[2]) : NaN;
  const suffix = match?.[3] ?? '';
  const decimals = match?.[2].includes('.') ? 1 : 0;

  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (Number.isNaN(target) || done.current || !ref.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const el = ref.current;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || done.current) return;
      done.current = true;
      observer.disconnect();

      const duration = 600;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(prefix + (target * eased).toFixed(decimals) + suffix);
        if (p < 1) requestAnimationFrame(tick);
        else setDisplay(value);
      };
      setDisplay(prefix + (0).toFixed(decimals) + suffix);
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, prefix, suffix, decimals, value]);

  return <span ref={ref}>{display}</span>;
}
```

- [ ] **Step 3: Write StatTile.astro**

The source line is not optional. `DESIGN.md` §7.2 requires every figure to carry one.

```astro
---
import CountUp from '../islands/CountUp';
import type { Stat } from '../content/stats';

interface Props { stat: Stat; }
const { stat } = Astro.props;

const accentClass = {
  lime: 'text-gf-lime',
  amber: 'text-gf-amber',
  violet: 'text-gf-violet-text',
  plain: 'text-gf-text',
}[stat.accent];
---
<div class="rounded-[var(--radius-lg)] border border-gf-border bg-gf-surface p-6">
  <p class={`font-display text-[length:var(--text-stat)] tabular-nums ${accentClass}`}>
    <CountUp value={stat.value} client:visible />
  </p>
  <p class="mt-2 text-gf-text">{stat.label}</p>
  <p class="mt-1 text-sm text-gf-muted">{stat.source}</p>
</div>
```

Note `client:visible` — the counter's JavaScript is only fetched when the tile scrolls into view, not on page load.

- [ ] **Step 4: Write Card.astro**

```astro
---
interface Props { class?: string; }
const { class: className = '' } = Astro.props;
---
<div class={`rounded-[var(--radius-lg)] border border-gf-border bg-gf-surface p-7 ${className}`}>
  <slot />
</div>
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: `Complete!`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add section shell, stat tile and count-up island"
```

---

## Task 9: Hero and Stats sections

**Files:**
- Create: `src/sections/Hero.astro`, `src/sections/Stats.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Write Hero.astro**

Copy reflects spec §5.2: no "3D", no OpenAI, 78% not 88%.

```astro
---
import { site } from '../content/site';
import { heroStats } from '../content/stats';
import CountUp from '../islands/CountUp';
---
<section id="hero" class="bg-gf-bg pt-20 pb-[clamp(4rem,10vw,8rem)]">
  <div class="mx-auto max-w-[var(--container-site)] px-[clamp(1.25rem,5vw,4rem)]">
    <p class="inline-flex items-center gap-2 rounded-full border border-gf-lime/40 bg-gf-lime/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gf-lime">
      AI-powered gamified fitness
    </p>

    <h1 class="mt-8 max-w-4xl text-[length:var(--text-hero)] text-gf-text">
      Fitness<br />
      <span class="text-gf-lime">that sticks.</span><br />
      <span class="text-gf-amber">Finally.</span>
    </h1>

    <p class="mt-8 max-w-[52ch] text-lg text-gf-muted">
      77% of fitness app users quit within three days. GameFit fixes that — with
      AI coaching, avatar evolution, XP progression and social competition in one
      adaptive loop.
    </p>

    <div class="mt-10 flex flex-wrap gap-4">
      <a href="/beta" class="rounded-[var(--radius-md)] bg-gf-lime px-7 py-3.5 font-bold text-gf-bg transition-opacity hover:opacity-90">
        Join the waitlist →
      </a>
      <a href={site.appUrl} rel="noopener noreferrer" target="_blank"
         class="rounded-[var(--radius-md)] border border-gf-border px-7 py-3.5 font-bold text-gf-text transition-colors hover:border-gf-muted">
        Try the live app
      </a>
    </div>

    <dl class="mt-16 grid max-w-2xl grid-cols-2 gap-8 border-t border-gf-border pt-8 sm:grid-cols-3">
      {heroStats.map((s) => (
        <div>
          <dt class="sr-only">{s.label}</dt>
          <dd>
            <span class="block font-display text-4xl tabular-nums text-gf-lime">
              <CountUp value={s.value} client:visible />
            </span>
            <span class="mt-1 block text-sm text-gf-muted">{s.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  </div>
</section>
```

- [ ] **Step 2: Write Stats.astro**

```astro
---
import SectionShell from '../components/SectionShell.astro';
import StatTile from '../components/StatTile.astro';
import { marketStats, surveyStats } from '../content/stats';

interface Props { as?: 'h1' | 'h2'; }
const { as = 'h2' } = Astro.props;
---
<SectionShell id="stats" band="surface" eyebrow="The numbers" title="The case for GameFit" as={as}>
  <p class="mt-6 max-w-[60ch] text-lg text-gf-muted">
    The problem we solve, and the demand we have validated.
  </p>

  <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {marketStats.map((stat) => <StatTile stat={stat} />)}
  </div>

  <h3 class="mt-16 text-[length:var(--text-h3)] text-gf-text">What our research found</h3>
  <div class="mt-6 grid gap-5 sm:grid-cols-3">
    {surveyStats.map((stat) => <StatTile stat={stat} />)}
  </div>
</SectionShell>
```

The `as` prop exists so this section renders an `<h2>` on the home page but an `<h1>` on `/stats`, keeping exactly one `<h1>` per page as the route test requires.

- [ ] **Step 3: Compose them on the home page**

`src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../sections/Hero.astro';
import Stats from '../sections/Stats.astro';
import { sections } from '../content/sections';

const hero = sections.find((s) => s.id === 'hero')!;
---
<BaseLayout title={hero.metaTitle} description={hero.metaDescription} path="/">
  <Hero />
  <Stats />
</BaseLayout>
```

- [ ] **Step 4: Verify the home route test passes**

Run: `npx playwright test tests/routes.spec.ts --project=desktop -g "^/ renders"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add hero and stats sections"
```

---

## Task 10: Features, Leaderboard and Research sections

**Files:**
- Create: `src/content/features.ts`, `src/content/research.ts`, `src/sections/Features.astro`, `src/sections/Leaderboard.astro`, `src/sections/Research.astro`

- [ ] **Step 1: Write features.ts**

Note the AI provider and avatar wording — these are the corrections from spec §5.2 and are guarded by a test in Task 14.

```ts
export interface Feature {
  title: string;
  body: string;
  tags: string[];
  accent: 'lime' | 'violet' | 'amber';
}

export const features: Feature[] = [
  {
    title: 'Deep gamification',
    body: 'XP and levels, 25 evolving avatar tiers rendered live, rank badges from Bronze to Apex, and a rewards marketplace. Strength, endurance, agility and recovery are tracked from every workout logged.',
    tags: ['XP & levels', 'Avatar evolution', 'Rewards marketplace', 'STR/END/AGI/REC'],
    accent: 'lime',
  },
  {
    title: 'AI Coach G',
    body: 'Coaching powered by Anthropic Claude Haiku 4.5 that adapts in real time. Personalised workout plans, nutrition guidance and 24/7 feedback that gets sharper with every session. The model never sees your data from the browser — every call runs server-side.',
    tags: ['Anthropic Claude', 'Nutrition plans', 'Adaptive loop', '24/7 available'],
    accent: 'violet',
  },
  {
    title: 'Social leaderboards',
    body: 'Weekly global and friends leaderboards reset every Monday at midnight UTC. Compete, climb, earn coins and redeem real fitness rewards in the marketplace.',
    tags: ['Weekly reset', 'Global + friends', 'Challenges', 'Marketplace'],
    accent: 'amber',
  },
];
```

- [ ] **Step 2: Write research.ts**

The DOI here is the verified one. The alternative in the founder's profile document returns 404 — see spec §5.2.

```ts
export const paper = {
  title:
    'GameFit: An AI-Powered Gamification for Enhancing User Retention in Mobile Fitness Applications',
  authors: [
    'Muhammet Yalkapov',
    'Dr. Murad Al-Rajab',
    'Dr. Samia Loucif',
    'Dr. Suhail Odeh',
    'Ayyub Ishnazarov',
  ],
  venue: 'Springer Lecture Notes in Networks and Systems',
  indexed: 'Scopus indexed · ACR\u201926',
  conference: 'ACR\u201926 — International Conference on Advances in Computing Research, Amsterdam',
  presentation: 'Presented remotely by the founder',
  doi: '10.1007/978-3-032-23883-2_13',
  doiUrl: 'https://doi.org/10.1007/978-3-032-23883-2_13',
  abstract:
    'This research applies AI and gamification grounded in Self-Determination Theory — autonomy, competence and relatedness — to increase intrinsic motivation and address retention failure in mobile fitness applications.',
} as const;

export interface Pillar { name: string; body: string; }

export const sdtPillars: Pillar[] = [
  { name: 'Autonomy', body: 'AI personalisation gives users choice and control over their fitness journey. Your plan, your pace.' },
  { name: 'Competence', body: 'XP, levels, badges and visible progression build mastery and a genuine sense of achievement.' },
  { name: 'Relatedness', body: 'Leaderboards and social competition create community connection and belonging.' },
];
```

- [ ] **Step 3: Write Features.astro**

```astro
---
import SectionShell from '../components/SectionShell.astro';
import Card from '../components/Card.astro';
import { features } from '../content/features';

interface Props { as?: 'h1' | 'h2'; }
const { as = 'h2' } = Astro.props;

const accentText = { lime: 'text-gf-lime', violet: 'text-gf-violet-text', amber: 'text-gf-amber' };
---
<SectionShell id="features" eyebrow="Core features" title="Not an app. An arena." as={as}>
  <p class="mt-6 max-w-[62ch] text-lg text-gf-muted">
    Three systems — AI coaching, deep gamification and social competition — fused
    into one adaptive feedback loop grounded in Self-Determination Theory.
  </p>

  <div class="mt-12 grid gap-5 md:grid-cols-3">
    {features.map((f) => (
      <Card>
        <h3 class={`text-[length:var(--text-h3)] ${accentText[f.accent]}`}>{f.title}</h3>
        <p class="mt-4 text-gf-muted">{f.body}</p>
        <ul class="mt-6 flex flex-wrap gap-2">
          {f.tags.map((t) => (
            <li class="rounded-[var(--radius-md)] border border-gf-border px-3 py-1 text-xs text-gf-muted">{t}</li>
          ))}
        </ul>
      </Card>
    ))}
  </div>
</SectionShell>
```

- [ ] **Step 4: Write Leaderboard.astro**

```astro
---
import SectionShell from '../components/SectionShell.astro';
import Card from '../components/Card.astro';

interface Props { as?: 'h1' | 'h2'; }
const { as = 'h2' } = Astro.props;

const mechanics = [
  { title: 'STR · END · AGI · REC', body: 'Four stats tracked from every workout logged' },
  { title: 'Earn coins, spend in the marketplace', body: 'Real fitness gear and nutrition rewards' },
  { title: 'Global and friends leaderboards', body: 'Compete publicly or with your crew' },
  { title: 'Weekly reset', body: 'Fresh competition every Monday at midnight UTC' },
];
---
<SectionShell id="leaderboard" band="surface" eyebrow="Competition" title="Climb. Compete. Win." as={as}>
  <p class="mt-6 max-w-[62ch] text-lg text-gf-muted">
    Weekly leaderboards reset every Monday at midnight UTC. Global rankings plus a
    friends-only mode. Your avatar's rank reflects every rep you put in.
  </p>

  <div class="mt-12 grid gap-5 md:grid-cols-2">
    {mechanics.map((m) => (
      <Card>
        <h3 class="text-[length:var(--text-h3)] text-gf-text">{m.title}</h3>
        <p class="mt-2 text-gf-muted">{m.body}</p>
      </Card>
    ))}
  </div>
</SectionShell>
```

- [ ] **Step 5: Write Research.astro**

```astro
---
import SectionShell from '../components/SectionShell.astro';
import Card from '../components/Card.astro';
import StatTile from '../components/StatTile.astro';
import { paper, sdtPillars } from '../content/research';
import { surveyStats } from '../content/stats';

interface Props { as?: 'h1' | 'h2'; }
const { as = 'h2' } = Astro.props;
---
<SectionShell id="research" eyebrow="Academic validation" title="Built on science, not hype." as={as}>
  <p class="mt-6 max-w-[62ch] text-lg text-gf-muted">
    GameFit was peer-reviewed and published before it launched. That is the
    standard we hold ourselves to.
  </p>

  <div class="mt-12 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
    <Card>
      <p class="inline-flex rounded-[var(--radius-md)] border border-gf-violet/50 bg-gf-violet/15 px-3 py-1 text-xs font-bold text-gf-violet-text">
        Springer · {paper.indexed}
      </p>
      <h3 class="mt-5 text-[length:var(--text-h3)] text-gf-text">{paper.title}</h3>
      <p class="mt-4 text-sm text-gf-muted">{paper.authors.join(' · ')}</p>
      <p class="mt-2 text-sm text-gf-text">{paper.venue}</p>
      <p class="mt-4 text-gf-muted">{paper.abstract}</p>
      <p class="mt-4 text-sm text-gf-muted">{paper.conference} — {paper.presentation}</p>
      <a
        href={paper.doiUrl}
        rel="noopener noreferrer"
        target="_blank"
        class="mt-6 inline-block font-mono text-sm text-gf-lime underline underline-offset-4"
      >
        Read the full paper — doi.org/{paper.doi}
      </a>
    </Card>

    <div class="grid gap-5 content-start">
      {surveyStats.map((stat) => <StatTile stat={stat} />)}
    </div>
  </div>

  <h3 class="mt-16 text-[length:var(--text-h3)] text-gf-text">Grounded in Self-Determination Theory</h3>
  <div class="mt-6 grid gap-5 md:grid-cols-3">
    {sdtPillars.map((p) => (
      <Card>
        <h4 class="font-display text-xl uppercase text-gf-lime">{p.name}</h4>
        <p class="mt-3 text-gf-muted">{p.body}</p>
      </Card>
    ))}
  </div>
</SectionShell>
```

- [ ] **Step 6: Add them to the home page**

Modify `src/pages/index.astro` — add imports and place after `<Stats />`:

```astro
import Features from '../sections/Features.astro';
import Leaderboard from '../sections/Leaderboard.astro';
import Research from '../sections/Research.astro';
```

```astro
  <Features />
  <Leaderboard />
  <Research />
```

- [ ] **Step 7: Verify build and home route**

Run: `npm run build && npx playwright test tests/routes.spec.ts --project=desktop -g "^/ renders"`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add features, leaderboard and research sections"
```

---

## Task 11: Roadmap, About and Contact sections

**Files:**
- Create: `src/content/roadmap.ts`, `src/content/about.ts`, `src/sections/Roadmap.astro`, `src/sections/About.astro`, `src/sections/Contact.astro`

- [ ] **Step 1: Write roadmap.ts**

Phase 2 status is "MVP ready" per spec §5.3. No raise amount appears, per spec §5.5. Status carries a text label as well as a colour, per `DESIGN.md` §9.

```ts
export interface Phase {
  label: string;
  status: 'Done' | 'MVP ready' | 'Next';
  title: string;
  items: string[];
}

export const phases: Phase[] = [
  {
    label: 'Phase 1 — Foundation',
    status: 'Done',
    title: 'Concept validated',
    items: [
      'Working prototype launched',
      'User survey validated the demand',
      'Springer paper peer-reviewed and published',
      'WebSummit Qatar 2026, ALPHA stage',
      'Dubai Create Apps Championship',
      'Full test suite passing',
    ],
  },
  {
    label: 'Phase 2 — MVP',
    status: 'MVP ready',
    title: 'Built, deployed, working',
    items: [
      'MVP live with a server-authoritative economy',
      'AI coaching in production',
      'Subscription payments integrated',
      'Store submission materials prepared',
      'Pre-seed raise open',
      'Hub71 and ADU Innovate applications submitted',
    ],
  },
  {
    label: 'Phase 3 — Scale',
    status: 'Next',
    title: 'Growth',
    items: [
      'Wearable integrations',
      'Corporate wellness B2B',
      'Rewards marketplace live',
      'Seed round ready',
    ],
  },
];
```

- [ ] **Step 2: Write about.ts**

```ts
export const story = [
  'GameFit began with a real problem. At 15, Muhammet Yalkapov managed a fitness club in Ashgabat, Turkmenistan — and watched members drop out week after week. Not because they lacked discipline, but because the system failed them. No personalisation. No motivation loop. No reason to come back.',
  'In 2024, studying IT in Abu Dhabi, he set out to fix it — not just by building an app, but by publishing the science first. The peer-reviewed paper came before the pitch deck.',
  'GameFit is the product of that conviction: a fitness platform grounded in behavioural science, powered by AI, and built to actually keep people moving.',
];

export interface Milestone { year: string; body: string; }

export const timeline: Milestone[] = [
  { year: '2020', body: 'Managed a fitness club in Turkmenistan, age 15. Observed the dropout problem first-hand.' },
  { year: '2023', body: 'Moved to Abu Dhabi. Started BSc IT (Cybersecurity) at Abu Dhabi University.' },
  { year: '2024', body: 'Founded GameFit. Built the first prototype.' },
  { year: '2025', body: 'Co-authored the Springer paper. Dubai Create Apps Championship.' },
  { year: '2026', body: 'WebSummit Qatar ALPHA stage. MVP shipped. Hub71 and ADU Innovate applications.' },
];

export const mission = 'Make fitness as engaging as the best games in the world.';
```

- [ ] **Step 3: Write Roadmap.astro**

```astro
---
import SectionShell from '../components/SectionShell.astro';
import Card from '../components/Card.astro';
import { phases } from '../content/roadmap';

interface Props { as?: 'h1' | 'h2'; }
const { as = 'h2' } = Astro.props;

const statusStyle = {
  'Done': 'border-gf-success/50 bg-gf-success/15 text-gf-success',
  'MVP ready': 'border-gf-lime/50 bg-gf-lime/15 text-gf-lime',
  'Next': 'border-gf-border bg-gf-elevated text-gf-muted',
};
---
<SectionShell id="roadmap" band="surface" eyebrow="Roadmap" title="From prototype to platform." as={as}>
  <p class="mt-6 max-w-[62ch] text-lg text-gf-muted">
    Everything achieved so far was bootstrapped with zero institutional funding.
    Here is where we are going.
  </p>

  <div class="mt-12 grid gap-5 md:grid-cols-3">
    {phases.map((p) => (
      <Card>
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs uppercase tracking-widest text-gf-muted">{p.label}</p>
          <span class={`rounded-full border px-3 py-1 text-xs font-bold ${statusStyle[p.status]}`}>
            {p.status}
          </span>
        </div>
        <h3 class="mt-4 text-[length:var(--text-h3)] text-gf-text">{p.title}</h3>
        <ul class="mt-5 space-y-3">
          {p.items.map((item) => (
            <li class="border-b border-gf-border pb-3 text-sm text-gf-muted last:border-0">{item}</li>
          ))}
        </ul>
      </Card>
    ))}
  </div>
</SectionShell>
```

- [ ] **Step 4: Write About.astro**

Solo-founder framing per spec §5.4. Dr. Al-Rajab appears as academic supervisor, not as team.

```astro
---
import SectionShell from '../components/SectionShell.astro';
import Card from '../components/Card.astro';
import { story, timeline, mission } from '../content/about';
import { site } from '../content/site';

interface Props { as?: 'h1' | 'h2'; }
const { as = 'h2' } = Astro.props;
---
<SectionShell id="about" eyebrow="Our story" title="Built in Abu Dhabi. Scaling to the world." as={as}>
  <div class="mt-10 grid gap-12 lg:grid-cols-2">
    <div class="space-y-5">
      {story.map((p) => <p class="text-gf-muted">{p}</p>)}
    </div>

    <ol class="space-y-6">
      {timeline.map((m) => (
        <li class="border-l-2 border-gf-lime pl-5">
          <p class="font-display text-xl text-gf-lime">{m.year}</p>
          <p class="mt-1 text-sm text-gf-muted">{m.body}</p>
        </li>
      ))}
    </ol>
  </div>

  <div class="mt-16 grid gap-5 lg:grid-cols-2">
    <Card>
      <h3 class="text-[length:var(--text-h3)] text-gf-text">{site.founder}</h3>
      <p class="mt-1 text-sm font-bold text-gf-lime">Founder, GameFit</p>
      <ul class="mt-5 space-y-2 text-sm text-gf-muted">
        <li>{site.location}</li>
        <li>BSc IT (Cybersecurity), Abu Dhabi University</li>
        <li>Lead author, Springer / Scopus ACR&rsquo;26</li>
        <li>WebSummit Qatar 2026 — ALPHA stage</li>
      </ul>
    </Card>

    <Card>
      <h3 class="text-[length:var(--text-h3)] text-gf-text">Academic validation</h3>
      <p class="mt-4 text-gf-muted">
        The research behind GameFit was supervised and validated by
        <strong class="text-gf-text">Dr. Murad Al-Rajab</strong> of Abu Dhabi
        University, who supported the work through to peer-reviewed publication.
      </p>
      <p class="mt-4 text-sm text-gf-muted">
        Additional co-authors are credited in the paper itself, listed in the
        research section.
      </p>
    </Card>
  </div>

  <blockquote class="mt-16 border-l-2 border-gf-lime pl-6">
    <p class="font-display text-[length:var(--text-h2)] uppercase text-gf-lime">{mission}</p>
    <footer class="mt-2 text-sm text-gf-muted">Our mission</footer>
  </blockquote>
</SectionShell>
```

- [ ] **Step 5: Write Contact.astro**

```astro
---
import SectionShell from '../components/SectionShell.astro';
import Card from '../components/Card.astro';
import { site } from '../content/site';
import { paper } from '../content/research';

interface Props { as?: 'h1' | 'h2'; }
const { as = 'h2' } = Astro.props;

const channels = [
  { label: site.email, body: 'For investment, partnerships or general enquiries', href: `mailto:${site.email}`, external: false },
  { label: 'LinkedIn', body: 'Connect with the founder', href: site.linkedin, external: true },
  { label: 'Read the research', body: 'The peer-reviewed paper behind GameFit', href: paper.doiUrl, external: true },
  { label: 'Try the live app', body: 'See the product working', href: site.appUrl, external: true },
];
---
<SectionShell id="contact" band="surface" eyebrow="Get in touch" title="Let's build together." as={as}>
  <div class="mt-12 grid gap-5 md:grid-cols-2">
    {channels.map((c) => (
      <Card>
        <a
          href={c.href}
          rel={c.external ? 'noopener noreferrer' : undefined}
          target={c.external ? '_blank' : undefined}
          class="font-bold text-gf-lime underline underline-offset-4"
        >
          {c.label}
        </a>
        <p class="mt-2 text-sm text-gf-muted">{c.body}</p>
      </Card>
    ))}
  </div>
</SectionShell>
```

- [ ] **Step 6: Complete the home page**

`src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../sections/Hero.astro';
import Stats from '../sections/Stats.astro';
import Features from '../sections/Features.astro';
import Leaderboard from '../sections/Leaderboard.astro';
import Research from '../sections/Research.astro';
import Roadmap from '../sections/Roadmap.astro';
import About from '../sections/About.astro';
import Contact from '../sections/Contact.astro';
import { sections } from '../content/sections';

const hero = sections.find((s) => s.id === 'hero')!;
---
<BaseLayout title={hero.metaTitle} description={hero.metaDescription} path="/">
  <Hero />
  <Stats />
  <Features />
  <Leaderboard />
  <Research />
  <Roadmap />
  <About />
  <Contact />
</BaseLayout>
```

- [ ] **Step 7: Verify**

Run: `npm run build && npx playwright test tests/routes.spec.ts --project=desktop -g "^/ renders"`
Expected: PASS, still exactly one `<h1>`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add roadmap, about and contact sections; complete home page"
```

---

## Task 12: Standalone section routes

Each routed section becomes its own page with its own metadata, rendering the same component with `as="h1"`.

**Files:**
- Create: `src/pages/stats.astro`, `features.astro`, `leaderboard.astro`, `research.astro`, `roadmap.astro`, `about.astro`, `contact.astro`, `404.astro`

- [ ] **Step 1: Write stats.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Stats from '../sections/Stats.astro';
import { sections } from '../content/sections';
const meta = sections.find((s) => s.id === 'stats')!;
---
<BaseLayout title={meta.metaTitle} description={meta.metaDescription} path="/stats">
  <Stats as="h1" />
  <div class="mx-auto max-w-[var(--container-site)] px-[clamp(1.25rem,5vw,4rem)] pb-24">
    <a href="/" class="text-sm text-gf-lime underline underline-offset-4">← Back to the full picture</a>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Write the remaining six route pages**

Identical shape. For each, substitute the section id, component and path.

`src/pages/features.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Features from '../sections/Features.astro';
import { sections } from '../content/sections';
const meta = sections.find((s) => s.id === 'features')!;
---
<BaseLayout title={meta.metaTitle} description={meta.metaDescription} path="/features">
  <Features as="h1" />
  <div class="mx-auto max-w-[var(--container-site)] px-[clamp(1.25rem,5vw,4rem)] pb-24">
    <a href="/" class="text-sm text-gf-lime underline underline-offset-4">← Back to the full picture</a>
  </div>
</BaseLayout>
```

`src/pages/leaderboard.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Leaderboard from '../sections/Leaderboard.astro';
import { sections } from '../content/sections';
const meta = sections.find((s) => s.id === 'leaderboard')!;
---
<BaseLayout title={meta.metaTitle} description={meta.metaDescription} path="/leaderboard">
  <Leaderboard as="h1" />
  <div class="mx-auto max-w-[var(--container-site)] px-[clamp(1.25rem,5vw,4rem)] pb-24">
    <a href="/" class="text-sm text-gf-lime underline underline-offset-4">← Back to the full picture</a>
  </div>
</BaseLayout>
```

`src/pages/research.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Research from '../sections/Research.astro';
import { sections } from '../content/sections';
const meta = sections.find((s) => s.id === 'research')!;
---
<BaseLayout title={meta.metaTitle} description={meta.metaDescription} path="/research">
  <Research as="h1" />
  <div class="mx-auto max-w-[var(--container-site)] px-[clamp(1.25rem,5vw,4rem)] pb-24">
    <a href="/" class="text-sm text-gf-lime underline underline-offset-4">← Back to the full picture</a>
  </div>
</BaseLayout>
```

`src/pages/roadmap.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Roadmap from '../sections/Roadmap.astro';
import { sections } from '../content/sections';
const meta = sections.find((s) => s.id === 'roadmap')!;
---
<BaseLayout title={meta.metaTitle} description={meta.metaDescription} path="/roadmap">
  <Roadmap as="h1" />
  <div class="mx-auto max-w-[var(--container-site)] px-[clamp(1.25rem,5vw,4rem)] pb-24">
    <a href="/" class="text-sm text-gf-lime underline underline-offset-4">← Back to the full picture</a>
  </div>
</BaseLayout>
```

`src/pages/about.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import About from '../sections/About.astro';
import { sections } from '../content/sections';
const meta = sections.find((s) => s.id === 'about')!;
---
<BaseLayout title={meta.metaTitle} description={meta.metaDescription} path="/about">
  <About as="h1" />
  <div class="mx-auto max-w-[var(--container-site)] px-[clamp(1.25rem,5vw,4rem)] pb-24">
    <a href="/" class="text-sm text-gf-lime underline underline-offset-4">← Back to the full picture</a>
  </div>
</BaseLayout>
```

`src/pages/contact.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Contact from '../sections/Contact.astro';
import { sections } from '../content/sections';
const meta = sections.find((s) => s.id === 'contact')!;
---
<BaseLayout title={meta.metaTitle} description={meta.metaDescription} path="/contact">
  <Contact as="h1" />
  <div class="mx-auto max-w-[var(--container-site)] px-[clamp(1.25rem,5vw,4rem)] pb-24">
    <a href="/" class="text-sm text-gf-lime underline underline-offset-4">← Back to the full picture</a>
  </div>
</BaseLayout>
```

- [ ] **Step 3: Write 404.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Page not found — GameFit" description="That page does not exist." path="/404">
  <section class="mx-auto max-w-[var(--container-narrow)] px-[clamp(1.25rem,5vw,4rem)] py-32 text-center">
    <h1 class="text-[length:var(--text-h1)] text-gf-lime">Page not found</h1>
    <p class="mt-6 text-gf-muted">That page does not exist. It may have moved.</p>
    <a href="/" class="mt-8 inline-block rounded-[var(--radius-md)] bg-gf-lime px-7 py-3.5 font-bold text-gf-bg">
      Back to home
    </a>
  </section>
</BaseLayout>
```

- [ ] **Step 4: Verify all section routes pass**

Run: `npx playwright test tests/routes.spec.ts --project=desktop`
Expected: PASS for `/`, `/stats`, `/features`, `/leaderboard`, `/research`, `/roadmap`, `/about`, `/contact`. FAIL for `/beta`, `/feedback`, `/privacy` — those arrive in Tasks 13 and 15.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add deep-linkable section routes and 404 page"
```

---

## Task 13: Form submission library and waitlist form

**Files:**
- Create: `src/lib/submitForm.ts`, `src/islands/WaitlistForm.tsx`, `src/pages/beta.astro`
- Test: `tests/forms.spec.ts`

- [ ] **Step 1: Write the failing form test**

`tests/forms.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('waitlist form', () => {
  test('rejects an invalid email without submitting', async ({ page }) => {
    await page.goto('/beta');
    await page.getByLabel('Email address').fill('not-an-email');
    await page.getByRole('button', { name: /join the waitlist/i }).click();
    await expect(page.getByText(/enter a valid email/i)).toBeVisible();
  });

  test('honeypot field is present and hidden from users', async ({ page }) => {
    await page.goto('/beta');
    const honeypot = page.locator('input[name="botcheck"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toBeHidden();
  });

  test('shows a success state when the API succeeds', async ({ page }) => {
    await page.route('https://api.web3forms.com/submit', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
    );
    await page.goto('/beta');
    await page.getByLabel('Email address').fill('test@example.com');
    await page.getByRole('button', { name: /join the waitlist/i }).click();
    await expect(page.getByRole('status')).toContainText(/you.re on the list/i);
  });

  test('shows an error state with a mailto fallback when the API fails', async ({ page }) => {
    await page.route('https://api.web3forms.com/submit', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false }) })
    );
    await page.goto('/beta');
    await page.getByLabel('Email address').fill('test@example.com');
    await page.getByRole('button', { name: /join the waitlist/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert').getByRole('link')).toHaveAttribute('href', /^mailto:/);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx playwright test tests/forms.spec.ts --project=desktop`
Expected: FAIL — `/beta` returns 404.

- [ ] **Step 3: Write submitForm.ts**

```ts
const ENDPOINT = 'https://api.web3forms.com/submit';
const MIN_INTERVAL_MS = 30_000;

let lastSubmitAt = 0;

export interface SubmitResult {
  ok: boolean;
  error?: 'rate-limited' | 'network' | 'rejected';
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export async function submitForm(fields: Record<string, string>): Promise<SubmitResult> {
  if (fields.botcheck) return { ok: true };

  const now = Date.now();
  if (now - lastSubmitAt < MIN_INTERVAL_MS) return { ok: false, error: 'rate-limited' };

  const accessKey = import.meta.env.PUBLIC_WEB3FORMS_KEY;
  if (!accessKey) return { ok: false, error: 'rejected' };

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: accessKey, ...fields }),
    });
    if (!res.ok) return { ok: false, error: 'rejected' };
    const data = await res.json();
    if (!data.success) return { ok: false, error: 'rejected' };
    lastSubmitAt = now;
    return { ok: true };
  } catch {
    return { ok: false, error: 'network' };
  }
}
```

The honeypot returns `ok: true` deliberately. A bot that fills it gets a success screen and never learns it was filtered.

- [ ] **Step 4: Write WaitlistForm.tsx**

```tsx
import { useState } from 'react';
import { submitForm, isValidEmail } from '../lib/submitForm';

const CONTACT_EMAIL = 'team.gamefit@gmail.com';

export default function WaitlistForm() {
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '');

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setState('submitting');

    const result = await submitForm({
      subject: 'New GameFit waitlist signup',
      from_name: 'GameFit waitlist',
      email,
      name: String(form.get('name') ?? ''),
      what_would_help: String(form.get('what_would_help') ?? ''),
      botcheck: String(form.get('botcheck') ?? ''),
    });

    setState(result.ok ? 'success' : 'error');
  }

  if (state === 'success') {
    return (
      <div role="status" className="rounded-[var(--radius-lg)] border border-gf-lime/40 bg-gf-lime/10 p-8">
        <h2 className="font-display text-2xl uppercase text-gf-lime">You&rsquo;re on the list</h2>
        <p className="mt-3 text-gf-muted">
          We&rsquo;ll email you when the beta opens. In the meantime, tell us what would
          make GameFit worth using.
        </p>
        <a href="/feedback" className="mt-5 inline-block text-sm text-gf-lime underline underline-offset-4">
          Share feedback →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div>
        <label htmlFor="email" className="block text-sm font-bold text-gf-text">Email address</label>
        <input
          id="email" name="email" type="email" required autoComplete="email"
          aria-invalid={emailError ? 'true' : undefined}
          aria-describedby={emailError ? 'email-error' : undefined}
          className="mt-2 h-12 w-full rounded-[var(--radius-sm)] border border-gf-border bg-gf-elevated px-4 text-base text-gf-text"
        />
        {emailError && (
          <p id="email-error" aria-live="polite" className="mt-2 text-sm text-gf-error">{emailError}</p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-bold text-gf-text">
          Name <span className="font-normal text-gf-muted">(optional)</span>
        </label>
        <input
          id="name" name="name" type="text" autoComplete="name"
          className="mt-2 h-12 w-full rounded-[var(--radius-sm)] border border-gf-border bg-gf-elevated px-4 text-base text-gf-text"
        />
      </div>

      <div>
        <label htmlFor="what_would_help" className="block text-sm font-bold text-gf-text">
          What would make you actually stick with a fitness app?{' '}
          <span className="font-normal text-gf-muted">(optional)</span>
        </label>
        <textarea
          id="what_would_help" name="what_would_help" rows={4}
          className="mt-2 w-full rounded-[var(--radius-sm)] border border-gf-border bg-gf-elevated p-4 text-base text-gf-text"
        />
      </div>

      <button
        type="submit" disabled={state === 'submitting'}
        className="h-12 w-full rounded-[var(--radius-md)] bg-gf-lime px-6 font-bold text-gf-bg disabled:opacity-60 sm:w-auto"
      >
        {state === 'submitting' ? 'Joining…' : 'Join the waitlist'}
      </button>

      {state === 'error' && (
        <div role="alert" className="rounded-[var(--radius-sm)] border border-gf-error/50 bg-gf-error/10 p-4 text-sm text-gf-text">
          Something went wrong sending that. Email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-gf-lime underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>{' '}
          and we&rsquo;ll add you manually.
        </div>
      )}
    </form>
  );
}
```

- [ ] **Step 5: Write beta.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import WaitlistForm from '../islands/WaitlistForm';
---
<BaseLayout
  title="Join the GameFit Waitlist"
  description="Be first in when the GameFit beta opens. AI coaching, avatar evolution and social competition that actually keeps you training."
  path="/beta"
>
  <section class="mx-auto max-w-[var(--container-narrow)] px-[clamp(1.25rem,5vw,4rem)] py-24">
    <p class="text-xs font-bold uppercase tracking-[0.12em] text-gf-lime">Beta access</p>
    <h1 class="mt-4 text-[length:var(--text-h1)] text-gf-text">Get in early.</h1>
    <p class="mt-6 text-lg text-gf-muted">
      We&rsquo;re opening GameFit to a first group of testers. Join the list and
      we&rsquo;ll email you the moment there&rsquo;s a spot.
    </p>
    <div class="mt-12">
      <WaitlistForm client:load />
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 6: Verify the form tests pass**

Run: `npx playwright test tests/forms.spec.ts --project=desktop`
Expected: all four PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add waitlist form with honeypot, rate limit and mailto fallback"
```

---

## Task 14: Feedback form, privacy page, content guard test

**Files:**
- Create: `src/islands/FeedbackForm.tsx`, `src/pages/feedback.astro`, `src/pages/privacy.astro`, `tests/content.spec.ts`

- [ ] **Step 1: Write the content guard test**

This test exists so the corrections in spec §5.2 cannot silently regress. If someone pastes old marketing copy back in, the build fails.

`tests/content.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { ROUTES } from './routes.spec';

const BANNED = [
  { pattern: /OpenAI/i, why: 'The app calls Anthropic Claude, not OpenAI (spec §5.2)' },
  { pattern: /GPT-4/i, why: 'The app calls Anthropic Claude, not GPT-4 (spec §5.2)' },
  { pattern: /3D character|3D avatar/i, why: 'The avatar system is layered 2D SVG (spec §5.2)' },
  { pattern: /88%/, why: 'The survey figure is 78%, not 88% (spec §5.2)' },
  { pattern: /\$100K|100,000/i, why: 'No raise amount may appear publicly (spec §5.5)' },
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
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx playwright test tests/content.spec.ts --project=desktop`
Expected: FAIL — `/feedback` and `/privacy` 404.

- [ ] **Step 3: Write FeedbackForm.tsx**

```tsx
import { useState } from 'react';
import { submitForm, isValidEmail } from '../lib/submitForm';

const CONTACT_EMAIL = 'team.gamefit@gmail.com';
const RATINGS = [1, 2, 3, 4, 5];

export default function FeedbackForm() {
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const works = String(form.get('what_works') ?? '').trim();
    const missing = String(form.get('what_missing') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();

    if (!works && !missing) {
      setError('Tell us at least one thing — what works, or what is missing.');
      return;
    }
    if (email && !isValidEmail(email)) {
      setError('That email address does not look right.');
      return;
    }
    setError('');
    setState('submitting');

    const result = await submitForm({
      subject: 'New GameFit feedback',
      from_name: 'GameFit feedback',
      rating: String(form.get('rating') ?? 'not given'),
      what_works: works,
      what_missing: missing,
      email: email || 'not given',
      botcheck: String(form.get('botcheck') ?? ''),
    });

    setState(result.ok ? 'success' : 'error');
  }

  if (state === 'success') {
    return (
      <div role="status" className="rounded-[var(--radius-lg)] border border-gf-lime/40 bg-gf-lime/10 p-8">
        <h2 className="font-display text-2xl uppercase text-gf-lime">Thank you</h2>
        <p className="mt-3 text-gf-muted">
          Genuinely useful. Every piece of this gets read.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <fieldset>
        <legend className="text-sm font-bold text-gf-text">Overall, how does GameFit feel?</legend>
        <div className="mt-3 flex gap-2">
          {RATINGS.map((n) => (
            <label key={n} className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-gf-border bg-gf-elevated text-gf-text has-[:checked]:border-gf-lime has-[:checked]:text-gf-lime">
              <input type="radio" name="rating" value={n} className="sr-only" />
              {n}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="what_works" className="block text-sm font-bold text-gf-text">What works?</label>
        <textarea id="what_works" name="what_works" rows={4}
          className="mt-2 w-full rounded-[var(--radius-sm)] border border-gf-border bg-gf-elevated p-4 text-base text-gf-text" />
      </div>

      <div>
        <label htmlFor="what_missing" className="block text-sm font-bold text-gf-text">What&rsquo;s missing?</label>
        <textarea id="what_missing" name="what_missing" rows={4}
          className="mt-2 w-full rounded-[var(--radius-sm)] border border-gf-border bg-gf-elevated p-4 text-base text-gf-text" />
      </div>

      <div>
        <label htmlFor="fb-email" className="block text-sm font-bold text-gf-text">
          Email <span className="font-normal text-gf-muted">(optional, if you want a reply)</span>
        </label>
        <input id="fb-email" name="email" type="email" autoComplete="email"
          className="mt-2 h-12 w-full rounded-[var(--radius-sm)] border border-gf-border bg-gf-elevated px-4 text-base text-gf-text" />
      </div>

      {error && <p aria-live="polite" className="text-sm text-gf-error">{error}</p>}

      <button type="submit" disabled={state === 'submitting'}
        className="h-12 w-full rounded-[var(--radius-md)] bg-gf-lime px-6 font-bold text-gf-bg disabled:opacity-60 sm:w-auto">
        {state === 'submitting' ? 'Sending…' : 'Send feedback'}
      </button>

      {state === 'error' && (
        <div role="alert" className="rounded-[var(--radius-sm)] border border-gf-error/50 bg-gf-error/10 p-4 text-sm text-gf-text">
          That didn&rsquo;t send. Email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-gf-lime underline underline-offset-4">{CONTACT_EMAIL}</a>{' '}
          instead.
        </div>
      )}
    </form>
  );
}
```

- [ ] **Step 4: Write feedback.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import FeedbackForm from '../islands/FeedbackForm';
---
<BaseLayout
  title="Share Feedback — GameFit"
  description="Tell us what works and what is missing. Every piece of feedback shapes what gets built next."
  path="/feedback"
>
  <section class="mx-auto max-w-[var(--container-narrow)] px-[clamp(1.25rem,5vw,4rem)] py-24">
    <p class="text-xs font-bold uppercase tracking-[0.12em] text-gf-lime">Feedback</p>
    <h1 class="mt-4 text-[length:var(--text-h1)] text-gf-text">Tell us what&rsquo;s wrong.</h1>
    <p class="mt-6 text-lg text-gf-muted">
      Praise is nice. Specific criticism is more useful. What would stop you using this?
    </p>
    <div class="mt-12">
      <FeedbackForm client:load />
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 5: Write privacy.astro**

Required because the site collects email addresses. Content is honest about exactly what happens to them.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { site } from '../content/site';
---
<BaseLayout
  title="Privacy — GameFit"
  description="What GameFit collects on this website, why, and how to have it removed."
  path="/privacy"
>
  <section class="mx-auto max-w-[var(--container-narrow)] px-[clamp(1.25rem,5vw,4rem)] py-24">
    <h1 class="text-[length:var(--text-h1)] text-gf-text">Privacy</h1>
    <p class="mt-4 text-sm text-gf-muted">Last updated: 7 August 2026</p>

    <div class="mt-10 space-y-8 text-gf-muted">
      <div>
        <h2 class="text-[length:var(--text-h3)] text-gf-text">What this site collects</h2>
        <p class="mt-3">
          Only what you type into a form. If you join the waitlist, that is your
          email address and optionally your name and answer. If you send feedback,
          it is your rating, your comments and optionally your email.
        </p>
      </div>

      <div>
        <h2 class="text-[length:var(--text-h3)] text-gf-text">What it does not collect</h2>
        <p class="mt-3">
          There is no analytics, no advertising, no tracking pixels and no
          third-party scripts on this website. It sets no cookies. Fonts are served
          from this domain, not from a third party, so no external service is told
          that you visited.
        </p>
      </div>

      <div>
        <h2 class="text-[length:var(--text-h3)] text-gf-text">Where submissions go</h2>
        <p class="mt-3">
          Form submissions are delivered by Web3Forms, which emails them to us and
          does not retain them. We store them in our email. We do not sell or share
          them.
        </p>
      </div>

      <div>
        <h2 class="text-[length:var(--text-h3)] text-gf-text">Removing your data</h2>
        <p class="mt-3">
          Email <a href={`mailto:${site.email}`} class="text-gf-lime underline underline-offset-4">{site.email}</a>
          and we will delete your details. No account needed, no form to fill in.
        </p>
      </div>

      <div>
        <h2 class="text-[length:var(--text-h3)] text-gf-text">The GameFit app</h2>
        <p class="mt-3">
          This page covers this website only. The GameFit application has its own
          privacy policy covering accounts and workout data.
        </p>
      </div>
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 6: Verify route, form and content tests all pass**

Run: `npx playwright test --project=desktop`
Expected: all PASS across `routes`, `forms` and `content` specs.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add feedback form, privacy page and content regression guard"
```

---

## Task 15: Accessibility verification

**Files:**
- Create: `tests/a11y.spec.ts`

- [ ] **Step 1: Write the axe test**

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROUTES } from './routes.spec';

for (const route of ROUTES) {
  test(`${route} has no accessibility violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const summary = results.violations.map(
      (v) => `${v.id} (${v.impact}) — ${v.nodes.length} node(s): ${v.help}`
    );
    expect(summary, `violations on ${route}`).toEqual([]);
  });
}

test('mobile menu traps focus and closes on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: /open menu/i }).click();
  const dialog = page.getByRole('dialog', { name: /navigation/i });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('skip link is the first focusable element', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText(/skip to content/i);
});
```

- [ ] **Step 2: Run it**

Run: `npx playwright test tests/a11y.spec.ts --project=desktop`
Expected: initially may FAIL. Fix every violation reported — do not suppress rules. The most likely failures are colour contrast on muted text over the surface band, and a missing accessible name on an icon-only button.

- [ ] **Step 3: Re-run until clean**

Run: `npx playwright test tests/a11y.spec.ts`
Expected: PASS on both desktop and mobile projects.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: add axe accessibility coverage for every route"
```

---

## Task 16: Security headers and SEO files

**Files:**
- Create: `vercel.json`, `public/robots.txt`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Write vercel.json**

`connect-src` allows the Web3Forms endpoint and nothing else. `script-src 'self'` is possible because Astro emits external scripts rather than inline ones; if a build ever inlines a script, the header must be revisited rather than loosened with `unsafe-inline`.

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.web3forms.com; form-action 'self' https://api.web3forms.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'"
        },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    },
    {
      "source": "/fonts/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

`style-src` includes `'unsafe-inline'` because Astro's scoped component styles are emitted inline. This is a known and accepted trade-off; it does not permit script execution.

- [ ] **Step 2: Write robots.txt**

```
User-agent: *
Allow: /

Sitemap: https://REPLACE_WITH_SITE_URL/sitemap-index.xml
```

Replace the host at deploy time from `PUBLIC_SITE_URL`, or edit once the domain is chosen. The sitemap itself is generated by `@astrojs/sitemap`, already wired in Task 1.

- [ ] **Step 3: Verify the sitemap is generated**

Run: `npm run build && ls dist/sitemap*`
Expected: `dist/sitemap-index.xml` and `dist/sitemap-0.xml`.

- [ ] **Step 4: Verify no inline scripts would violate CSP**

Run: `grep -o '<script[^>]*>' dist/index.html`
Expected: every `<script>` tag has a `src` attribute. Any bare `<script>` with inline content will be blocked by `script-src 'self'` — if one appears, move it to a module file rather than weakening the header.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add strict security headers, robots.txt and sitemap"
```

---

## Task 17: Brand assets and Open Graph image

**Files:**
- Create: `public/favicon-16.png`, `public/favicon-32.png`, `public/og-image.png`

- [ ] **Step 1: Copy the existing brand assets from the app repo**

The app repo already has generated brand assets from `scripts/generate-brand-assets.mjs`.

```bash
cp "D:/GameFit Claude-Base44/public/favicon-16.png" public/
cp "D:/GameFit Claude-Base44/public/favicon-32.png" public/
cp "D:/GameFit Claude-Base44/public/og-image.png" public/
```

- [ ] **Step 2: Verify the OG image dimensions**

```bash
node -e "const s=require('sharp');s('public/og-image.png').metadata().then(m=>console.log(m.width+'x'+m.height))"
```

Expected: `1200x630`. If it differs, the `og:image:width` and `og:image:height` tags in `Head.astro` must be corrected to match, or link previews will render cropped.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add favicons and Open Graph image"
```

---

## Task 18: Product screenshots

**Files:**
- Create: `public/screens/*.webp`, `src/components/DeviceFrame.astro`
- Modify: `src/sections/Features.astro`

- [ ] **Step 1: Regenerate the screenshots from the running app**

The existing captures in the app repo are stale. Its Supabase project is healthy again as of 2026-08-07, so the capture script can run.

```bash
cd "D:/GameFit Claude-Base44"
npm run build
node scripts/store-screenshots.mjs
```

Expected: fresh PNGs in `store-assets/appstore/`. If the script fails — for example if the QA account no longer authenticates — stop and report it rather than shipping stale images silently. Falling back to the existing captures is acceptable, but it must be stated, per spec §9.

- [ ] **Step 2: Convert to WebP at two widths**

```bash
cd "D:/gamefit-web"
mkdir -p public/screens
node -e "
const sharp = require('sharp');
const fs = require('fs');
const src = 'D:/GameFit Claude-Base44/store-assets/appstore';
for (const f of fs.readdirSync(src).filter(f => f.endsWith('.png'))) {
  const name = f.replace(/^\d+-/, '').replace('.png', '');
  for (const w of [420, 840]) {
    sharp(src + '/' + f).resize({ width: w }).webp({ quality: 82 })
      .toFile('public/screens/' + name + '-' + w + '.webp');
  }
}
"
```

- [ ] **Step 3: Verify file sizes**

Run: `ls -la public/screens/`
Expected: each 420px file under 60 KB, each 840px file under 160 KB. Anything larger will breach the performance budget in `DESIGN.md` §10.

- [ ] **Step 4: Write DeviceFrame.astro**

Explicit `width` and `height` prevent layout shift, per `DESIGN.md` §8.

```astro
---
interface Props { name: string; alt: string; }
const { name, alt } = Astro.props;
---
<div class="overflow-hidden rounded-[var(--radius-lg)] border border-gf-border bg-gf-surface">
  <img
    src={`/screens/${name}-420.webp`}
    srcset={`/screens/${name}-420.webp 420w, /screens/${name}-840.webp 840w`}
    sizes="(max-width: 768px) 90vw, 420px"
    width="420"
    height="910"
    loading="lazy"
    decoding="async"
    alt={alt}
    class="block w-full"
  />
</div>
```

- [ ] **Step 5: Add a screenshot to the Features section**

In `src/sections/Features.astro`, add the import and place the frame after the feature grid:

```astro
import DeviceFrame from '../components/DeviceFrame.astro';
```

```astro
  <div class="mt-16 grid gap-8 md:grid-cols-3">
    <DeviceFrame name="dashboard" alt="The GameFit dashboard showing rank, XP progress toward the next level, weekly goal and streak calendar" />
    <DeviceFrame name="coach" alt="The AI coach screen with a personalised workout plan" />
    <DeviceFrame name="leaderboard" alt="The weekly leaderboard with ranked players and their XP totals" />
  </div>
```

- [ ] **Step 6: Verify no layout shift**

Run: `npx playwright test tests/routes.spec.ts --project=mobile -g "features"`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add optimised product screenshots in device frames"
```

---

## Task 19: Responsive verification and performance budget

**Files:**
- Create: `tests/responsive.spec.ts`

- [ ] **Step 1: Write the responsive test**

The horizontal-overflow assertion catches the single most common responsive bug: an element wider than the viewport causing sideways scroll on phones.

```ts
import { test, expect } from '@playwright/test';
import { ROUTES } from './routes.spec';

const WIDTHS = [375, 768, 1440];

for (const width of WIDTHS) {
  for (const route of ROUTES) {
    test(`${route} has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      expect(overflow, `${route} scrolls horizontally at ${width}px`).toBe(false);
    });
  }
}

test('home page ships under the JavaScript budget', async ({ page }) => {
  let jsBytes = 0;
  page.on('response', async (res) => {
    if (res.url().endsWith('.js') && res.status() === 200) {
      try { jsBytes += (await res.body()).length; } catch { /* ignore */ }
    }
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(jsBytes, `home page JS is ${Math.round(jsBytes / 1024)} KB uncompressed`).toBeLessThan(120_000);
});
```

The 120 KB uncompressed threshold corresponds to roughly the 30 KB gzipped budget in `DESIGN.md` §10.

- [ ] **Step 2: Run the full suite**

Run: `npx playwright test`
Expected: all PASS on both projects.

- [ ] **Step 3: Capture review screenshots**

```bash
npx playwright screenshot --viewport-size=375,900 --full-page http://localhost:4321/ review-mobile.png
npx playwright screenshot --viewport-size=1440,900 --full-page http://localhost:4321/ review-desktop.png
```

Inspect both before proceeding. Do not report the site as finished without looking at them.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: add responsive overflow and JavaScript budget checks"
```

---

## Task 20: README and deployment

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README.md**

```markdown
# GameFit Web

Marketing site for GameFit. Astro, static output, deployed on Vercel.

## Running locally

```bash
npm install
cp .env.example .env   # fill in PUBLIC_WEB3FORMS_KEY
npm run dev
```

Requires Node 22.12 or newer.

## Changing content without touching components

All copy and figures live in `src/content/`:

| File | Contains |
|---|---|
| `site.ts` | Name, tagline, email, links |
| `stats.ts` | Every statistic. Each needs a `source` |
| `features.ts` | The three feature cards |
| `research.ts` | Paper details, DOI, SDT pillars |
| `roadmap.ts` | The three phases |
| `about.ts` | Founder story, timeline, mission |
| `sections.ts` | Section titles, routes, page metadata |

Edit the value, run `npm run build`, done.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Full Playwright suite |
| `npm run test:a11y` | Accessibility only |

## Rules the tests enforce

`tests/content.spec.ts` fails the build if the site ever claims OpenAI, GPT-4,
a 3D avatar, an 88% survey figure, a fundraising amount, or a sample size.
These are deliberate constraints, documented in
`docs/specs/2026-08-07-marketing-site-design.md` §5. If a test fails, fix the
copy — do not delete the test.

## Design

`DESIGN.md` is the design system. `src/styles/tokens.css` holds the actual
values. If they disagree, the CSS wins and the document is the bug.
```

- [ ] **Step 2: Set the production site URL**

Once the domain is chosen, set `PUBLIC_SITE_URL` in the Vercel project's environment variables and update the host in `public/robots.txt`. Until then the site builds against localhost, which only affects canonical URLs and the sitemap.

- [ ] **Step 3: Deploy**

```bash
git add -A
git commit -m "docs: add README with content-editing guide"
```

Then create the Vercel project pointing at this repository. Framework preset: Astro. Build command `npm run build`, output directory `dist`. Add `PUBLIC_WEB3FORMS_KEY` as an environment variable.

- [ ] **Step 4: Verify the deployment for real**

```bash
curl -sI https://<deployment-url>/ | grep -iE 'content-security-policy|strict-transport'
```

Expected: both headers present. Then load the site, submit a real waitlist entry, and confirm the email arrives.

Note: Vercel's edge caches aggressively. When checking a fresh deploy, verify against the deployment-specific URL rather than the production alias, or a cached response will make a successful deploy look like a failed one.

- [ ] **Step 5: Set the Web3Forms domain restriction**

In the Web3Forms dashboard, restrict the access key to the production hostname. Until this is done the key works from any origin, which is what makes it abusable. This is the last security step and must not be skipped.

---

## Self-Review

**Spec coverage:**

| Spec section | Covered by |
|---|---|
| §2 scope — routes, forms, design system, security, verification | Tasks 12, 13, 14, 16, 19 |
| §3 stack | Task 1 |
| §4 information architecture | Tasks 5, 11, 12 |
| §4 localisation | **Deferred to plan 2, by design** |
| §5.1 content as data with sources | Task 5 |
| §5.2 corrections | Tasks 10, 11 content files; guarded by Task 14 |
| §5.3 roadmap MVP ready | Task 11 |
| §5.4 solo founder | Task 11 |
| §5.5 excluded information | Guarded by Task 14 |
| §6 forms, four states, honeypot, rate limit, fallback | Tasks 13, 14 |
| §7 security | Task 16 |
| §8 performance and accessibility | Tasks 15, 19 |
| §9 screenshots | Task 18 |
| §10 verification | Tasks 4, 15, 19 |

**Placeholder scan:** No TBD, TODO, "handle errors appropriately" or "similar to Task N". Two intentional substitutions are flagged inline with explicit instructions: the robots.txt host (Task 16 Step 2) and the Vercel deployment URL (Task 20 Step 4).

**Type consistency:** `Stat`, `Feature`, `Phase`, `Milestone`, `Pillar`, `SectionMeta` and `SubmitResult` are each defined once and imported where used. `submitForm` and `isValidEmail` have one signature, used identically by both form islands. The `as` prop is `'h1' | 'h2'` in every section component and in `SectionShell`.

**Known gap accepted:** `tests/content.spec.ts` imports `ROUTES` from `routes.spec.ts`. Playwright permits this, but if the export is later moved, three test files break together. Acceptable — one shared route list is better than three that drift.

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-08-07-marketing-site-english.md`.
