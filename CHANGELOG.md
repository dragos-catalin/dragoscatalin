# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [2.13.0] - 2026-10-06

### Added

- **Four skins come alive (V3-04..07), for the owner to pick the default (V3-08).**
  - **Editorial:** GSAP SplitText kinetic headline (letters rise per line; the server HTML is the finished h1, `aria-label` keeps the sentence) and pinned horizontal chapters of the work on desktop with a fine pointer, with a scroll progress bar; a vertical numbered list on touch, small screens and reduced motion; a focused off-screen chapter scrolls into view.
  - **Constellation:** a React Three Fiber night sky (custom point shader, slow orbit, twinkle, pointer parallax, flagship stars joined in the accent colour) lazy-loaded after `load` + idle on top of the unchanged SVG poster, behind a low-end gate (reduced motion, webdriver, ≤ 4 cores, < 4 GB, Save-Data, no WebGL2), `frameloop="demand"` at ≤ 30 fps only while visible.
  - **Command center:** a real prompt — `help`, `whoami`, `ls projects`, `open <slug>`, `cd <page>`, `skin <id>`, `history`, `clear`, Tab completion, history arrows, Ctrl+L — focused from anywhere with `/` or ⌘K (never while typing elsewhere), output in a live region, plus a monitor strip (uptime, build, projects by status). Server HTML stays the complete `whoami` + `ps` page.
  - **Device wall:** a CSS-3D ring of device mockups with previous/next buttons, arrow keys, swipe and a pausable auto-advance (off under reduced motion); only the front slide is focusable; the server HTML is a 2D scroll-snap row, also used below `md` and under reduced motion.
