# GameFit Web — Design System

The design reference for the GameFit marketing site. Every colour, size and
motion rule the site uses is defined here. If a value appears in a component
but not in this document, that component is wrong.

This system is deliberately narrower than the GameFit app's. The app is a
daily tool with light and dark themes, dense data views and 60 screens. This
site is a single confident statement read once, on a phone, by someone
deciding whether to take the founder seriously.

---

## 1. Identity

**Name:** Dark RPG Athletic.

The product turns exercise into a role-playing game. The design language
should feel like the interface of a game you'd actually want to play —
high-contrast, decisive, built from ranks and stat blocks and progress bars —
without tipping into neon gamer clichés or looking unserious to an investor.

Three rules hold that line:

1. **Structure over decoration.** Depth comes from layered flat surfaces and
   hairline borders. No gradients on backgrounds, no glow, no glassmorphism.
2. **One accent does the work.** Gold is the brand. It marks the single most
   important thing in any viewport and nothing else. An interface where
   everything glows has no emphasis at all.
3. **Real over illustrated.** Actual product screenshots, actual paper
   citation, actual numbers. No stock photography, no abstract 3D blobs.

---

## 2. Colour

### 2.1 Tokens

Defined as CSS custom properties on `:root`. The site is dark-only, so there
is one set of values and no theme switching.

| Token | Value | Role |
|---|---|---|
| `--gf-bg` | `#0B1A24` | Page background |
| `--gf-surface` | `#112532` | Cards, panels |
| `--gf-elevated` | `#1A3242` | Raised elements, inputs, hover states |
| `--gf-border` | `#24455A` | Hairline dividers and card edges |
| `--gf-text` | `#F2F5F7` | Primary text |
| `--gf-muted` | `#88A5B7` | Secondary text, captions, labels |
| `--gf-gold` | `#F4B044` | Primary accent, CTAs, key figures, rank |
| `--gf-ember` | `#E0680E` | Streaks, intensity, "in progress" |
| `--gf-slate` | `#7FBBD4` | Tertiary accent, third chart series |
| `--gf-success` | `#5FBF7C` | Completed states |
| `--gf-error` | `#E5614A` | Errors, validation failures |

These match the app's dark-mode `--gf-*` tokens exactly, so the site and the
product read as one brand.

### 2.2 Measured contrast

Contrast ratios computed to the WCAG 2.1 formula. These are calculated values,
not estimates, and are verified in CI by `tests/a11y.spec.ts` running axe on
every route.

| Foreground | on `--gf-bg` | on `--gf-surface` | Body text (needs 4.5) |
|---|---|---|---|
| `#F2F5F7` text | **16.15** | 14.37 | Pass |
| `#F4B044` gold | **9.38** | 8.35 | Pass |
| `#88A5B7` muted | **6.83** | 6.08 | Pass |
| `#5FBF7C` success | **7.77** | 6.92 | Pass |
| `#E0680E` ember | **5.18** | 4.61 | Pass |

**The ember rule.** `#E0680E` measures 3.90 on `--gf-elevated`. On that surface
it is for fills and text at 18px or larger only; for smaller ember text on an
elevated surface, move the text to `--gf-surface` or use `--gf-text`.

**Surface, not page, is the binding ground.** Tier labels and card text render
on `--gf-surface`, which is lighter than the page. Bronze shipped briefly at
`#B5754A`, which passes on the page (4.72) and fails on a card (4.20). axe
caught it. Always check the ground the text actually sits on.

### 2.3 Usage rules

- **Gold marks one thing per section of content.** Persistent chrome — the
  header wordmark and the primary CTA — is exempt. It is furniture a reader
  stops seeing after the first screen, and counting it makes the rule
  unfollowable. Within a section's own content, gold marks the single most
  important element and nothing else.

  *This rule was rewritten on 2026-08-08. It previously read "one accent element
  per viewport", which every screen violated the moment a sticky header was
  added. A rule the codebase cannot satisfy is worse than no rule, because it
  trains everyone to ignore the document.*
- Tier colours (bronze through apex) are a closed system. They identify rank
  and nothing else, so a tier colour never doubles as a decorative accent.
- Per-item accents are allowed where items are genuinely parallel and
  distinct — the three feature cards each take one of gold, slate, ember.
  That is categorisation, not decoration.
