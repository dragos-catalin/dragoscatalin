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
| Gates         | husky pre-commit/pre-push, lint-staged, Vitest, Playwright smoke, per-page first-load budget, version+CHANGELOG gate, `scripts/ci-local.mjs` (WSL/Docker), Actions self-hosted w/ hosted fallback, Renovate.                          |
| Analytics     | Vercel Analytics + Speed Insights + Sentry (env-gated).                                                                                                                                                                               |
| Hosting       | Vercel.                                                                                                                                                                                                                               |
| Publicity     | `/press` kit, outlet list, dev.to articles, Wikidata/Wikipedia draft later (needs independent coverage first).                                                                                                                        |

## v3 — redesign + platform (interview 2026-10-05, rounds 4–5)

Goal: a from-scratch, premium v3 of dragoscatalin.ro with switchable skins, every
current project, and contact mail/notifications through Brivio + vmui/Home
Assistant, with every gate green. Rows `V3-*` in `tracker.csv`.

### Owner decisions

| Question          | Decision                                                                                                                                                                                                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design direction  | Full redesign from scratch: new identity, new layout system. Replaces the 2026-09-15 "no continuously animated objects" rule.                                                                                                                                                                                                                                       |
| Motion budget     | 3D/shader allowed with guardrails: lazy after LCP, pause offscreen/hidden tab, poster on low-end + reduced-motion, Lighthouse ≥ 98.                                                                                                                                                                                                                                 |
| Skins             | All four concepts become switchable **skins**: Constellation (3D orbit, morph into case study), Command center (terminal/⌘K), Device wall (3D device carousel), Editorial (kinetic type, GSAP pinned chapters). More skins can be added later.                                                                                                                      |
| Skin architecture | The proxy reads a `skin` cookie and rewrites to static `/[locale]/_s/[skin]/…`, so only the active skin's JS is downloaded. Switch from the theme menu or ⌘K with a View Transition crossfade. Registry + `add-skin` skill.                                                                                                                                         |
| Default skin      | Owner decides after seeing all four (V3-08).                                                                                                                                                                                                                                                                                                                        |
| Animation stack   | Motion (upgrade to 14) and GSAP freely. Lenis on desktop only, native scroll on touch.                                                                                                                                                                                                                                                                              |
| Mobile            | Bottom tab bar, sheets, swipe, haptics where supported, safe-area aware, installable PWA with offline shell.                                                                                                                                                                                                                                                        |
| Visual identity   | **Done (v2.9.0): brand Keystone**: a solid D with the C carved out, Bricolage Grotesque display + Geist body, the comma of ș as the Romanian cue, Ember #f46622 as default accent. Pack in `brand/` (`BRAND.md`, `brand.json`, DTCG `tokens.json`, `logo/`, `motion/`).                                                                                             |
| Positioning       | Superseded by the V3-34 owner profile below: headline "I build products end to end — from cloud and network to the app in your pocket.", backed by real numbers.                                                                                                                                                                                                    |
| Languages shown   | Measured set from the repos (TS, Kotlin/Compose, Rust, Python, SQL, Go, C#, Dart/Flutter, Swift, PowerShell, C/C++), plus an "also worked with" row for legacy tech.                                                                                                                                                                                                |
| Projects          | Add: Horae (published faces only + "200 faces, N live" teaser, auto-synced from `watch-faces/docs/store/play-apps.csv`), scrin, marcai, caelia, titi, vitals, HIDE, axiom, VS Code extensions (Just Black 2, Tasks2, VS Remote Chat, prakter), notalone, alegeri2025, afti (demo built in days, client never replied; no consent needed), datuvia, Unscroll, dashy. |
| Paused sites      | vsrchat, notai.ro, metu.ro return 402 → status `paused`, no live link; CI link-health check.                                                                                                                                                                                                                                                                        |
| Email             | Mailbox `catalin@dragoscatalin.ro` + aliases hello@, contact@, no-reply@ + catch-all; forward to vladulescu.catalin@gmail.com, keep a copy in Brivio.                                                                                                                                                                                                               |
| DNS               | Move DNS hosting to Brivio (ns1/ns2.fabricai.ro), keep the registrar; recreate all existing records first. `home.*` certificate renewal moves to a lego `exec` provider that calls Brivio `/v1/dns` (dry-run first).                                                                                                                                                |
| Brivio work       | Fix the JMAP send bug and the cross-org DNS auto-publish bug first, then build the webmail From/alias picker, the `email.received` webhook and a double-opt-in newsletter subscribe endpoint.                                                                                                                                                                       |
| Notifications     | Contact action → HMAC-signed POST → Tailscale Funnel on one path of homepi (`/hooks/contact`) → vmui `/api/hooks/contact` → new `contact` notify kind → FCM + HA phone fallback + optional light flash.                                                                                                                                                             |
| Contact form      | Brivio `/v1/email/send` replaces Resend. Vercel BotID + WAF rate limits + honeypot; Turnstile removed.                                                                                                                                                                                                                                                              |
| Extras            | ⌘K palette, live "now" (GitHub + now.mdx + signed PC push to Edge Config), MDX case studies (RO+EN required) + blog (single language allowed) + RSS, AI "ask my portfolio" via codai, stats wall (GitHub, npm/PyPI, VS Marketplace, Play Reporting API), newsletter via Brivio, easter eggs.                                                                        |
| Hosting/deps      | Stay on Vercel. Push the 9 pending v2.x commits first after gates. Latest versions everywhere.                                                                                                                                                                                                                                                                      |
| Order             | baseline → in parallel: brivio fixes/features, vmui hook, brand + design briefs → mail/DNS setup with the owner logged in → skins → features → reality check.                                                                                                                                                                                                       |
| Owner profile     | The next agent asks the owner question sets and stores the answers locally (memory) and in codai production for vladulescu.catalin@gmail.com (agent-memory).                                                                                                                                                                                                        |

### Owner profile (V3-34, answered 2026-10-05)

Stored in agent memory (`/memories/owner-profile.md`) and in codai production memory
(10 semantic records via MCP `memory_store`, recall verified with `memory_search`).

| Topic         | Answer                                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Public name   | "Dragoș Cătălin" with diacritics; no family name on the public site.                                                          |
| Roles         | Product engineer · founder · full-stack developer · cloud systems & networking · architect.                                   |
| Location      | România (remote, EU).                                                                                                         |
| Experience    | "20+ years of code, 15+ years paid" (coding since ~10, first paid at 15, first legal job at 18).                              |
| Availability  | Selective — open to the right projects.                                                                                       |
| Headline      | "I build products end to end — from cloud and network to the app in your pocket." (RO translation by the agent.)              |
| Tone          | Direct, warm, concrete; first person, short sentences, real numbers.                                                          |
| Brand (V3-02) | Chose **E · Keystone** + Ember #f46622 (gate A, 2026-10-05); refinements delegated. Gate E: review `brand/motion/intro.webm`. |
| Photo         | Portrait in About + small avatar in footer/OG; photo comes later — DC monogram until then.                                    |
| Site goal     | Well-paid consulting/project leads. Products in equal rotation (no single hero product).                                      |
| Audience      | Startups/founders (end-to-end MVP), RO SMEs (invoicing, e-Factura, automation), enterprise/EU (cloud, network), developers.   |

### Areas

baseline · upgrade · brand · skins · mobile · motion · content · projects ·
features · contact · brivio · mail · vmui · gates · docs · agent-memory · reality

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
- **P — Performance**: Lighthouse 100×4 desktop, client bundle diet (no zod /
  motion globally), HTML + asset diet, LHCI gate, mobile CWV.

### 2026-09-15 — v2.2.0 → v2.3.0 design system + performance

- **Design (owner round 3)**: orange default accent (7 accents), elevation
  system `shadow-elev-1/2/3`, floating pill header, `CoverArt` deterministic
  SVG covers, `DeviceShowcase` + weekly screenshot pipeline (`pnpm shots`,
  Actions PR into `public/shots/`), ultra-wide `3xl` grids, touch ergonomics.
- **Performance (measured, prod build)**: desktop 100/100/100/100 on all 5
  routes (from 88–100 / 96 / 96 / 92). Root causes, in order of impact: motion
  `initial="hidden"` on the LCP headline (1.7 s), skeleton-behind-GitHub on
  grids (0.9 s), zod in the client bundle via `clientEnv` (100 KB gz), CoverArt
  emitting hundreds of SVG nodes (321 KB HTML), 1.3 MB logo in the header,
  `--fg-subtle` at 3.92:1. Mobile: A/BP/SEO 100, perf 91–100, TBT 250 → 40 ms.
  Gates added so none can return: ESLint `no-restricted-imports` (zod/env in
  components), pre-commit asset-size gate, size-limit 300 kB, LHCI hard
  thresholds, `pnpm lh` local sweep.
- **Wrong hypothesis recorded**: `preload: false` on the sans font made mobile
  FCP _worse_ (1057 → 1360 ms); reverted. Mono `preload: false` helped.

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
