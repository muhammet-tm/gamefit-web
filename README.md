# GameFit Web

Marketing site for [GameFit](https://gamefit-app.vercel.app) — a fitness app
built as an RPG. Astro, static output, deployed on Vercel.

## Running locally

```bash
npm install
cp .env.example .env   # then fill in PUBLIC_WEB3FORMS_KEY
npm run dev
```

Requires Node 22.12 or newer.

## Changing content without touching components

Every piece of copy and every number lives in `src/content/`. Edit the value,
run `npm run build`, done — no component work.

| File | Holds |
|---|---|
| `site.ts` | Name, tagline, contact email, links |
| `sections.ts` | Section titles, routes, and each page's title and description |
| `stats.ts` | Every statistic. Each one needs a `source` |
| `features.ts` | The three feature cards |
| `research.ts` | Paper title, authors, DOI, the SDT pillars |
| `roadmap.ts` | The three phases and their status |
| `about.ts` | Founder story, timeline, mission |

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build, then regenerates the CSP |
| `npm run preview` | Serve the production build |
| `npm test` | Full Playwright suite, 191 tests |
| `npm run test:a11y` | Accessibility only |
| `npm run check` | TypeScript and Astro diagnostics |

## What the tests enforce

These are not decoration. Several encode decisions that are easy to undo by
accident.

**`content.spec.ts` fails the build if the site ever claims** OpenAI, GPT-4, a
3D avatar, an 88% survey figure, a fundraising amount, or a sample size. Each
was a real inaccuracy on the previous version of this site. The reasoning is
in `docs/specs/2026-08-07-marketing-site-design.md` §5.2. **If one of these
fails, fix the copy — do not delete the test.**

**`csp.spec.ts` loads every page under the real `vercel.json` headers.**
`vercel.json` never applies locally, so without this the Content-Security-
Policy would first be exercised in production. It has already caught two
faults that would have taken the site down.

**`a11y.spec.ts`** runs axe against every route and allows zero violations.

**`responsive.spec.ts`** checks no page scrolls sideways at 375, 768 or
1440px, and asserts the JavaScript and CSS budgets from `DESIGN.md` §10.

**`anchors.spec.ts`** checks every in-page anchor leaves its section readable
rather than tucked under the sticky header.

## The Content-Security-Policy is generated, not written

`scripts/generate-csp.mjs` runs after every build. It hashes each inline
script Astro emits — the island hydration bootstrap, the header scroll
listener, the JSON-LD block — and writes those hashes into `vercel.json`.

Do not hand-edit the `Content-Security-Policy` value; it will be overwritten
on the next build. To change the policy, edit the script.

Do not add `'unsafe-inline'` to `script-src` to make something work. That
disables the protection the policy exists to provide. Add a hash instead.

## Before going live

1. Set `PUBLIC_SITE_URL` in the Vercel project to the real domain. It feeds
   canonical URLs, the sitemap and Open Graph tags.
2. Update the `Sitemap:` line in `public/robots.txt` to match.
3. **Restrict the Web3Forms key to the production domain** in the Web3Forms
   dashboard. The key is public by design and ships in the page source; the
   domain restriction is the only thing stopping anyone using it from
   elsewhere. This is the last security step and it is not optional.

## Design

`DESIGN.md` is the design system — colour with measured contrast ratios,
type, spacing, motion, components, accessibility and performance budgets.

`src/styles/tokens.css` holds the actual values as a Tailwind 4 `@theme`
block. If the two disagree, the CSS is correct and the document is the bug.

## Documents

| Path | What it is |
|---|---|
| `DESIGN.md` | The design system |
| `docs/specs/2026-08-07-marketing-site-design.md` | What was built and why |
| `docs/plans/2026-08-07-marketing-site-english.md` | How it was built, task by task |