- Dependencies: `gsap` 3.15.0, `three` 0.186.1, `@react-three/fiber` 9.8.1 (each loaded only by its skin's route), `@types/three`.
- e2e `skins-v3.spec.ts` (prompt, shortcut not hijacking the contact form, ring + inert slides, reduced-motion 2D row, accessible kinetic headline, no canvas in lab runs, axe with motion on); unit tests for the command parser, carousel math and the sky gate/accent parsing.

## [2.12.0] - 2026-10-06

### Added

- **Newsletter with double opt-in via Brivio (V3-20).** New `/newsletter` page (EN + RO) whose Server Action calls Brivio `POST /v1/marketing/subscribers` with consent evidence (wording version, wording text, end-user IP and user agent — Brivio stores the text and IP only as hashes). Brivio sends the confirmation email and, after the click, redirects to `/newsletter/confirmed` (noindex). Explicit consent checkbox, honeypot, per-instance rate limit and Vercel BotID on `/newsletter` + `/ro/newsletter`. Linked from both footers, listed in the sitemap and `llms.txt`; the privacy page gains a Newsletter section (art. 6(1)(a)).

## [2.11.1] - 2026-10-06

### Changed

- `/lab`: the three OSS projects reach 0.2. **agentcfg-audit** ships a VS Code gate that verifies a workspace's agent config when it opens and switches it off when the signature fails or an unsigned repo has a high-severity finding. **agentq** ships pre-tool hooks for Claude Code, Codex, Copilot CLI and VS Code that rewrite builds, installs, deploys and commits into `agentq run`. **device-pairing** ships UniFFI Kotlin bindings and per-app domain strings, and dashy now pairs on it with SPAKE2 as link protocol v2. EN + RO. Trackers: V3-40 in `docs/tracker.csv`; D-07, D-01, P-01 and D-20 in `docs/portfolio/portfolio.csv`.

## [2.11.0] - 2026-10-06

### Changed

- **Contact form via Brivio (V3-22).** Messages go through Brivio `POST /v1/email/send` (verified sending domain dragoscatalin.ro, Idempotency-Key, 10 s timeout) instead of Resend. After a delivered message, `after()` posts an HMAC-signed notification to the homepi Funnel hook (`x-dc-timestamp` / `x-dc-nonce` / `x-dc-signature`), which pushes it to the phone.
- Bot protection is now invisible Vercel BotID (`instrumentation-client.ts` + `withBotId`) plus the honeypot and rate limit; Cloudflare Turnstile and its widget are removed. Privacy text EN + RO updated.

### Removed

- `resend` and `@marsidev/react-turnstile`; env `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.

## [2.10.1] - 2026-10-06

### Changed

- `/lab`: agentcfg-audit, agentq and device-pairing move from exploring to building, each with a link to its public repository in `dragos-catalin`. agentq's entry mentions the ACP-Lock 0.1 protocol draft. Trackers: V3-39 in `docs/tracker.csv`; D-07, D-01, P-01 and D-20 in `docs/portfolio/portfolio.csv`.

## [2.10.0] - 2026-10-06

### Added

- **Skins (V3-03).** A skin replaces the home page and its chrome; content pages are shared and only pick up the skin's tokens via `html[data-skin]`. **Classic** (the current design) stays the default and renders as before. Four new skin homes, CSS/SVG only for now: **Editorial** (masthead, kinetic headline, numbered index), **Constellation** (static starfield poster, projects as stars), **Command** (terminal `whoami` + `ps` table, keyboard hint) and **Devices** (CSS watch/phone/desktop/TV frames with screenshots or cover art). EN + RO.
- Preview on production with `?skin=editorial|constellation|command|devices` (sets cookie `dc-skin` for a year and 307s to the clean URL); `?skin=classic` clears it. The theme menu has a new Skin group; skin chrome has "Back to classic".
- `src/skins/registry.ts` (`SKINS`, `SKIN_META`), `SKIN_COOKIE` / `isSkin` / `DEFAULT_SKIN` in `src/lib/theme.ts`, `THEME_INIT_SCRIPT` stamps `data-skin` pre-paint. Skill `.github/skills/add-skin`.
- Tests: `src/proxy.test.ts`, `src/skins/registry.test.ts`, new `data-skin` cases in `theme-init.test.tsx`, `e2e/skins.spec.ts` (every skin: home, /ro, content page, axe; `?skin=` set/clear; `/skin/*` 404; theme-menu switch). `scan:contrast`, `scan:layout`, `pnpm lh -- --skin <id|all>` and the Lighthouse workflow cover every skin.

### Changed

- Routing: `src/app/[locale]/layout.tsx` keeps html/fonts/providers/JSON-LD; the classic header/main/footer moved to the route group `src/app/[locale]/(site)/layout.tsx` together with every page (URLs unchanged). Skin homes live in static `src/app/[locale]/skin/<id>/` folders reached only through the `src/proxy.ts` rewrite of `/` and `/ro`; direct `/skin/*` URLs are 404, skin homes keep canonical `/` and are not in the sitemap or llms.txt.

### Fixed

- Weekly `Screenshots` workflow: the bot commit for the refresh PR ran the husky version/CHANGELOG gate and failed (run 37306871390). That step now sets `SKIP_HOOKS=1`, and the PR still runs full CI.

## [2.9.6] - 2026-10-05

### Changed

- `renovate.json` now extends the shared `github>dragos-catalin/renovate-config` preset. It keeps `rangeStrategy: pin`, because every dependency here is pinned exactly.
- The repository is public, so the Vercel Hobby team builds it on push again. Hobby cannot build private repositories owned by an organisation.
- Trackers: V3-38 in `docs/tracker.csv`, X-08 in `docs/portfolio/portfolio.csv`.

## [2.9.5] - 2026-10-05

### Fixed

- `/feedbrake/privacy` overflowed by 7 px at 360 px: the unbroken `raw.githubusercontent.com/...` host in the Network paragraph could not wrap. The paragraph and the rules link now use `wrap-anywhere`. `pnpm scan:layout` in CI had been failing on it.
- FeedBrake rules links now point to `dragos-catalin/unscroll-rules`. The repository moved to the organisation, and the old `raw.githubusercontent.com/dragoscv/...` URL used by the app still answers 200.
- CI: the `secrets` job used `gitleaks-action`, which needs a paid licence for organisation repositories and failed after the move. It is now the shared `dragos-catalin/workflows` `security.yml@v1` job, which runs the gitleaks CLI over the full history plus osv-scanner. `format:check` had been red since the brand kit landed. It now ignores the generated `brand/**/*.html` previews.

## [2.9.4] - 2026-10-05

### Changed

- The repository moved to the GitHub organisation `dragos-catalin`. The footer "Source" link and the self-hosted runner commands in `docs/CI.md` now point to `github.com/dragos-catalin/dragoscatalin`. The old URL redirects. The Vercel project `dragoscatalin-ro` follows the repository id, so deploys continue without a re-link.

## [2.9.3] - 2026-10-05

### Changed

- **New headline** (owner decision, V3-34 profile): "I build products end to end — from cloud and network to the app in your pocket." / RO "Construiesc produse cap-coadă — de la cloud și rețea până la aplicația din buzunarul tău." Hero, OG image, page title, meta description, web manifest, JSON-LD `jobTitle` and `llms.txt` now say "product engineer & founder" instead of "full-stack developer". The press bios and About copy follow in V3-11.

## [2.9.2] - 2026-10-05

### Changed

- `/lab`: mcp-lock 0.2 is public at github.com/dragoscv/mcp-lock. The entry now links the repository and describes the runtime proxy. EN + RO.

## [2.9.1] - 2026-10-05

### Changed

- `/lab`: mcp-lock moves from "Exploring" to "Building". Version 0.1 works today: lock, check, and stdio and HTTP servers. The runtime proxy comes next. EN + RO.
- `docs/portfolio`: D-03 and X-04 are done. P-03 is in progress.

## [2.9.0] - 2026-10-05

### Added

- **Brand Keystone** (V3-02). The mark is a solid D with the C carved out of it. The wordmark is "Dragoș Cătălin" in Bricolage Grotesque, with the comma of ș drawn as a round accent drop. The brand pack lives in `brand/`:
  - `BRAND.md` covers usage, clear space, minimum sizes, don'ts, palette, type and voice.
  - `brand.json` holds the facts, and `tokens.json` holds the DTCG 2025.10 tokens.
  - `logo/` has the SVG masters: mark, 16 px cut, mono, construction, wordmarks and lockups.
  - `src/build.mjs` is the single generator for all of the above.
- **Display font: Bricolage Grotesque.** It is subset to Latin, Latin Extended-A and ȘșȚț as a 43 KB variable WOFF2 (wght 700–800) and loaded with `next/font/local` and `display: swap`. It is used on the wordmark, h1 and section headings. The Romanian glyph gate passes on every shipped file. The OFL licence ships in `src/fonts/OFL.txt`.
- **Logo motion, CSS only.** On the first page load of a session, the header mark plays its intro: the D lands, the C is carved in one stroke, and the comma drops into the wordmark (about 1 s). On hover or focus, the carved C turns 90°. With reduced motion, the final frame shows. Preview for the owner: `brand/motion/intro.webm` and `intro-frames.png`.
- **Ember accent** (`data-accent="ember"`, #f46622) is the new default. Orange stays switchable, for 8 accents in total.
- New icon set, generated from the masters by `pnpm assets:optimize`:
  - `favicon.ico` (16/32/48, with a pixel-tuned 16 px cut) and `icon.svg`
  - full-bleed `apple-icon.png`
  - PWA icons at 192 and 512, plus a maskable 512
  - a 1024 press-kit logo, down from 1.3 MB to 29 KB

### Changed

- **Palette values moved to Keystone.** Neutrals are now slate (hue 265). The semantic token names did not change. `brand/contrast-pairs.json` proves 101 pairs with 0 WCAG 2.2 AA failures.
- Header and footer use the new mark and wordmark. Between 768 and 1024 px the header shows the mark only, so the six nav items fit.
- OG images show the mark, the wordmark with its comma, and Bricolage titles. The glow is an SVG radial gradient, because satori clips `filter: blur`.
- The public name is now **Dragoș Cătălin**, with diacritics and without the family name. This applies to titles, the manifest, the footer and the feed. The full name stays only where it is needed: the privacy controller line and JSON-LD `alternateName`.
- `scan:contrast` now checks the Ember default.
- **`pnpm size` now measures what a visitor downloads.** `scripts/check-first-load.mjs` sums the gzip of every JS chunk each prerendered page references; the heaviest page must stay within `first-load-budget.json` (300 kB; today `/projects` at 275.4 kB). It replaces size-limit, whose sum of all chunks grew to 305.8 kB only because Turbopack split the `next/image` runtime into per-route copies once the header stopped using it (per-page totals moved by ±1 kB). size-limit and `.size-limit.json` are removed.

### Removed

- `public/logo-64.webp`, `public/logo-128.webp`, `public/apple-icon.png` and `src/app/icon.png`. The inline SVG mark and the file-convention icons replace them.

## [2.8.2] - 2026-10-05

### Added

- **`/feedbrake`** (V3-37), EN + RO: the product page for Feedbrake, the Android app that blocks only the infinite short-video feed (TikTok For You, Instagram Reels and Home, YouTube Shorts, Facebook Reels) and leaves the rest of the app working. It lists the features, the privacy model and the public, signed detection rules. It says "Coming soon on Google Play" until `PLAY_URL` in `src/data/feedbrake.ts` is set.
- **`/feedbrake/privacy`**, EN + RO: the app's privacy policy (effective 2026-10-05), the URL used in the Play Console.
- `/unscroll` and `/unscroll/privacy` (the app's working name) redirect permanently (308) to the Feedbrake pages, with and without a locale prefix.
- Both pages are in the sitemap and `llms.txt`. `e2e/feedbrake.spec.ts` checks status, canonical, hreflang, axe and the redirects.

## [2.8.1] - 2026-10-05

### Fixed

- 24 px minimum tap targets (WCAG 2.5.8) for the GitHub repo links on `/now` and the latest-release links in the project repo panel. They render only when `GITHUB_TOKEN` is set, so the new CI `scan:layout` gate caught them on the first run and the local run did not. The local check now builds with a token too.

### Added

- `docs/portfolio/PROMPTS.md`: a ready-to-paste prompt for each kept product and infra row (phase 5), plus a progress table in `PORTFOLIO.md`.

## [2.8.0] - 2026-10-05

### Security

- **Next.js 16.3.5 → 16.3.8.** This fixes a critical remote code execution bug in `next/og` `ImageResponse` (affects 16.2.0–16.3.5). Every OG image route here used it.
- `pnpm audit --audit-level high` is now clean. Overrides in `pnpm-workspace.yaml` pin the fixed `brace-expansion` and `fast-uri`. One advisory is ignored, with the reason written down: GHSA-vfj7-8cjw-p6xm (`braces`). It has no fix, it is reachable only at lint time, and it only sees globs we write.

### Changed

- **Every dependency is on its latest version** (V3-01), checked with `npm view`. Highlights: `@sentry/nextjs` 11.4, `next-intl` 4.14.9, `lucide-react` 1.52, `eslint` 10.12, `vitest` 5.0.3, `vite` 8.3.2, `size-limit` 14.1, `prettier` 3.9.9 and `motion` 14.0. Motion 14 only removes internal APIs, so `motion/react` usage is unchanged. `typescript-eslint` stays at 8.70 because it comes in through `eslint-config-next`.
- **Sentry 11, server-only, with an explicit `dataCollection`.** In v11 an unset `dataCollection` collects everything. `src/lib/sentry.ts` now turns off user info, cookies, headers, bodies, query strings, stack-frame variables, database, queue and AI payloads. `src/instrumentation.ts` initialises Sentry only when `SENTRY_DSN` is set and captures request errors. There is no client SDK, so first-load JS is unchanged and no consent category is needed. `withSentryConfig` now comes from `@sentry/nextjs/config`, and the removed `disableLogger` option is gone.
- **Node 24 LTS everywhere** (S-03): `.nvmrc`, `engines` (`node >=24`, `pnpm >=12`), all workflows (now read from `.nvmrc`), the `ci:local` Docker image, the README and agent instructions.
- `sharp` and `lighthouse` are declared as dev dependencies (S-03). `pnpm lh` runs the pinned Lighthouse instead of `npx lighthouse@latest`.

### Added

- **`/services`** (S-05), EN + RO:
  - one section per audience from the owner profile: startups, Romanian SMEs, enterprise/EU and developers;
  - each section lists what you get, proof links to registry projects and how we work;
  - a four-step process, a selective-availability note and CTAs to the contact form;
  - `ProfessionalService` + `OfferCatalog` JSON-LD;
  - data lives in `src/data/services.ts`.
- **`/lab`** (S-05), EN + RO: a public idea log of the OSS ideas the owner chose to build in the open (mcp-lock, agentcfg-audit, agentq, e-Factura SDK, wff-dsl, device-pairing).
  - Each entry has a stage, the problem, the approach, tags and an "updated" date.
  - The page has `ItemList` JSON-LD.
  - Ids equal `docs/portfolio/portfolio.csv` rows, and a test enforces it.
- Both pages are wired everywhere:
  - Header: Services. Footer: Services and Lab.
  - Sitemap, `llms.txt` and `llms-full.txt` (with the full services and lab text).
  - The axe sweep, the contrast and layout scans, and `e2e/services.spec.ts`.
- **`exactOptionalPropertyTypes`** is on in `tsconfig.json`. This needed 6 small fixes: optional `stats` props, the Sentry build options, and the Playwright config.

### Fixed

- The commit lock now works in a git worktree. `scripts/lib/commit-lock.mjs` joined the cwd with an absolute `--git-dir`, so pre-commit failed with ENOENT. It now uses the common git dir, so all worktrees share one lock. Because of this bug, 2.8.0 landed in two commits: the first carried only this changelog and the lock fix.
- **CI gates** (S-01, S-02):
  - `format:check` and `pnpm audit --audit-level high` run in CI.
  - `scan:contrast` and `scan:layout` run against `next start` before E2E.
  - A new `secrets` job runs gitleaks over the full history.
  - `ci:local` mirrors the same steps.
- `.github/workflows/links.yml` and `lychee.toml`: a weekly lychee check over the live sitemap and `llms.txt`. Broken links open or update one `links` issue.

## [2.6.0] - 2026-10-05

### Added

- **Cookie consent** under Law 506/2004 art. 4(5), ePrivacy art. 5(3) and GDPR art. 7. Nothing optional runs before an explicit choice:
  - Vercel Analytics and Speed Insights mount only after an "analytics" opt-in (`ConsentedAnalytics`).
  - The Turnstile script loads only once the visitor focuses the contact form.
- The banner gives "Reject all" and "Accept all" equal prominence, plus a "Customise" option.
- The preferences dialog is a native `<dialog>`: focus trap, Escape to close, `role="switch"` toggles, axe-clean.
- A "Cookie settings" button in the footer lets visitors change or withdraw consent at any time. Withdrawing reloads the page so scripts that already ran stop.
- The choice is stored in the `dc-consent` cookie (6 months, versioned). Visitors are asked again when the categories change.
- New `/privacy` page (EN + RO) listing every stored item. It is in the sitemap, `llms.txt` and the footer.
- Tests: `src/lib/consent.test.ts` (unit) and `e2e/consent.spec.ts` (no optional requests before a choice, reject persists, preferences keyboard and axe, privacy table). The other E2E projects start with a stored "reject" choice.

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
