# dragoscatalin.ro — agent instructions

Single entry point for any AI coding agent in this repo. Domain rules live in
[`instructions/`](./instructions/), multi-step recipes in [`skills/`](./skills/),
the canonical status in [`docs/TRACKER.md`](../docs/TRACKER.md) and the art
direction in [`docs/DESIGN.md`](../docs/DESIGN.md).

## Purpose

Public portfolio website of Dragos Catalin Vladulescu — **portfolio only**. The
former contracts/dashboard/forms/Firebase stack was archived in **v2.0.0** (git
history has it). Never propose bringing it back.

## Stack (pinned exact in `package.json`)

Next.js 16.3.5 (App Router, `cacheComponents`, `reactCompiler`, `typedRoutes`) ·
React 19.3 · TypeScript 7 via alias (`typescript`→`@typescript/typescript6@6.0.2`,
`@typescript/native`→`typescript@7.0.2`) · Tailwind 4.3 (CSS-first `@theme inline`)
· motion 13 (`motion/react`) · next-intl 4.14 (`as-needed`, EN default, `/ro`) ·
nuqs 2 · zod 4 · lucide-react 1.x + `@/components/icons` · resend ·
`@marsidev/react-turnstile` · schema-dts · feed · ESLint 10 flat + prettier 3 ·
Vitest 5 · Playwright 1.63 + `@axe-core/playwright` · per-page first-load budget · husky + lint-staged.
Node 24 LTS (`.nvmrc`, `engines >=24`), pnpm ≥ 12 (`packageManager` pnpm@12). **Always pnpm.**

## Commands

| Command                       | What                                                                    |
| ----------------------------- | ----------------------------------------------------------------------- |
| `pnpm dev`                    | Next dev on **port 24789** (VS Code task "Start Dev Server")            |
| `pnpm lint` / `pnpm lint:fix` | `eslint .` (flat config)                                                |
| `pnpm typecheck`              | `tsc --noEmit` (tsc = TS 7.0.2)                                         |
| `pnpm test`                   | Vitest (registry, utils, i18n)                                          |
| `pnpm test:e2e`               | Playwright smoke + axe                                                  |
| `pnpm size`                   | Heaviest page's first-load JS vs `first-load-budget.json` (after build) |
| `pnpm tracker:check`          | `scripts/check-tracker.mjs` — CSV field count + evidence paths exist    |
| `pnpm ci:local`               | `scripts/ci-local.mjs` — whole pipeline in WSL/Docker                   |
| `pnpm lh`                     | Local Lighthouse sweep vs a running prod server (`-- --preset mobile`)  |
| `pnpm scan:contrast`          | Effective text contrast on every route × mode × accent (exit 1 on any)  |
| `pnpm scan:layout`            | Overflow / alignment / tap-target / clipped-text scan at 8 widths       |
| `pnpm shots`                  | Playwright screenshots of live projects into `public/shots/`            |
| `pnpm assets:optimize`        | Regenerate favicon/icons/press logo from `brand/logo/*.svg` (sharp)     |

## Hard rules

1. **Semantic tokens only.** Utilities generated from `src/app/globals.css`
   `@theme inline`: `bg`, `bg-deep`, `surface`, `surface-raised`, `fg`, `fg-muted`,
   `fg-subtle`, `line`, `line-strong`, `accent`, `accent-soft`, `accent-strong`,
   `accent-fg`, `counter`, `success`, `warning`, `danger`; shadows `glow`,
   `glow-sm`, `card`; radii `card`, `pill`. Raw palette classes (`bg-violet-500`)
   are an ESLint **error** in `src/`. Theme is driven by `<html data-mode
data-accent data-surface>` (`src/lib/theme.ts`: MODES/ACCENTS/SURFACES).
2. **Every user-visible string** goes in BOTH `messages/en.json` and
   `messages/ro.json` (same key paths). Read via `getTranslations` /
   `useTranslations`; links via `Link` from `@/i18n/navigation`.
3. **Projects live ONLY in `src/data/projects.ts`** (typed by
   `src/data/types.ts`). Never hardcode project names/links in components.
