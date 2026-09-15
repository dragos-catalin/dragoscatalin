# dragoscatalin.ro — Canonical Tracker

Single source of truth for goals, features, decisions and status. The
machine-readable twin is [`tracker.csv`](tracker.csv) (same ids). Update both in
the same commit; `scripts/check-tracker.mjs` enforces field count and that every
`done` row cites an existing path in `evidence`.

Status values: `todo` · `doing` · `done` · `blocked` · `cancelled`.

## Operating decisions (rounds 1–3, 2026-09-15)

| Question      | Decision                                                                                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope         | Keep ONLY the public portfolio website. Contracts/dashboard/forms code archived (removed; history in git).                                                                                                                            |
| Dependencies  | Latest stable everywhere incl. majors. TS via alias: `typescript`→`@typescript/typescript6`, `@typescript/native`→`typescript@7`.                                                                                                     |
| Data          | Curated registry `src/data/projects.ts` + GitHub GraphQL at build (`"use cache"`, `cacheLife('days')`), fine-grained read-only `GITHUB_TOKEN`.                                                                                        |
| Private repos | Shown as case studies (no repo link).                                                                                                                                                                                                 |
| Locales       | RO + EN via next-intl 4, EN default, `/ro` prefix (`as-needed`), reciprocal hreflang.                                                                                                                                                 |
| Theme         | dark / light / system + 6 OKLCH accents + surface mode (solid / glass / contrast); cookie + localStorage; no flash.                                                                                                                   |
| Design        | v1 look restored on the new stack (owner decision 2026-09-15): centred typographic hero, static glow/grid, tech pills; **no continuously animated objects** (WebGL hero + scroll springs removed for perf); React `<ViewTransition>`. |
| Pages         | `/`, `/projects`, `/projects/[slug]`, `/about`, `/open-source`, `/now`, `/uses`, `/press`.                                                                                                                                            |
| AEO           | JSON-LD (Person, SoftwareApplication, WebSite, BreadcrumbList), `llms.txt` + `llms-full.txt`, sitemap, robots, RSS, OG images, `/api/projects.json`.                                                                                  |
| Contact       | Server Action + Zod + Resend (env-gated no-op) + honeypot + Turnstile. Firebase removed.                                                                                                                                              |
| Gates         | husky pre-commit/pre-push, lint-staged, Vitest, Playwright smoke, size-limit, version+CHANGELOG gate, `scripts/ci-local.mjs` (WSL/Docker), Actions self-hosted w/ hosted fallback, Renovate.                                          |
| Analytics     | Vercel Analytics + Speed Insights + Sentry (env-gated).                                                                                                                                                                               |
| Hosting       | Vercel.                                                                                                                                                                                                                               |
| Publicity     | `/press` kit, outlet list, dev.to articles, Wikidata/Wikipedia draft later (needs independent coverage first).                                                                                                                        |

## Project statuses (interview 2026-09-15)

