---
name: perf-audit
description: >-
  Measure and fix Core Web Vitals on dragoscatalin.ro with Lighthouse against a PRODUCTION
  build (desktop + mobile), read the LCP breakdown to find the real cause, apply the known
  fixes (hydration-gated LCP, skeleton-behind-network, zod/motion in client bundle, SVG bloat,
  oversized assets, contrast), and lock every win in a gate. Use when a Lighthouse score drops,
  before a release, or when adding anything that ships JS to the client.
---

# Performance audit

Never guess. Lighthouse against `next dev` is meaningless — always a prod build.

## 1. Build + serve + measure

```powershell
$env:NEXT_PUBLIC_SITE_URL='http://localhost:24790'          # canonical must match host
pwsh -NoProfile -File "$env:USERPROFILE\.copilot\hooks\run-build.ps1" -Command 'pnpm build'
pnpm exec next start --port 24790                            # separate terminal (async)
pnpm lh                                                      # desktop, 5 routes
pnpm lh -- --preset mobile                                   # mobile is the hard one
pnpm lh -- --runs 3 --routes /                               # variance check on one route
```

Reports land in `.copilot-tmp/lh/*.json`. Say **VERIFIED** with the numbers.

## 2. Read the cause, not the score

For a route: `.copilot-tmp/lh/<preset>_<route>.json` →

- `audits["lcp-breakdown-insight"]` — TTFB / load delay / load time /
  **element render delay**. Render delay ≫ 200 ms means the element exists in
  HTML but is hidden or waiting (hydration, Suspense skeleton, font swap).
- `audits["lcp-breakdown-insight"].details.items[1].snippet` — the LCP node.
- `audits["network-requests"]` — sort by `transferSize`; anything ≥ 40 KB gz
  in scripts on a simple page is suspicious.
- `audits["unused-javascript"]`, `render-blocking-insight`, `layout-shifts`.
- Failing category audits: iterate `categories.<cat>.auditRefs` where
  `audits[id].score < 1 && weight > 0`.

## 3. Known root causes on this site (fixed 2026-09-15 — do not regress)

| Symptom                                 | Cause                                             | Fix                                                                                     |
| --------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| LCP render delay ~1.7 s, FCP fine       | motion `initial="hidden"` on the LCP element      | CSS entrance (`.hero-item[data-lcp]` = transform only). Never hide LCP behind hydration |
| LCP ~0.9 s behind FCP on grids          | `<Suspense fallback={<Skeleton/>}>` around GitHub | Fallback = registry-driven real markup; only stats stream (`Featured`, `ProjectsGrid`)  |
| 100 KB gz chunk on every page           | zod reached the client (`clientEnv`, manifest)    | `env.client.ts`, `shots.schema.ts`; ESLint `no-restricted-imports` blocks it            |
| 44 KB gz chunk, 89 % unused, every page | `motion/react` in Header / ThemeMenu              | CSS keyframes `.sheet-in`, `.pop-in`; motion only in route-local components             |
| Home HTML 1 MB                          | `CoverArt` emitted 100s of SVG nodes per cover    | one `<pattern>` tile per family                                                         |
| 1.3 MB request on every page            | `public/logo.png` in Header                       | `pnpm assets:optimize` → `logo-64.webp`; pre-commit asset gate (300 KB)                 |
| `favicon.ico` 500 in console (BP 96)    | no file → fell through to `[locale]` route        | generated `src/app/favicon.ico`                                                         |
| A11y 96: contrast 3.92:1                | dark `--fg-subtle` L 0.55                         | L 0.62 (≥ 4.5:1 on bg/surface/raised)                                                   |
| SEO 92: canonical                       | `site.url` = prod host during local audit         | set `NEXT_PUBLIC_SITE_URL` to the audited host                                          |
| CLS 0.047 on detail pages               | mono font swap                                    | `adjustFontFallback: true`, mono `preload: false`                                       |

**Refuted (don't retry):** `preload: false` on the sans font — mobile FCP got
worse (1057 → 1360 ms). Removing `priority` from non-LCP images was neutral.

## 4. Lock it in

Every fix needs a gate, otherwise it comes back:

- `lighthouserc.json` — hard thresholds run on PRs (`.github/workflows/lighthouse.yml`).
- `.size-limit.json` — tighten the budget to the new number + ~7 %.
- `eslint.config.mjs` — `no-restricted-imports` for anything server-only.
- `scripts/pre-commit.mjs` — asset size gate, `check-shots-manifest`.
- Record the measurement in `docs/TRACKER.md` (P area) + `CHANGELOG.md`.

## 5. Mobile reality check

Lighthouse mobile = simulated 4G (150 ms RTT, 1.6 Mbps) × 4 CPU. On this site
FCP ≈ 1.05 s is the floor for a 46 KB gz HTML; LCP 3.1–3.4 s on content-heavy
routes is dominated by the script chain (188 KB gz), not by our code. Next
lever is route-level splitting of `next-intl` messages. Do not chase it with
font tricks (see refuted list).
