# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [2.5.0] - 2026-10-05

### Changed

- MuzicAI is now **MixAI** (mixai.ro). Its project slug is now `mixai`, and
  `/projects/muzicai` and `/ro/projects/muzicai` redirect permanently (308).
  The site brands, web manifest, press kit, messages (EN + RO) and
  `docs/PUBLICITY.md` all use the new name. Status is now `active`.
- Project surfaces now list every TV and watch app:
  - MixAI: Android TV, Samsung Tizen TV, DJ app, MMO Server, mobile, extension
  - Titi: Wear OS, Android TV, Tizen, desktop
  - Vitals: Android, Wear OS, Android TV, Tizen
  - Brivio: TV (Tizen, Cast, signage)

### Added

- Portfolio tracker in `docs/portfolio/` (`PORTFOLIO.md` + `portfolio.csv`).
  `scripts/check-tracker.mjs` validates its header, ids, enums and score range.

## [2.4.0] - 2026-09-15

Visual-correctness pass driven by two new scanners run on every route × dark /
light × orange / violet × 8 viewport widths (360 → 3440): `pnpm scan:contrast`
(effective text contrast against the real composited backdrop) and
`pnpm scan:layout` (overflow, container alignment, empty sections, tap targets,
clipped text). Both report **0 findings**; E2E + axe 28/28.

### Fixed

- Text invisible on its own background: light-mode accent text on soft fills
  (“Launching”, “In development” badges at 4.2:1) — light `--accent` L 0.55 →
  0.50; warning badge text (“Research” at 2.2:1) now uses a dedicated
  `--warning-fg`; hero pill labels/icons use `fg`.
- Borders that did not exist visually: dark `--line` was 1.23:1 against cards
  (L 0.26 → 0.32, `--line-strong` 0.34 → 0.42); light lines slightly stronger.
- The accent page mesh never rendered (pseudo-elements at z -10 painted behind
  `<html>`); body now isolates a stacking context. The film-grain overlay moved
  to its own element (it shared `body::before` with the mesh and was lost).
- Fallback cover hue for projects without a brand hue followed hard-coded
  violet/indigo; now follows the active accent (`var(--accent-h)`).
- 111 inline links under the 24 px WCAG 2.2 target size (footer, packages,
  repos, press, project pages) via a `.link-inline` utility that enlarges the
  hit area without changing the line box.

### Changed

- Header pill is wider: tracks the content column (`min(72rem, 100% − 3rem)`,
  1152 px at 1440) instead of shrinking to its contents; centred at every width.

## [2.3.1] - 2026-09-15

### Fixed

- `<main>` lost its top padding under the fixed pill header: the offset class
  was exported from the `"use client"` Header module, so the server rendered a
  client-reference function body into `className`. Moved to
  `header-offset.ts`; hero height now subtracts the offset; E2E asserts the h1
  clears the header.

### Added

- Skills `perf-audit` (measure → read LCP breakdown → known causes → gate) and
  `shots` (screenshot pipeline ops); theme-tokens instructions cover elevation,
  the no-continuous-animation rule, CSS-first motion and ultra-wide.

## [2.3.0] - 2026-09-15

Performance pass measured with Lighthouse against a production build (desktop
and mobile presets). Desktop: **100 / 100 / 100 / 100 on all 5 audited routes**
(was 88–100 / 96 / 96 / 92). Mobile: A / BP / SEO 100 everywhere, perf 91–100
(was 79–93), TBT 250 → ≤40 ms, `/projects` LCP 3.8 → 3.3 s, `/about` 3.2 → 1.9 s.

### Fixed

- LCP: the hero headline was hidden by a motion `initial="hidden"` until
  hydration (1.7 s render delay). Hero and header entrances are now pure CSS.
- LCP: `/projects` and the home grid rendered a skeleton while awaiting GitHub;
  the registry-driven grid now renders in the initial HTML and live stats
  stream into it. Featured cards and package rows stream their stats the same way.
- Bundle: **zod (100 KB gz) was in every page's client bundle** through a
  `clientEnv` import and the shots manifest reader. Client env moved to
  `env.client.ts` (no zod); manifest schema moved to `shots.schema.ts`
  (server/tests only). ESLint now forbids `zod` / `@/lib/env` in components.
  First-load JS 374 → 281 kB gz; budget tightened to 300 kB.
- Bundle: `motion/react` (44 KB gz, 89 % unused) was global for the header
  sheet and theme popover; both use CSS keyframes now. Motion loads only on
  `/projects`.
- HTML: `CoverArt` drew hundreds of SVG elements per cover (321 KB on the home
  page); each pattern is now one `<pattern>` tile. Home HTML 1016 → 569 KB.
- Assets: the 1.3 MB `logo.png` was loaded in the header on every page; now
  `logo-64.webp` (1.2 KB) with generated icons (`pnpm assets:optimize`) and a
  real `favicon.ico` (the implicit request used to 500). Pre-commit fails any
  staged asset over 300 KB.
- Contrast: dark `--fg-subtle` raised to AA (3.92 → ≥ 4.5 : 1); one 10 px label
  bumped to 11 px. Card titles are `h2` (heading order).
- Canonical: was pointing at the production host during local audits; Vercel
  Analytics / Speed Insights only mount on Vercel (no 404 console errors).
- CLS on project pages from the mono font swap: metric-compatible fallback.
- Fonts: mono face no longer preloaded (only small labels use it).

### Changed

- `experimental.inlineCss: true` — the 13 KB Tailwind sheet is inlined,
  removing a render-blocking round trip.
