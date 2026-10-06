# dragoscatalin.ro

Personal portfolio of **Dragoș Cătălin**, a product engineer and full-stack developer
in Romania. It is a calm, typographic portfolio with a centred hero, tech pills and a
static glow. A curated project registry is enriched with live GitHub data. The site is
RO/EN, has eight OKLCH accents (Ember by default) and machine-readable surfaces for
search and answer engines. The brand is Keystone: see [`brand/BRAND.md`](brand/BRAND.md).

Live: <https://dragoscatalin.ro> · Version in `package.json` (shown in the footer).

## Stack

Next.js 16.3 (App Router, RSC, `cacheComponents`, React Compiler, Turbopack) ·
React 19.3 (`ViewTransition`) · TypeScript 7 (`tsc`) with typescript-eslint on TS 6 ·
Tailwind CSS 4.3 (CSS-first `@theme inline`, OKLCH) · motion 13 · next-intl 4 ·
nuqs · zod 4 · Brivio mail API · Vercel BotID · schema-dts · feed ·
Vitest 5 · Playwright + axe · ESLint 10 flat · Prettier · husky + lint-staged ·
per-page first-load budget · Vercel Analytics / Speed Insights · Sentry (optional).

## Quick start

```powershell
pnpm install
Copy-Item .env.example .env.local   # fill what you need; everything is optional
pnpm dev                            # http://localhost:24789
```

Node 24 LTS, pnpm ≥ 12. Always `pnpm`.

## Scripts

| Script                                   | Purpose                                   |
| ---------------------------------------- | ----------------------------------------- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js on port 24789                     |
| `pnpm lint` / `pnpm lint:fix`            | ESLint flat config (`eslint .`)           |
| `pnpm format` / `pnpm format:check`      | Prettier                                  |
| `pnpm typecheck`                         | `tsc --noEmit`                            |
| `pnpm test` / `pnpm test:watch`          | Vitest unit tests                         |
| `pnpm test:e2e`                          | Playwright smoke + accessibility (axe)    |
| `pnpm size`                              | heaviest page's first-load JS budget      |
| `pnpm tracker:check`                     | validates `docs/tracker.csv`              |
| `pnpm ci:local`                          | runs the CI pipeline locally (WSL/Docker) |

## Environment variables (`.env.example`)

| Variable                                                                                    | Purpose                                                                                  |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                                                      | Canonical origin for metadata, sitemap, OG (default `https://dragoscatalin.ro`)          |
| `GITHUB_TOKEN`                                                                              | Fine-grained read-only PAT; without it live stats are skipped and registry data is shown |
| `BRIVIO_API_KEY`, `BRIVIO_API_URL`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`                | Contact form delivery via Brivio; without a key the form falls back to `mailto:`         |
| `CONTACT_HOOK_URL`, `CONTACT_HOOK_SECRET`                                                   | Optional signed phone notification (homepi hook) after a delivered message               |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | Error tracking; fully disabled when unset                                                |

Every integration no-ops cleanly when its variable is absent.

## Architecture

```
src/
	app/
		[locale]/            # en (root) + ro — root layout (html, fonts, providers, JSON-LD), OG image
			(site)/          # classic chrome + classic home + every content page (about, projects/[slug], …)
			skin/<id>/       # skin homes (editorial, constellation, command, devices) — proxy rewrite only
		api/                 # /api/projects, /api/projects/[slug], /api/manifest
		feed.xml/  llms.txt/  llms-full.txt/   # route handlers
		sitemap.ts  robots.ts  manifest.ts  globals.css
		 actions/contact.ts   # Server Action (Zod + honeypot + BotID + Brivio + homepi hook)
	components/
		hero/      # ConstellationCanvas (WebGL2 shader), StaticConstellation, HeroReveal
		home/      # Featured, NowStrip, OpenSourceStrip, ProjectsGrid, Timeline, ActivityHeatmap
		projects/  # ProjectCard, ProjectFilters (nuqs), ProjectList, RepoStatsPanel, cover
		layout/    # Header, Footer, SkipLink
		theme/     # ThemeProvider, ThemeMenu, LocaleSwitcher
		ui/        # Button, Badge, Section, Skeleton
		seo/       # JsonLd helpers (schema-dts)
		contact/   # ContactSection, ContactForm
		icons/     # brand SVGs (lucide has no brand icons)
	data/        # projects.ts (registry), types.ts, uses.ts, press.ts
	lib/         # github.ts, llms.ts, projects-api.ts, seo.ts, site.ts, theme.ts, motion.ts, og.tsx, env.ts
	i18n/        # routing.ts, request.ts (next/root-params), navigation.ts
	skins/       # registry.ts + one folder per skin (components, css) + shared/
	proxy.ts     # skin 404/preview/rewrite around the next-intl middleware