- Gold and ember never touch. Separate them with surface or space.
- Never place gold text on a light fill. Gold is a dark-background colour;
  on white it drops to roughly 1.9:1. The app carries a separate
  `--gf-gold-text` (`#8A5A06`) for its light theme. This site is dark-only
  and does not need it.
- Body copy is `--gf-text-muted`. Reserve pure white for headings and for
  figures you want read first.
- Semantic colours (`success`, `error`) are for state only, never decoration.

---

## 3. Typography

### 3.1 Families

| Role | Family | Weights | Notes |
|---|---|---|---|
| Display and headings | Archivo Variable | 400–900, width 62–125% | Uppercase, set at 118% width, tracking -0.03em |
| Body and UI | Hanken Grotesk Variable | 300–800 | Sentence case |
| Figures and code | JetBrains Mono | 500 | Stats, DOI, tabular numbers |
| Arabic, all roles | Tajawal | 500, 700, 900 | Latin fonts above have no Arabic coverage |

Archivo replaced Barlow Condensed and Hanken Grotesk replaced DM Sans in the
2026-08-14 token swap. Condensed-uppercase-on-near-black is the most templated
look in fitness software; the expanded width axis is what moves the display
face away from it. DM Sans is additionally a training-data default that shows
up on a large share of AI-generated sites.

All are **self-hosted** as `woff2` with `font-display: swap`. They are not
loaded from Google's CDN — that removes a third-party request on every page
load and avoids the GDPR exposure German courts have already ruled on for
Google Fonts.

Font files are subset per language and loaded conditionally: Arabic routes
never download Archivo, and English routes never download Tajawal.
Bilingualism must not cost the English visitor a byte.

### 3.2 Scale

Fluid type using `clamp()`, so sizes interpolate with the viewport instead of
jumping at breakpoints. Ratio is roughly 1.25 on mobile widening to 1.333 at
desktop.

| Token | Size | Use |
|---|---|---|
| `--fs-hero` | `clamp(2.9rem, 5.1vw, 4.5rem)` | Home hero only, one per site |
| `--fs-h1` | `clamp(2.25rem, 5.5vw, 3.6rem)` | Section titles |
| `--fs-h2` | `clamp(1.5rem, 3vw, 2.25rem)` | Sub-section titles |
| `--fs-h3` | `clamp(1.125rem, 2vw, 1.375rem)` | Card titles |
| `--fs-stat` | `clamp(2.5rem, 6vw, 4rem)` | Big figures in stat tiles |
| `--fs-body` | `1rem` | Default body |
| `--fs-body-lg` | `1.125rem` | Section intro paragraphs |
| `--fs-small` | `0.875rem` | Captions, sources, footnotes |
| `--fs-label` | `0.75rem` | Eyebrow labels, uppercase |

### 3.3 Rules

- Display headings: Archivo 900 at `font-stretch: 118%`, `text-transform:
  uppercase`, `letter-spacing: -0.03em`, `line-height: 0.95`.
- **No eyebrow labels above section titles, and no numbered section
  markers.** Both were removed on 2026-08-14. A tracked uppercase kicker
  above every heading is the most saturated scaffolding pattern on the web;
  one deliberate kicker is voice, one per section is grammar. The `01 / 02`
  indices were worse, because these sections are not a sequence and the
  order carried no information. Numbers stay only where the content really
  is ordered, which on this site is the four-step loop.
- Body: `line-height: 1.65`, maximum measure `68ch`. Long lines are the most
  common readability failure on wide screens.
- Numerals in stat tiles use `font-variant-numeric: tabular-nums` so figures
  don't shift width while counting up.
- Never centre more than three consecutive lines of body copy.

---

## 4. Spacing and layout

### 4.1 Scale