4. **Private projects never get repo links**, except public mirrors already in
   the registry (Brivio: `dragoscv/brivio-releases`, `brivio-ro/brivio-sdk-*`).
   `visibility: "private"` + `repos` outside that allowlist fails the registry test.
5. **GitHub data only via `src/lib/github.ts`** (`"use cache"`, `cacheLife("days")`,
   `cacheTag("github")`, `GITHUB_TOKEN`-gated, returns `{}` without token).
6. **Server components by default**; `"use client"` only for interaction.
7. **No `any`.** `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals` are on.
8. **Version bump + CHANGELOG entry for every `src/` change** (husky gate).
9. **Tracker update per feature**: `docs/TRACKER.md` + `docs/tracker.csv` in the
   same commit; `done` rows cite real paths in `evidence`.
10. Shared clone: stage explicit paths only (never `git add -A`).

## Known traps (verified 2026-09-15)

- (a) `next/root-params` needs `[locale]` as a ROOT segment. A pass-through
  `src/app/layout.tsx` breaks it: _"Export locale doesn't exist in target module"_.
- (b) Under `cacheComponents`, `new Date()` / `cookies()` / `headers()` in a
  layout/page body outside `<Suspense>` throws _"Next.js encountered runtime data
  during prerendering"_ — hoist to module scope or wrap in Suspense.
- (c) ESLint 10 + eslint-plugin-react needs `settings.react.version` pinned
  (else `contextOrFilename.getFilename is not a function`); jsx-a11y must be spread
  as `.rules` only — the plugin is already registered by eslint-config-next.
- (d) `react-hooks/set-state-in-effect` is an **error** — use
  `useSyncExternalStore` or derive/adjust during render. `react-hooks/refs` too:
  no `ref.current =` in render.
- (e) `pnpm exec eslint "src/app/[locale]/..."` mangles the glob in PowerShell and
  prints nothing — lint parent dirs, or run `eslint ... -f json -o .copilot-tmp/x.json`.
- (f) lucide-react 1.x has no `Github` / `Instagram` icons — use `@/components/icons`.
- (g) TS aliases: `tsc` = 7.0.2, `tsc6` = 6.x; typescript-eslint runs on 6.
- (h) motion 13 imports from `motion/react`; a shared `layoutId` across
  conditionally rendered siblings crashes React 19 — use plain spans for active
  indicators.
- (i) `ViewTransition` is a stable named export from `react` in 19.3 (not `unstable_`).
- OG images (`src/lib/og.tsx`) must use hex colours — satori has no oklch.

## Performance contract (verified 2026-09-15)

- Lighthouse desktop **100/100/100/100** on `/`, `/projects`, `/projects/[slug]`,
  `/about`, `/open-source`; CI gate in `lighthouserc.json` (perf ≥ 98 median,
  LCP ≤ 1.2 s, CLS ≤ 0.05, TBT ≤ 100 ms, no console errors).
- **No zod or `@/lib/env` in client components** (ESLint error). Client env
  comes from `@/lib/env.client`; shots schema lives in `shots.schema.ts`.
- **No `motion/react` in globally-mounted components** (header, theme, layout):
  use CSS keyframes (`.hero-item`, `.sheet-in`, `.pop-in`). Motion is allowed
  in route-local components only.
- Anything awaiting network (GitHub, npm) renders behind `<Suspense>` with the
  registry-driven markup as the fallback — never a skeleton for LCP content.
- Staged assets > 300 KB fail pre-commit (`public/logo.png` allowlisted for
  the press kit). First-load JS budget 300 kB gz for the heaviest page (`first-load-budget.json`).
- Only the true LCP image gets `priority`; the mono font is not preloaded.

## Verification (non-negotiable)

- Run the command and show its output before claiming lint/typecheck/tests pass.
- Load the page in the browser (port 24789) and check the console is clean.
- After ANY change to tokens, Badge/Button variants or layout: `pnpm scan:contrast`
  and `pnpm scan:layout` against the dev server must both print `0 findings`.
  axe alone missed every issue the owner saw (it does not composite backdrops).
- A11y: `@axe-core/playwright` in `pnpm test:e2e` must report zero violations
  across accents × modes × surfaces (see `skills/theme-surface`).
- Say **VERIFIED** (ran it) vs **EXPECTED** (reasoned) explicitly.