messages/      # en.json, ro.json (identical key trees)
docs/          # TRACKER.md, tracker.csv, DESIGN.md, PUBLICITY.md, WIKIDATA.md
```

### Data flow

`src/data/projects.ts` (curated registry, statuses, EN/RO copy) →
`src/lib/github.ts` (one GraphQL query, `"use cache"` + `cacheLife("days")`,
`cacheTag("github")`) → pages (`/projects`, `/projects/[slug]`, `/open-source`,
home strips) · `/api/projects*` · `llms.txt` · `feed.xml` · `sitemap.xml`.
Private projects are case studies without repo links.

### Theme system

`<html data-mode data-accent data-surface>` stamped before first paint by an
inline script (`src/lib/theme.ts`), persisted in cookie `dc-theme` +
localStorage. Modes dark/light/system, six accents (violet, indigo, cyan,
emerald, amber, rose), surfaces solid/glass/contrast. Components use only
semantic tokens from `globals.css`; raw palette classes are an ESLint error.

### Skins (V3-03)

A skin replaces the home page and its chrome; content pages are shared and only pick up the
skin's tokens via `html[data-skin]`. Classic (the original design) is the default. Preview on
any URL with `?skin=editorial|constellation|command|devices` (sets cookie `dc-skin` for a year
and 307s to the clean URL); `?skin=classic` goes back. The theme menu has a Skin group.
`src/proxy.ts` rewrites `/` and `/ro` to `src/app/[locale]/skin/<id>/`; `/skin/*` is a 404 and
skin homes keep canonical `/`. Rules and canvas policy: `docs/DESIGN.md` § Skins; recipe:
`.github/skills/add-skin/SKILL.md`.

### i18n

next-intl 4 with `localePrefix: "as-needed"` — EN at `/`, RO at `/ro`.
Reciprocal `hreflang` + `x-default` via `src/lib/seo.ts`. Romanian plurals use
the `few` category.

### SEO / AEO surfaces

| URL                                                          | Source                                    |
| ------------------------------------------------------------ | ----------------------------------------- |
| `/sitemap.xml`                                               | `src/app/sitemap.ts`                      |
| `/robots.txt`                                                | `src/app/robots.ts` (AI crawlers allowed) |
| `/manifest.webmanifest`                                      | `src/app/manifest.ts`                     |
| `/llms.txt`, `/llms-full.txt`                                | `src/lib/llms.ts`                         |
| `/feed.xml`                                                  | `src/app/feed.xml/route.ts`               |
| `/api/projects`, `/api/projects/{slug}`                      | `src/lib/projects-api.ts`                 |
| `/opengraph-image`, `/projects/{slug}/opengraph-image`       | `src/lib/og.tsx`                          |
| JSON-LD Person, WebSite, SoftwareApplication, BreadcrumbList | `src/components/seo/JsonLd.tsx`           |

## Brand

`brand/` is the brand pack: [`BRAND.md`](brand/BRAND.md) is the book, `brand.json` holds
the facts, `tokens.json` the DTCG tokens, `logo/` the SVG masters, `motion/` the logo-motion
preview and `concepts/` the five concept sheets. To regenerate:

```powershell
node brand/src/build.mjs                                     # masters, tokens, geometry.ts
node brand/scripts/contrast-gate.mjs brand/contrast-pairs.json  # WCAG proof (exit 1 on a fail)
pnpm assets:optimize                                          # favicon, icon.svg, apple, PWA, press logo
node brand/src/render-motion.mjs                             # motion preview
```

The display font is Bricolage Grotesque (OFL), subset by `brand/scripts/subset-fonts.py`.
Romanian glyphs are checked by `brand/scripts/check-glyphs.py`.

## Quality gates

husky pre-commit (lint-staged: ESLint + Prettier; version bump + CHANGELOG
required for `src/` changes) · `pnpm typecheck` · Vitest · Playwright smoke +
axe across accents × modes × surfaces · first-load budget (`pnpm size`) · `pnpm tracker:check` ·
`pnpm ci:local` mirrors GitHub Actions. Details in `docs/CI.md`.

## Deployment

Vercel, auto-deploy from `main`. Set the env vars above with `npx vercel env add`.
Verify live: `curl.exe -sI https://dragoscatalin.ro` (expect `x-vercel-id`), then
`/sitemap.xml`, `/llms.txt`, canonical + hreflang in the served HTML. Release
recipe: `.github/skills/release/SKILL.md`.

## Contributing / agents

Start at [`AGENTS.md`](AGENTS.md) → [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
Status lives in [`docs/TRACKER.md`](docs/TRACKER.md).

## License

[MIT](LICENSE) © 2026 Dragos Catalin Vladulescu. Project names and logos
belong to their respective owners.