A 4px base. Only these values are used — no arbitrary numbers.

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160`

Exposed as `--space-1` through `--space-11`.

### 4.2 Container

| Token | Value | Use |
|---|---|---|
| `--container` | `1200px` | Standard section width |
| `--container-narrow` | `760px` | Prose, legal pages, forms |
| `--gutter` | `clamp(1.25rem, 5vw, 4rem)` | Horizontal page padding |

### 4.3 Section rhythm

Vertical padding between sections is `clamp(5rem, 12vw, 10rem)`. Consistent
rhythm is what makes a long scrolling page feel composed rather than stacked.

Adjacent sections alternate between `--gf-bg` and `--gf-surface` as their
background to create bands. Never two identical backgrounds in a row without
a divider, and never more than two colour bands visible at once.

### 4.4 Breakpoints

| Name | Width | Notes |
|---|---|---|
| `sm` | 480px | Large phones |
| `md` | 768px | Tablets, two-column grids appear |
| `lg` | 1024px | Desktop, full multi-column layouts |
| `xl` | 1280px | Container reaches max width |

Mobile-first. Layouts are authored for 375px and enhanced upward.

---

### 4.5 Bidirectional layout

The site ships in English (LTR) and Arabic (RTL) from one stylesheet.

**Use CSS logical properties everywhere.** `margin-inline-start`, not
`margin-left`. `padding-inline-end`, not `padding-right`. `inset-inline-start`,
not `left`. `text-align: start`, not `text-align: left`. Written this way, the
entire layout mirrors correctly the moment `dir="rtl"` is set, with no
direction-specific overrides.

What mirrors and what does not:

| Element | Behaviour in RTL |
|---|---|
| Layout, grids, text alignment | Mirrors |
| Navigational arrows, chevrons | Mirrors — a "next" arrow points left |
| Progress and XP bars | Mirrors — fills from the right |
| Numerals and percentages | Do **not** mirror. `78%` stays `78%` |
| Brand wordmark and logo | Does **not** mirror |
| Product screenshots | Do **not** mirror. The app's UI is what it is |
| Charts with a time axis | Do **not** mirror. Time reads left-to-right in both |

Arabic has no expanded-grotesque display equivalent to Archivo, so Arabic
headings use Tajawal 900 without the uppercase transform — Arabic script has
no letter case, and forcing `text-transform: uppercase` on it is a no-op that
signals the design was never checked.

Line heights increase slightly for Arabic (`1.75` body versus `1.65`) to give
diacritics and descenders room.

---

## 5. Elevation and shape

There are exactly three surface levels: `--gf-bg`, `--gf-surface`,
`--gf-elevated`. Depth is expressed by surface change plus a 1px
`--gf-border`, never by shadow.

| Token | Radius | Use |
|---|---|---|
| `--radius-sm` | `8px` | Inputs, small chips |
| `--radius-md` | `12px` | Buttons, badges |
| `--radius-lg` | `16px` | Cards, panels |
| `--radius-full` | `9999px` | Pills, avatars |

One shadow exists, used only on the sticky header once the page has scrolled:
`0 1px 0 var(--gf-border)`. It is a hairline, not a glow.

---

## 6. Motion

Motion confirms an action or reveals structure. It never decorates.

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, reveals |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | State changes |
| `--dur-fast` | `150ms` | Hover, focus, colour |
| `--dur-mid` | `300ms` | Reveals, accordions |
| `--dur-slow` | `600ms` | Counters, staggered groups |

Rules:

- Scroll reveals: 16px upward translate plus opacity, `--dur-mid`, triggered
  by `IntersectionObserver`. Each element animates **once**. Nothing
  re-animates on scroll-up — that is the single most irritating pattern on
  marketing sites.
- Stagger children by 60ms, capped at six items. Beyond that the last item
  arrives too late to feel connected.
- Stat counters run once on first view, `--dur-slow`, easing out.
- Hover states are colour and border only. No scaling of cards, no lift.

**Reduced motion is mandatory.** Under
`@media (prefers-reduced-motion: reduce)` all transforms and counters are
disabled and content renders in its final state immediately. Reveal
animations must never be the only thing making content visible — content is
visible by default and animation is additive, so a failed observer or a
blocked script can never leave a blank page.

---

## 7. Components

### 7.1 Buttons

| Variant | Fill | Text | Border | Use |
|---|---|---|---|---|
| Primary | `--gf-gold` | `#0B1A24` | none | One per viewport |
| Secondary | transparent | `--gf-text` | `--gf-border` | Alternate actions |
| Ghost | transparent | `--gf-text-muted` | none | Tertiary, nav |

Height 48px, horizontal padding `--space-6` (24px), `--radius-md`, Hanken
Grotesk 700. Hover shifts fill brightness by 8%; focus draws a 2px gold
outline at 2px offset. Minimum touch target is 44×44px everywhere.

### 7.2 Stat tile

The workhorse of the Stats section. Surface background, 1px border,
`--radius-lg`, padding `--space-6`. Contains a figure at `--fs-stat` in
Archivo 900 expanded, a label at `--fs-body` in muted, and an optional source
line at `--fs-small`.

