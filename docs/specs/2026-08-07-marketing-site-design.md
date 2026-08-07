# GameFit Marketing Site — Design Spec

**Date:** 2026-08-07
**Status:** Approved, ready for implementation planning
**Repo:** `gamefit-web` (new, separate from `muhammet-tm/gamefit-app`)

---

## 1. Purpose

A marketing and credibility site for GameFit — the "visit card" a founder
sends to an investor, an accelerator reviewer, or a prospective beta user.

It replaces a Base44-built site whose source files no longer exist. The old
site's structure and copy are known only from screenshots, which are the
content reference but not the design reference.

### Success criteria

1. An investor opening the link on a phone reaches meaningful content in
   under 1.5 seconds and understands the problem, the proof and the stage
   without scrolling twice.
2. Any section can be deep-linked into an email with a correct social preview.
3. Waitlist and feedback submissions reach the founder without a backend to
   operate.
4. Every factual claim on the site is verifiable, and none contradicts the
   product's actual implementation.
5. The site stays online regardless of the state of the GameFit app's
   Supabase project.

### Audience priority

1. **Investors and accelerator reviewers** — primary. Hub71 programmes, angel
   investors, ADU Innovate. Above the fold serves this audience.
2. **Prospective beta users** — secondary now, primary after prototype
   completion. Waitlist and feedback must be present and frictionless from
   day one so the transition needs no rebuild.

---

## 2. Scope

### In scope

- One long home page composed of eight sections.
- Seven of those sections addressable as standalone routes with their own
  metadata.
- Three additional routes: `/beta`, `/feedback`, `/privacy`.
- Waitlist form and feedback form, both functional.
- Full design system, documented in `DESIGN.md`.
- Security headers, self-hosted fonts, no third-party trackers.
- Automated route, accessibility and performance verification.
- **Bilingual English and Arabic**, with full right-to-left layout. See §4,
  "Localisation".

### Out of scope

- Blog, CMS, or any authoring interface.
- User accounts or authentication.
- Any connection to the GameFit app's database.
- Light theme.
- Languages beyond English and Arabic.
- Domain purchase or DNS configuration.

---

## 3. Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Astro 7.2 | Ships zero JS by default. A marketing site is ~95% static; paying a React runtime cost on every load buys nothing. Requires Node ≥ 22.12. |
| Interactive islands | React 19.2 via `@astrojs/react` 6 | Four islands only. Matches the syntax already used in the app so the codebase stays legible to the owner. |
| Styling | Tailwind 4.3 via `@tailwindcss/vite` + CSS custom properties | Tailwind 4 is CSS-first: tokens are declared in `tokens.css` with `@theme` and there is no `tailwind.config.js`. This makes `tokens.css` genuinely the single source of truth rather than nominally so. |
| Forms | Web3Forms | No account creation, no form-builder UI, no backend. Chosen specifically because setup is one access key rather than a configuration exercise. |
| Hosting | Vercel | Already in use, free tier sufficient, static output. |
| Testing | Playwright + axe-core | Playwright is already familiar in the sibling repo. |

### Rejected alternatives

- **Next.js** — capable but ships a heavier JS baseline for a site with no
  server-side needs. Would be the right call if a CMS-backed blog were in
  scope.
