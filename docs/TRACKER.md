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

| Question          | Decision                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design direction  | Full redesign from scratch: new identity, new layout system. Replaces the 2026-09-15 "no continuously animated objects" rule.                                                                                                                                                                                                                                                                         |
| Motion budget     | 3D/shader allowed with guardrails: lazy after LCP, pause offscreen/hidden tab, poster on low-end + reduced-motion, Lighthouse ≥ 98.                                                                                                                                                                                                                                                                   |
| Skins             | All four concepts become switchable **skins**: Constellation (3D orbit, morph into case study), Command center (terminal/⌘K), Device wall (3D device carousel), Editorial (kinetic type, GSAP pinned chapters). More skins can be added later.                                                                                                                                                        |
| Skin architecture | Cookie `dc-skin` (set by `?skin=<id>` → 307, or the theme menu Skin group). `src/proxy.ts` rewrites `/` and `/ro` to static `src/app/[locale]/skin/<id>/` (one folder per skin, so only that skin's code loads); `/skin/*` is 404. Content pages stay in `(site)` with classic chrome and restyle via `html[data-skin]`. Registry `src/skins/registry.ts` + `add-skin` skill. Done in 2.10.0 (V3-03). |
| Default skin      | **Classic**, on every device including mobile (owner, 2026-10-06, V3-08). Other skins stay opt-in via `?skin=` or the theme menu.                                                                                                                                                                                                                                                                     |
| Animation stack   | Motion (upgrade to 14) and GSAP freely. Lenis on desktop only, native scroll on touch.                                                                                                                                                                                                                                                                                                                |
| Mobile            | Bottom tab bar, sheets, swipe, haptics where supported, safe-area aware, installable PWA with offline shell.                                                                                                                                                                                                                                                                                          |
| Visual identity   | **Done (v2.9.0): brand Keystone**: a solid D with the C carved out, Bricolage Grotesque display + Geist body, the comma of ș as the Romanian cue, Ember #f46622 as default accent. Pack in `brand/` (`BRAND.md`, `brand.json`, DTCG `tokens.json`, `logo/`, `motion/`).                                                                                                                               |
| Positioning       | Superseded by the V3-34 owner profile below: headline "I build products end to end — from cloud and network to the app in your pocket.", backed by real numbers.                                                                                                                                                                                                                                      |
| Languages shown   | Measured set from the repos (TS, Kotlin/Compose, Rust, Python, SQL, Go, C#, Dart/Flutter, Swift, PowerShell, C/C++), plus an "also worked with" row for legacy tech.                                                                                                                                                                                                                                  |
| Projects          | Add: Horae (published faces only + "200 faces, N live" teaser, auto-synced from `watch-faces/docs/store/play-apps.csv`), scrin, marcai, caelia, titi, vitals, HIDE, axiom, VS Code extensions (Just Black 2, Tasks2, VS Remote Chat, prakter), notalone, alegeri2025, afti (demo built in days, client never replied; no consent needed), datuvia, Unscroll, dashy.                                   |
| Paused sites      | vsrchat, notai.ro, metu.ro return 402 → status `paused`, no live link; CI link-health check.                                                                                                                                                                                                                                                                                                          |
| Email             | Mailbox `catalin@dragoscatalin.ro` + aliases hello@, contact@, no-reply@ + catch-all; forward to vladulescu.catalin@gmail.com, keep a copy in Brivio.                                                                                                                                                                                                                                                 |
| DNS               | Move DNS hosting to Brivio (ns1/ns2.fabricai.ro), keep the registrar; recreate all existing records first. `home.*` certificate renewal moves to a lego `exec` provider that calls Brivio `/v1/dns` (dry-run first).                                                                                                                                                                                  |
| Brivio work       | Fix the JMAP send bug and the cross-org DNS auto-publish bug first, then build the webmail From/alias picker, the `email.received` webhook and a double-opt-in newsletter subscribe endpoint.                                                                                                                                                                                                         |
| Notifications     | Contact action → HMAC-signed POST → Tailscale Funnel on one path of homepi (`/hooks/contact`) → vmui `/api/hooks/contact` → new `contact` notify kind → FCM + HA phone fallback + optional light flash.                                                                                                                                                                                               |
| Contact form      | Brivio `/v1/email/send` replaces Resend. Vercel BotID + WAF rate limits + honeypot; Turnstile removed.                                                                                                                                                                                                                                                                                                |
| Extras            | ⌘K palette, live "now" (GitHub + now.mdx + signed PC push to Edge Config), MDX case studies (RO+EN required) + blog (single language allowed) + RSS, AI "ask my portfolio" via codai, stats wall (GitHub, npm/PyPI, VS Marketplace, Play Reporting API), newsletter via Brivio, easter eggs.                                                                                                          |
| Hosting/deps      | Stay on Vercel. Push the 9 pending v2.x commits first after gates. Latest versions everywhere.                                                                                                                                                                                                                                                                                                        |
| Order             | baseline → in parallel: brivio fixes/features, vmui hook, brand + design briefs → mail/DNS setup with the owner logged in → skins → features → reality check.                                                                                                                                                                                                                                         |
| Owner profile     | The next agent asks the owner question sets and stores the answers locally (memory) and in codai production for vladulescu.catalin@gmail.com (agent-memory).                                                                                                                                                                                                                                          |

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
- **infra — Repository and CI plumbing**: GitHub org, shared workflows,
  Renovate preset, deploy wiring.

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

### 2026-10-06 — V3-12..14 project model, new projects, link health (2.15.0)

- **Model**: `platforms`, typed `stores` (host-checked), sourced `metrics`, `teaser`,
  `listings`, status `paused`. Rendered on detail pages and cards, in `/api/projects`,
  `llms-full.txt` and the SoftwareApplication JSON-LD. Helpers: `src/lib/project-links.ts`.
- **Projects added**: Horae, MarcAI, scrin, Feedbrake (slug `unscroll`), alegeri2025,
  Just Black 2, prakter. Horae numbers come from `node scripts/sync-horae.mjs`
  (`watch-faces/docs/store/play-apps.csv` + `faces/` modules) into the committed
  `src/data/horae.json` — re-run it after new Play uploads (206 built, 14 live today).
- **Sources**: local repos (README, AGENTS.md, manifests, docs/TRACKER), Microsoft
  Store pages (codai 9NT1T78Q4VKM, Brivio 9P9J0P8V8FCP), VS Marketplace gallery API and
  Open VSX API (counts as of 2026-10-06), Google Play listing pages. Left out as
  unverified: Play links for codai, titi, vitals, brivio, marcai, scrin, Feedbrake
  (all 404 = internal testing / not published), `@vitals/client` / `@abridge/sdk` /
  `@brivio/sdk` on npm (404), winget/Scoop entries, mixai.ro (no DNS).
- **Paused**: notai, metu, VS Remote Chat (402). `pnpm links:projects` checks every
  registry URL; weekly job `projects` in `links.yml`.

### 2026-10-06 — contact form sends From contact@ (V3-22 follow-up)

- Brivio CI-0073 (`e341f2d72`, prod v0.349.9): a mailbox can be an API sender through a
  Stalwart app password kept in Secret Manager, so its aliases (contact@, hello@) are valid
  From addresses. Vercel `CONTACT_FROM_EMAIL=contact@dragoscatalin.ro`, prod redeployed.
  VERIFIED: live form on `/ro#contact` → Brivio inbox of catalin@ shows From
  `contact@dragoscatalin.ro`.

### 2026-10-06 — V3-08 default skin decided

- Owner: **classic** stays the default on desktop and mobile. `DEFAULT_SKIN` was already
  `classic`; added an e2e that a cookie-less first visit gets the classic home with no
  `dc-skin` cookie. `e2e/skins.spec.ts` 42/42 against production (chromium + mobile).

### 2026-10-06 — V3-04..07 skins live (2.13.0), V3-20 newsletter live end to end

- Skins: editorial (GSAP kinetic headline + pinned chapters), constellation (lazy R3F sky
  behind a low-end gate, SVG poster stays), command (real prompt, `/` / ⌘K), devices
  (CSS-3D ring). three.js is in no page's first load; scans 0; e2e 128 passed. The default
  skin (V3-08) waits for the owner to look at all five.
- Newsletter: Brivio fixed in `16c2c0c2e` (shipped in v0.347.9); live form → confirmation
  email → `/ro/newsletter/confirmed`, confirmed by the owner. Verifying a sending domain now
  reports whether it can send as itself.

### 2026-10-06 — V3-29 certificates via Brivio, V3-20 newsletter (2.12.0)

- V3-29 done: home.* and mui.* renew through lego `--dns exec` → Brivio
  `/api/dns/acme` with per-device `brv_dns_` tokens limited to
  `_acme-challenge*` TXT (vmui `d7fb24c`). Staging dry-runs, then a forced prod
  renewal (home.* valid to 2027-01-04). home.* had been down since 09-18
  (Caddy boot race) — fixed with a systemd drop-in.
- V3-20 shipped as 2.12.0 (`/newsletter`, double opt-in, consent evidence);
  live subscriptions wait for a Brivio fix: `/v1/marketing/subscribers`
  answers 400 because `subscribers` is missing from the web id-guard allowlist.

### 2026-10-06 — v2.14.0 classic home redesign (V3-41)

- Owner found the classic home "urât" and asked for a new layout that represents
  him, keeping the Keystone brand. Audit of prod: mid-word headline break,
  unequal card widths, empty flagship covers, hollow Now card, crowded timeline.
- New: split hero + "What I ship" stack panel, "How I can help" bento, flagship
  surfaces bento, even project grid, year ledger. Details in CHANGELOG 2.14.0.

### 2026-10-06 — v2.11.1 OSS 0.2 milestones on /lab (V3-40)

- agentcfg-audit 0.2: VS Code gate (`extension/`) that verifies a workspace's
  agent config on open and locks the workspace chat settings on failure.
- agentq 0.2: pre-tool hooks for Claude Code, Codex, Copilot CLI and VS Code
  that rewrite builds, installs, deploys and commits into `agentq run`.
- device-pairing 0.2: UniFFI Kotlin bindings tested on a JVM, per-app `Domain`;
  dashy moved onto the crate with SPAKE2 as link protocol v2 (ADR-0007 there).
- `/lab` approach text updated EN + RO; CI run ids in `docs/tracker.csv` V3-40.

### 2026-10-06 — v2.10.1 three OSS scaffolds on /lab (V3-39)

- D-07 agentcfg-audit, D-01 agentq (with the ACP-Lock 0.1 draft, P-01) and D-20
  device-pairing were built as new repos in `dragos-catalin`, scanned with
  gitleaks over their full history, and made public with the owner's approval.
- `/lab` moves all three from exploring to building with repo links. The
  approach text says what 0.1 does today and what comes next.
- The first CI runs on the new repos were cancelled ("job was not acquired by
  Runner of type hosted") during a GitHub Actions major outage. A rerun was green.

### 2026-10-05 — v2.9.4 → v2.9.6 move to org dragos-catalin (V3-38)

- The repo moved from `dragoscv/dragoscatalin` to `dragos-catalin/dragoscatalin`.
  The Vercel project `dragoscatalin-ro` follows the repository id, so no re-link
  was needed.
- Vercel Hobby cannot build private repositories owned by an organisation, so
  pushes stopped deploying. The owner made the repo public, after a gitleaks
  full-history scan came back green and `.env.example` was checked for values.
  Going public alone did not restore push deploys. The project's git link had
  been rewritten in place to the new owner, and it needed an explicit unlink and
  link (`DELETE` then `POST /v9/projects/{id}/link`).
- CI was red before the move (prettier on brand HTML, a 7 px overflow on
  `/feedbrake/privacy` at 360 px). After the move `gitleaks-action` also
  needed a licence. All fixed: the secrets job is now the shared
  `security.yml@v1`, and `renovate.json` extends `github>dragos-catalin/renovate-config`.

### 2026-10-05 — v2.8.2 Feedbrake pages (V3-37)

- `/feedbrake` (product page) and `/feedbrake/privacy` (privacy policy for the
  Android app, package `ro.dragoscatalin.unscroll`), EN + RO, in sitemap and
  llms.txt, metadata via `localeAlternates`, indexable.
- `/unscroll` and `/unscroll/privacy` (+ `/en`, `/ro` prefixes) redirect 308 to
  the Feedbrake paths; the Play Console privacy URL promised earlier keeps working.
- `PLAY_URL` in `src/data/feedbrake.ts` is `null` until the app is published; the
  page shows "Coming soon on Google Play" until then. Site tokens only (no
  per-page accent exists, so the brand coral is not used).

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