**Every statistic carries its source.** "77%" with "Andrew Chen, 2023"
beneath it is credible; "77%" alone is marketing. Figures drawn from the user
survey are attributed to the peer-reviewed research; the site does not print
a participant count.

### 7.3 Feature card

Surface background, 1px border, `--radius-lg`, padding `--space-7`. Icon in a
48px rounded square tinted with the card's accent at 12% opacity. Title at
`--fs-h3`, body in muted, optional tag chips at the foot.

Cards in a row are equal height via grid, never via fixed pixel heights.

### 7.4 Rank badge

Borrowed from the app's rank system — the visual device that makes this site
recognisably GameFit rather than a generic dark template. Pill shape,
`--radius-full`, 1px border in the tier colour, background at 12% opacity,
label in Archivo 900 expanded, uppercase, at `--fs-label`.

### 7.5 Forms

Inputs: `--gf-elevated` background, 1px `--gf-border`, `--radius-sm`, 48px
height, 16px text — **16px is required**, since iOS zooms the viewport on
focus for anything smaller.

Every input has a visible persistent label above it. Placeholder text is
never a substitute for a label. Errors appear beneath the field in
`--gf-error` with an icon, and are announced through `aria-live="polite"`.

Four states, all designed: idle, focus, error, submitting/disabled.

### 7.6 Header

Sticky, 64px tall, `--gf-bg` at 80% opacity with `backdrop-filter: blur(12px)`,
gaining a hairline bottom border once scrolled past 8px. Wordmark left, links
centre, primary CTA right. Below `md` the links collapse into a full-screen
overlay menu with a focus trap.

---

## 8. Imagery

Product screenshots are the only photography on the site. They are real
captures from the running app, exported as WebP with a PNG fallback, served
responsively via `srcset`, and always dimensioned in HTML to prevent layout
shift.

Screenshots sit inside a device frame: 1px `--gf-border`, `--radius-lg` at
roughly 12% of frame width, no drop shadow, no perspective tilt. Straight-on
and honest.

Every screenshot has descriptive alt text stating what the screen shows, not
"app screenshot".

---

## 9. Accessibility

Target: **WCAG 2.1 Level AA**, verified with automated axe tests on every
route rather than asserted.

Non-negotiable:

- Contrast per §2.2, including the ember rule.
- Visible focus indicators on every interactive element. Never
  `outline: none` without a designed replacement.
- Full keyboard operability, including the mobile menu, which traps focus
  while open and returns focus to its trigger on close.
- One `<h1>` per page; heading levels never skip.
- Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`.
- A skip-to-content link as the first focusable element.
- Decorative icons `aria-hidden`; icon-only buttons carry `aria-label`.
- Colour never carries meaning alone — roadmap phase status uses a text label
  as well as a colour.
- `prefers-reduced-motion` honoured throughout.

---

## 10. Performance budget

Enforced, not aspirational. A build that exceeds these is a failed build.

| Metric | Budget |
|---|---|
| JavaScript shipped on `/` | < 30 KB gzipped |
| CSS | < 20 KB gzipped |
| Largest Contentful Paint | < 1.5s on 4G |
| Cumulative Layout Shift | < 0.05 |
| Lighthouse Performance | ≥ 95 |
| Lighthouse Accessibility | 100 |

Astro ships zero JavaScript by default. Only four things become interactive
islands: the mobile menu, the waitlist form, the feedback form, and the stat
counters. Everything else is static HTML.

For context, the GameFit app's bundle is 1,766 KB. This site should be under
2% of that.

---

## 11. Anti-patterns

Things this site will not do, recorded so they don't creep back in:

- Gradient text, gradient backgrounds, glow effects, neon borders.
- Cards that scale or lift on hover.
- Animations that replay every time an element re-enters the viewport.
- Autoplaying video or carousels.
- Cookie banners — there are no non-essential cookies to consent to.
- Statistics without a cited source.
- Claims the product cannot demonstrate. Specifically: the avatar system is
  layered 2D SVG and is never described as 3D, and the AI coach is Anthropic
  Claude and is never described as OpenAI.
- Fake urgency, countdown timers, or invented user counts.
- A "founding team" grid implying employees. GameFit has one founder.

---

## 12. Design tokens reference

The single source of truth is `src/styles/tokens.css`. This document explains
intent; that file holds the values. If they disagree, the CSS file is
authoritative and this document is the bug.