- **Vite + React SPA** (the app's stack) — familiar, but client-rendered.
  Crawlers and link-preview bots see an empty document, which defeats the
  site's purpose.
- **Formspree / Tally** — both require account setup and form-building in a
  third-party UI, contradicting the owner's explicit constraint that setup
  work should not be handed back to them.

### Dependency policy

Minimal and stable. No alpha or beta versions in production. This is a direct
response to a same-day incident in the sibling repo where a component
registry pulled seven `4.0.1-alpha.0` packages into a production app.

---

## 4. Information architecture

### Home page section order

| # | Section | Purpose | Route |
|---|---|---|---|
| 1 | Hero | Problem, positioning, primary CTA, three proof figures | — |
| 2 | Stats | The retention crisis and market size, all sourced | `/stats` |
| 3 | Features | AI coaching, gamification, social competition | `/features` |
| 4 | Leaderboard | Competition mechanics, live-style preview | `/leaderboard` |
| 5 | Research | Springer paper, SDT pillars, survey findings | `/research` |
| 6 | Roadmap | Three phases; current status is **MVP ready** | `/roadmap` |
| 7 | About | Solo founder story, timeline, mission | `/about` |
| 8 | Contact | Investment, partnership and general channels | `/contact` |

Order is deliberate: problem, then evidence the problem is real, then the
solution, then proof the solution is grounded, then where it's going, then
who is behind it. An investor who stops after section 5 has still seen the
complete argument.

### Standalone routes

| Route | Purpose |
|---|---|
| `/beta` | Waitlist signup with its own framing and social preview |
| `/feedback` | Beta user feedback form |
| `/privacy` | Required because the site collects email addresses |

### Navigation behaviour

- On `/`, nav links smooth-scroll to the section anchor and update the URL
  hash without a page load.
- Direct navigation to `/research` renders that section as a full page with
  its own `<title>`, meta description and Open Graph image.
- Standalone section pages include a link back to the full home page.
- This dual behaviour is the entire justification for the route structure. If
  it proves fragile in implementation, deep-link routes take priority over
  smooth scrolling.

### Localisation

The site ships in English and Arabic. Given GameFit is built in Abu Dhabi and
targets UAE investors and users, an Arabic version is a credibility signal,
not a nicety.

| Concern | Approach |
|---|---|
| Routing | English at `/`, Arabic at `/ar/`. Every route has an Arabic twin, e.g. `/ar/research`. |
| Direction | `<html dir="rtl" lang="ar">` on Arabic routes. Layout mirrors through CSS logical properties (`margin-inline-start`, not `margin-left`) so a single stylesheet serves both directions. |
| Typography | Barlow Condensed and DM Sans have no Arabic coverage. Arabic uses **Tajawal** — self-hosted, multiple weights, and already familiar from the owner's Hissati project. |
| Content | Copy lives in `src/content/en/` and `src/content/ar/` with identical key structure. A build-time check fails the build if a key exists in one language but not the other. |
| Switching | A language toggle in the header preserves the current route, so `/research` becomes `/ar/research` rather than dumping the user on the home page. |
| SEO | Reciprocal `hreflang` tags on every page pair, plus `x-default` pointing at English. Both languages appear in the sitemap. |
| Numerals | Western Arabic numerals (0–9) throughout. Statistics stay visually identical across both versions, which keeps the design system intact. |

**Translation source.** Arabic copy is produced as part of the build, then
reviewed by the owner before launch. Machine-quality Arabic on an
investor-facing site in the UAE reads worse than no Arabic at all, so the
Arabic version does not go live until the owner has read it.

**Implementation order.** English is built and verified complete first, then
Arabic is layered on. Building both simultaneously doubles the debugging
surface for no benefit.

---

## 5. Content

### 5.1 Source of truth

`docs/content/` holds structured data files — stats, roadmap phases, features,
timeline, team. Components import from these. Changing a number never
requires editing a component.

Every statistic carries a `source` field. A stat without a source does not
render.

**Survey sample size.** Figures from the user survey are attributed to the
peer-reviewed research rather than to a raw participant count — the site
does not state `n`. The sample size remains published in the Springer paper,
which the Research section links to, so nothing is concealed from anyone who
looks. Owner's decision, recorded here so it is a deliberate choice rather
than an omission.

### 5.2 Corrections applied

The old site's copy contains claims that contradict the product. All are
corrected, confirmed with the owner on 2026-08-07:

| Claim | Old site | Corrected to | Why |
|---|---|---|---|
| AI provider | "OpenAI API", GPT-4 | Anthropic Claude Haiku 4.5 | Verified in `supabase/functions/coach-g/index.ts:11` — `claude-haiku-4-5-20251001`. The repo is public. |
| Avatar | "3D character growth" | 25 evolving tiers, rendered live | The system is layered 2D SVG. |
| Survey headline | 88% in one place, 78% in another | 78% throughout | Owner confirmed 78%. Sample size is not published on the site (see below). |
| Paper DOI | Two conflicting DOIs across source docs | `10.1007/978-3-032-23883-2_13` | Verified: this resolves at Springer. The alternative, `10.1007/978-3-031-67286-7_13`, returns 404. |
| ACR'26 | Not stated | Conference held in Amsterdam; presented remotely | Owner confirmed remote delivery. Wording must not imply travel. |
| Fundraising | "$100K pre-seed raise" | "Raising pre-seed", no figure | Owner's decision. |
| Team | Four "founding team" cards | Solo founder, plus academic validation | Owner is the sole founder. Paper co-authors are credited in the paper byline only. |

### 5.3 Roadmap content

Three phases. **Phase 2 is the current phase and its status is MVP ready** —
the product is built, deployed and working end to end, not a concept or a
partial prototype.

| Phase | Status label | Contents |
|---|---|---|
| 1 — Foundation | Done | Working prototype, user survey validated, Springer paper published, WebSummit Qatar 2026 ALPHA stage, Dubai Create Apps Championship, full test suite passing |
| 2 — MVP | **MVP ready** — current | Product built and live, server-authoritative economy, AI coaching, payments integrated, store submission prepared, pre-seed raise open, Hub71 and ADU Innovate applications submitted |
| 3 — Scale | Next | Wearable integrations, corporate wellness B2B, rewards marketplace, seed round |

Two constraints on this section:

- No raise amount appears anywhere (§5.5).
- "MVP ready" means the product is built and functional. It does **not** claim
  App Store availability, since neither app has been submitted. The copy must
  not imply otherwise — an investor who searches the App Store and finds
  nothing after reading a launch claim will discount everything else on the
  page.

### 5.4 Founder positioning

GameFit has one founder. The About section presents Muhammet Yalkapov as sole
founder, with the origin story — managing a fitness club in Ashgabat at 15 and
watching members quit from boredom rather than effort.

Dr. Murad Al-Rajab appears as the academic supervisor who validated the
research and supported its publication. The remaining co-authors appear only
in the paper's author list within the Research section, correctly labelled as
co-authors rather than team members.

### 5.5 Explicitly excluded

Private information that must never appear on the public site:

- The rejected $80K/40% equity offer.
- The 15% equity floor and any negotiating position.
- Target raise amount.
- Personal phone number, student ID, home address.
- Named Hub71 contacts and relationship strategy.
- Investor pipeline names.

### 5.6 Known stale source material

`Muhammet_Yalkapov_GameFit_Profile.md` contains at least two verified errors:
a DOI that 404s, and a technology stack description that does not match the
built product. It should not be used as a content source without checking
each claim. Flagged to the owner separately.

---

## 6. Forms

### 6.1 Waitlist

Fields: email (required), name (optional), "what would make you actually stick
with a fitness app?" (optional free text).

The optional third field exists because early waitlist signups are the
cheapest qualitative research available, and asking costs nothing.

### 6.2 Feedback

Fields: overall rating (1–5), what works, what's missing, email (optional).

Reachable at `/feedback`, linked from the footer and from the waitlist
success state.

### 6.3 Data flow

```
Browser form (React island)
  → client-side validation
  → POST to Web3Forms API with public access key
  → Web3Forms emails team.gamefit@gmail.com
  → success state rendered in place
```

No data is stored by the site. No database. No cookies.

### 6.4 Abuse protection

- Hidden honeypot field; submissions that fill it are silently discarded.
- Client-side rate limit of one submission per 30 seconds.
- Web3Forms domain restriction, so the key only functions from the production
  hostname.
- Email format validated client-side and by the service.

### 6.5 Access key handling

The Web3Forms access key is public by design and will appear in the page
source. This is inherent to the service, not a mistake. The domain
restriction is what makes it safe. It is stored as
`PUBLIC_WEB3FORMS_KEY` in `.env`, with `.env` git-ignored and
`.env.example` committed.

**Owner action required, once:** enter an email at web3forms.com to receive
an access key, then provide it. This is the only manual setup step in the
project.

### 6.6 Failure handling

Every form has four designed states: idle, submitting, success, error. If the
Web3Forms request fails, the error state shows a `mailto:` fallback so a
motivated user is never dead-ended. Forms are never the only path to contact —
the Contact section always lists the email address directly.

---

## 7. Security

| Control | Implementation |
|---|---|
| Content-Security-Policy | Strict, in `vercel.json`. `default-src 'self'`, no `unsafe-eval`. Web3Forms endpoint explicitly allowlisted in `connect-src`. |
| HSTS | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Camera, microphone, geolocation, payment all denied |
| Framing | `frame-ancestors 'none'` |
| Third-party scripts | None. No analytics, no tag managers, no font CDN. |
| External links | `rel="noopener noreferrer"` on all |
| Secrets | None in the repo. The form key is public by design and documented as such. |
| Supabase | Not used. The site has no connection to the app's database. |

Deliberate decision: the waitlist is **not** stored in the app's Supabase
project. Adding a publicly writable table to the database that holds user
accounts and Stripe customer IDs would widen the app's attack surface for no
benefit the site actually needs.

---

## 8. Performance and accessibility

Budgets and accessibility requirements are defined in `DESIGN.md` §9 and §10
and are treated as build requirements, not goals.

Summary: under 30 KB of JavaScript on the home page, Lighthouse Performance
≥ 95, Accessibility 100, WCAG 2.1 AA verified by automated axe tests on every
route.

---

## 9. Screenshots

The six screenshots in the sibling repo's `store-assets/` are stale. Fresh
captures will be generated by running `scripts/store-screenshots.mjs` against
the running app, now that its Supabase project has been restored to healthy.

Processing: export to WebP with PNG fallback, generate responsive `srcset`
widths, set explicit dimensions in HTML to prevent layout shift.

If regeneration proves impractical, the existing captures are used and the
discrepancy is flagged rather than hidden.

---

## 10. Verification

Nothing is reported as working without evidence.

| Check | Method |
|---|---|
| All routes render | Playwright, every route, asserting `<h1>` and no console errors |
| Accessibility | axe-core on every route, zero violations |
| Forms | Playwright fills and submits against a test key; validates all four states |
| Performance | Lighthouse CI against the production build |
| Responsive | Screenshots at 375px, 768px and 1440px, reviewed visually |
| Links | Automated check that no internal link 404s and the DOI resolves |
| Content accuracy | Manual diff of rendered claims against §5.2 |
| Localisation | Build fails on any content key present in one language but missing in the other; every page pair carries reciprocal `hreflang` |
| RTL | Full route suite run with `dir="rtl"`, screenshotted, checked for clipped or mirrored-wrong elements |

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| Dual scroll-and-route behaviour proves fragile | Deep-link routes take priority; smooth scroll degrades to a normal anchor jump |
| Web3Forms free tier limit (250/month) | Adequate for pre-launch. Migration path to Supabase documented if volume grows |
| Owner has not used Astro before | Content lives in data files, not components. A README documents how to change copy without touching code |
| Screenshot regeneration blocked | Fall back to existing captures, disclosed |
| Old site's copy is known only from screenshots | Content reconstructed and verified against source documents; corrections logged in §5.2 |
| RTL layout breaks in ways LTR testing misses | Layout uses CSS logical properties throughout; Playwright runs the full route suite in both directions and screenshots both |
| Arabic copy quality | English ships first and `/ar/` stays unpublished until the owner has reviewed the translation |

---

## 12. Open items

- Domain undecided. The site is built domain-agnostic; the hostname is a
  single config value consumed by canonical URLs, the sitemap and Open Graph
  tags.
- Arabic copy requires owner review before the `/ar/` routes go live.

Resolved: the Web3Forms access key was supplied on 2026-08-07 and is stored
in `.env` as `PUBLIC_WEB3FORMS_KEY`.
