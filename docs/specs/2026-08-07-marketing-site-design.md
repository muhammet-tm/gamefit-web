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

### Out of scope

- Blog, CMS, or any authoring interface.
- User accounts or authentication.
- Any connection to the GameFit app's database.
- Light theme.
- Multi-language. English only; Arabic is a plausible later addition and the
  layout should not actively prevent it, but no RTL work is done now.
- Domain purchase or DNS configuration.

---

## 3. Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Astro 5 | Ships zero JS by default. A marketing site is ~95% static; paying a React runtime cost on every load buys nothing. |
| Interactive islands | React 18 | Four islands only. Matches the syntax already used in the app so the codebase stays legible to the owner. |
| Styling | Tailwind CSS + CSS custom properties | Tokens in `tokens.css` are the source of truth; Tailwind consumes them. Mirrors the app's approach. |
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
| 6 | Roadmap | Three phases with honest current status | `/roadmap` |
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

---

## 5. Content

### 5.1 Source of truth

`docs/content/` holds structured data files — stats, roadmap phases, features,
timeline, team. Components import from these. Changing a number never
requires editing a component.

Every statistic carries a `source` field. A stat without a source does not
render.

### 5.2 Corrections applied

The old site's copy contains claims that contradict the product. All are
corrected, confirmed with the owner on 2026-08-07:

| Claim | Old site | Corrected to | Why |
|---|---|---|---|
| AI provider | "OpenAI API", GPT-4 | Anthropic Claude | The `coach-g` Edge Function calls Anthropic. The repo is public. |
| Avatar | "3D character growth" | 25 evolving tiers, rendered live | The system is layered 2D SVG. |
| Survey headline | 88% in one place, 78% in another | 78% throughout, `n=51` | Owner confirmed 78%. |
| Paper DOI | Two conflicting DOIs across source docs | `10.1007/978-3-032-23883-2_13` | Verified: this resolves at Springer. The alternative, `10.1007/978-3-031-67286-7_13`, returns 404. |
| ACR'26 | Not stated | Conference held in Amsterdam; presented remotely | Owner confirmed remote delivery. Wording must not imply travel. |
| Fundraising | "$100K pre-seed raise" | "Raising pre-seed", no figure | Owner's decision. |
| Team | Four "founding team" cards | Solo founder, plus academic validation | Owner is the sole founder. Paper co-authors are credited in the paper byline only. |

### 5.3 Founder positioning

GameFit has one founder. The About section presents Muhammet Yalkapov as sole
founder, with the origin story — managing a fitness club in Ashgabat at 15 and
watching members quit from boredom rather than effort.

Dr. Murad Al-Rajab appears as the academic supervisor who validated the
research and supported its publication. The remaining co-authors appear only
in the paper's author list within the Research section, correctly labelled as
co-authors rather than team members.

### 5.4 Explicitly excluded

Private information that must never appear on the public site:

- The rejected $80K/40% equity offer.
- The 15% equity floor and any negotiating position.
- Target raise amount.
- Personal phone number, student ID, home address.
- Named Hub71 contacts and relationship strategy.
- Investor pipeline names.

### 5.5 Known stale source material

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

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| Dual scroll-and-route behaviour proves fragile | Deep-link routes take priority; smooth scroll degrades to a normal anchor jump |
| Web3Forms free tier limit (250/month) | Adequate for pre-launch. Migration path to Supabase documented if volume grows |
| Owner has not used Astro before | Content lives in data files, not components. A README documents how to change copy without touching code |
| Screenshot regeneration blocked | Fall back to existing captures, disclosed |
| Old site's copy is known only from screenshots | Content reconstructed and verified against source documents; corrections logged in §5.2 |

---

## 12. Open items

- Web3Forms access key — owner action, one step.
- Domain undecided. The site is built domain-agnostic; the hostname is a
  single config value consumed by canonical URLs, the sitemap and Open Graph
  tags.
- Arabic localisation deferred, not designed for now.
