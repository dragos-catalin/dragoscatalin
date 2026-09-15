# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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