| Project                                                     | Status on site                                                        | Link policy                             |
| ----------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------- |
| codai                                                       | Flagship, live (codai.ro) — all surfaces                              | codai.ro + codai-ro/* repos             |
| brivio                                                      | Flagship, "Launching Q4 2026"                                         | brivio.ro, brivio-releases, SDK mirrors |
| Datuvia (evocrm)                                            | Large case study; client discontinued; Brivio is the bigger successor | none                                    |
| metu                                                        | Active alpha, in development                                          | github                                  |
| money                                                       | Private R&D, paper trading                                            | none                                    |
| mmo / MuzicAI                                               | Live OSS, maintenance                                                 | muzicai.ro + github                     |
| StudiAI                                                     | Live, maintained                                                      | studiai.ro                              |
| notai                                                       | Live OSS, occasional updates                                          | notai.ro + github                       |
| vmui                                                        | Active OSS personal tool                                              | github                                  |
| HIDE                                                        | Active research, "experimental, unaudited"                            | github + npm                            |
| gta-nexus                                                   | Active private case study                                             | none                                    |
| GangGPT                                                     | Archived OSS                                                          | github                                  |
| TikSee                                                      | Active side project, in development                                   | github                                  |
| notalone                                                    | Research                                                              | github                                  |
| workspace-ai                                                | OSS tooling                                                           | github                                  |
| circuit-tracks-mwrty                                        | Hobby / hardware                                                      | none (private)                          |
| npm libs (axiom-mcp, firewand, btpay, stripe-firebase)      | Open-source libraries (memorai-mcp, glass-mcp removed 2026-09-15)     | npm + github                            |
| metric-time                                                 | Fun                                                                   | GH pages                                |
| resolve-action, pgp, devbox, cursuri-studiai, selfie-screen | Omitted                                                               | —                                       |
| Other 2025 repos                                            | Collapsed "Archive" timeline                                          | github where public                     |

### Round 2 (interview 2026-09-15, after `E:\gh` scan + Vercel/DNS probe)

Owner reviewed every repo with commits in 2025–2026. **Added (15)**: titi
(launching, titi-xi.vercel.app), dashy (active), caelia (launching), afti
(active client), vitals/remi (active), vsrchat (maintenance, public, VS
Marketplace), circus (hobby, sibling of circuit-tracks), tasks2 (maintenance,
public, Marketplace), bancai (case-study → Brivio successor), jucai
(archived), invitatii (case-study), mancai / editai / dexai (2025 case
studies — custom domains lapsed and Vercel aliases return 402, so no
`website`), abridge (research, public). **Removed (2)**: memorai, glass.
**Kept**: everything else, incl. datuvia, axiom, stripe-firebase, workspace-ai.
gta-nexus confirmed == existing `nexus` (enriched, still private). Link policy
enforced by `gh repo view --json visibility`: only PUBLIC repos get `repos`
(vsrchat, vscode-tasks2, dexai, abridge); all others `visibility: "private"`.
Registry now 36 projects; `src/data/projects.test.ts` 11/11.

## Work items

See `tracker.csv` for the live list. Summary by area:

- **A — Archive & upgrade**: remove contracts stack, upgrade all deps, flat ESLint, TS7 alias, fix build.
- **B — Foundation**: i18n, theme system, tokens, layout, fonts, motion presets.
- **C — Data**: project registry, GitHub data layer, types, tests.
- **D — Design**: restored static hero, home sections, cards, View Transitions, skeletons.
- **E — Pages**: projects, detail, about, open-source, now, uses, press.
- **F — SEO/AEO**: metadata, JSON-LD, sitemap, robots, llms.txt, OG, RSS, API.
- **G — Contact**: Server Action, Resend, Turnstile.
- **H — Quality**: husky, vitest, playwright, size-limit, ci-local, Actions, Renovate, Lighthouse.
- **I — Agent config**: instructions, skills, memory, hooks.
- **J — Publicity**: press kit, outlets, articles, Wikidata.

## Session log

### 2026-09-15 — v2.0.0 rebuild (portfolio-only)

Shipped in one day by parallel agents; rows A1–A6, B1–B5, C1–C2, D1–D4, E1–E7,
F1–F7, G1, I1–I3, J1–J3 marked `done` with evidence paths verified by `Test-Path`.
C3 and H1–H8 (registry tests, husky, Vitest, Playwright, size-limit, ci-local,
Actions, Renovate, tracker guard) closed the same day: 40 unit tests, 10 E2E
(incl. axe) pass, build OK, size 374 kB gz vs 400 kB budget. **47/47 rows done.**

**Decision (owner) — design reversal.** The WebGL2 "constellation" hero and the
scroll-linked timeline spring were rejected ("mult mai urât", perf) and deleted.
The v1 hero look (centred two-line headline, gradient second line, status
badge, tech pills, static glow + grid) was rebuilt on the new token/i18n/
registry stack. Standing rule: **no continuously animated objects** anywhere;
`e2e/home.spec.ts` asserts `canvas` count is 0. See `docs/DESIGN.md`.

- **Routes** (`src/app/[locale]/`): `/`, `/projects`, `/projects/[slug]`,
  `/about`, `/open-source`, `/now`, `/uses`, `/press`, `not-found`, per-route
  `loading.tsx`, `opengraph-image.tsx` (site + project).
- **Machine surfaces**: `sitemap.ts`, `robots.ts`, `manifest.ts`,
  `llms.txt/route.ts`, `llms-full.txt/route.ts`, `feed.xml/route.ts`,
  `api/projects/route.ts`, `api/projects/[slug]/route.ts`, `api/manifest/route.ts`,
  Server Action `actions/contact.ts`.
- **Components**: `hero/` (Hero, HeroReveal entrance stagger, TechStack pills); `home/` (Featured, NowStrip, OpenSourceStrip, ProjectsGrid,
  Timeline, TimelineRail, ActivityHeatmap); `projects/` (ProjectCard, ProjectFilters,
  useProjectFilters, ProjectList, ProjectGridSkeleton, RepoStatsPanel, cover, status);
  `layout/` (Header, Footer, SkipLink); `theme/` (ThemeProvider, ThemeMenu,
  LocaleSwitcher); `ui/` (Button, Badge, Section, Skeleton); `seo/JsonLd`;
  `contact/` (ContactSection, ContactForm); `now/Heatmap`; `open-source/`
  (ReposGrid, PackagesList); `press/CopyButton`; `icons/` (30 brand SVGs).
- **Data & lib**: `data/{projects,types,uses,press}.ts`; `lib/{github,llms,
projects-api,seo,site,theme,motion,og,env,utils}`; `i18n/{routing,request,
navigation}.ts`; `proxy.ts`; `messages/{en,ro}.json`.
- **Agent config**: `.github/copilot-instructions.md`, `.github/instructions/
{theme-tokens,i18n,seo-aeo}.instructions.md`, `.github/skills/{add-project,
theme-surface,release}/SKILL.md`, `AGENTS.md`, `README.md`, `LICENSE` (MIT),
  `.vscode/{settings,extensions}.json`.
- **Docs**: `DESIGN.md`, `PUBLICITY.md`, `WIKIDATA.md`, this tracker.