- Lighthouse CI is now a hard gate: 5 routes × 3 runs, A/BP/SEO = 100, perf
  ≥ 98 (median), LCP ≤ 1.2 s, CLS ≤ 0.05, TBT ≤ 100 ms, no console errors.
- Ultra-wide: `3xl` breakpoint (2200 px) → 5-column grids, wider container and
  17–18 px root font; touch devices get native-app ergonomics (no tap
  highlight, no overscroll, no double-tap zoom, hidden scrollbars).

## [2.2.0] - 2026-09-15

### Added

- **Orange** accent, now the default (7 accents total). OG palette follows.
- Elevation system: `shadow-elev-1/2/3` tokens (ambient + key shadow + 1 px
  inner highlight, accent ring on level 3) applied to the header, primary
  buttons (press drops the shadow), project cards, hero tech pills and badges.
- `CoverArt`: deterministic inline-SVG cover per project (seeded pattern,
  monogram, stack chips) used wherever a project has no image — zero bytes of
  assets, theme-aware.
- Screenshot pipeline: `pnpm shots` (Playwright, desktop/tablet/mobile ×
  dark/light + full-page, optional authenticated internal pages via
  `shots.config.json`), weekly GitHub Action opening a PR into
  `public/shots/`, typed manifest reader `src/lib/shots.ts`.
- `DeviceShowcase`: CSS device frames (desktop/tablet/phone) with a dark/light
  toggle on project pages once screenshots exist; cards use the desktop shot
  as cover automatically.

### Changed

- Header is a floating, centred pill (fixed, 12 px from top, elevated) that
  compacts on scroll; full-width minus margins on mobile.
- Locale switcher is a real link (works before hydration).

### Fixed

- E2E: projects grid and theme menu assertions now poll instead of racing
  Suspense/hydration.

## [2.1.0] - 2026-09-15

### Added

- Registry round 2 after a full `E:\gh` scan, Vercel/DNS probe and owner
  interview: 15 projects added (Titi, Dashy, Caelia, AFTI, Vitals, VS Remote
  Chat, Circus, Tasks2, bancai, JucAI, Invitații, MancAI, EditAI, DEXAI,
  aBridge); Nexus enriched with verified stack and surfaces. 36 projects total,
  all derived surfaces (detail pages, sitemap, `llms.txt`, `/api/projects`,
  OG images) follow automatically.

### Removed

- memorai-mcp and glass-mcp from the registry (owner decision).

### Changed

- Design: reverted the experimental WebGL2 "constellation" hero and the
  scroll-linked timeline spring to the v1 hero look (centred headline,
  gradient second line, ambient glow, grid, technology pills) on top of the new
  token/i18n/registry stack. Policy: no continuously animated objects
  (canvas, rAF loops, scroll springs) anywhere — entrance and hover motion only.

### Fixed

- a11y: `/projects` now renders a real `<h1>`; light-mode `--fg-subtle` and
  `--success` tokens meet WCAG AA 4.5:1; package links on project pages meet
  the 24 px target-size minimum (found by the axe E2E suite).

## [2.0.0] - 2026-09-15

Complete rebuild as a portfolio-only site.

### Removed

- Contracts / dashboard / dynamic-forms stack and its Firebase backend (auth,
  Firestore, rules, indexes). The code lives in git history before this tag.
- Dependencies that only served it: lexical, node-forge, web-eid, html2canvas,
  jspdf, pdf-lib, react-hot-toast, firebase.

### Changed

- Upgraded to Next.js 16.3.5 (App Router, `cacheComponents`, `reactCompiler`,
  `typedRoutes`), React 19.3, TypeScript 7 via npm alias, Tailwind CSS 4.3
  (CSS-first `@theme inline`), motion 13, ESLint 10 flat config, Prettier 3.
- Node ≥ 22.22 / pnpm ≥ 10 enforced via `engines` + `engine-strict`.

### Added

- Internationalisation with next-intl 4 — RO + EN, EN default, `/ro` prefix,
  reciprocal hreflang, `proxy.ts` locale routing.
- Theme system: dark / light / system, six OKLCH accents, three surface modes;
  cookie + localStorage persistence with a no-flash inline script.
- Typed project registry (`src/data/projects.ts`) with statuses and link
  policy, plus a GitHub GraphQL data layer cached for a day (`"use cache"`).
- Pages: home (centred typographic hero with tech pills — the v1 look kept on
  the new stack; featured, now, open-source, timeline, contact), `/projects` with URL-state filters, `/projects/[slug]`, `/about`,
  `/open-source`, `/now`, `/uses`, `/press`.
- SEO / AEO: metadata + hreflang, JSON-LD (Person, WebSite, SoftwareApplication,
  BreadcrumbList), sitemap, robots, `llms.txt` + `llms-full.txt`, RSS feed, OG
  images, public `/api/projects` JSON.
- Contact form via Server Action + Zod + Resend (env-gated), honeypot and
  Cloudflare Turnstile.
- Quality gates: husky pre-commit / pre-push driven by `scripts/*.mjs`
  (commit lock, lint-staged, typecheck, changed tests, tracker and message
  guards, version + CHANGELOG gate, build warning scan, size-limit), Vitest
  unit tests, Playwright smoke + axe a11y suite, `scripts/ci-local.mjs`
  (WSL / Docker), GitHub Actions CI + Lighthouse, Renovate.
- Canonical tracker (`docs/TRACKER.md` + `docs/tracker.csv`) and agent
  instructions / skills under `.github/`.

[Unreleased]: https://github.com/dragoscv/dragoscatalin/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/dragoscv/dragoscatalin/releases/tag/v2.0.0
