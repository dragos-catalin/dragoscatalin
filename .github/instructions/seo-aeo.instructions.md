---
description: SEO/AEO contract for every route and the ripple a new page or project must complete
applyTo: "src/app/**"
---

# SEO / AEO

Helpers: `src/lib/seo.ts` (`localeUrl`, `localeAlternates`, `ogImageUrl`),
`src/lib/site.ts` (site facts), `src/components/seo/JsonLd.tsx`
(`JsonLd`, `personJsonLd`, `webSiteJsonLd`, `softwareApplicationJsonLd`,
`breadcrumbJsonLd` — typed with `schema-dts`).

## Every page

- `export async function generateMetadata({ params })` with `title`,
  `description` from `messages/*.json` `meta`/page namespace, and
  `alternates: localeAlternates(locale, "/path")` (canonical + `en`/`ro`/`x-default`).
- `openGraph.url` = `localeUrl(locale, path)`; OG image comes from the nearest
  `opengraph-image.tsx` (root: `src/app/[locale]/opengraph-image.tsx`, project:
  `src/app/[locale]/projects/[slug]/opengraph-image.tsx`, drawn via `src/lib/og.tsx`
  — **hex colours only**, satori has no oklch).
- JSON-LD: `<JsonLd data={breadcrumbJsonLd([...])} />` on subpages;
  `softwareApplicationJsonLd(project, locale)` on project detail. Person +
  WebSite are emitted once in `src/app/[locale]/layout.tsx`.
- `generateStaticParams` for `[locale]` (and `[slug]`); nothing dynamic outside
  Suspense (cacheComponents trap).

## Machine surfaces (all derive from `src/data/projects.ts`)

| Route                                   | File                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `/sitemap.xml`                          | `src/app/sitemap.ts` — `STATIC_PATHS` + one entry per project per locale                         |
| `/robots.txt`                           | `src/app/robots.ts` — AI crawlers allowed, `/api/` disallowed                                    |
| `/manifest.webmanifest`                 | `src/app/manifest.ts`                                                                            |
| `/llms.txt`, `/llms-full.txt`           | `src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts` ← `src/lib/llms.ts` (`PAGES` list) |
| `/feed.xml`                             | `src/app/feed.xml/route.ts`                                                                      |
| `/api/projects`, `/api/projects/[slug]` | `src/app/api/projects/**` ← `src/lib/projects-api.ts`                                            |
| `/api/manifest`                         | `src/app/api/manifest/route.ts`                                                                  |

## Ripple for a NEW PAGE (all in one commit)

1. `src/app/[locale]/<page>/page.tsx` + `loading.tsx`, metadata as above.
2. `STATIC_PATHS` in `src/app/sitemap.ts`.
3. `PAGES` in `src/lib/llms.ts`.
4. Nav arrays in `src/components/layout/Header.tsx` and `Footer.tsx`.
5. `nav.<key>` + page namespace in `messages/en.json` AND `messages/ro.json`.
6. e2e: add the route to `e2e/seo.spec.ts` (canonical, hreflang, JSON-LD present).
7. `docs/TRACKER.md` + `docs/tracker.csv` row; CHANGELOG + version bump.

## Ripple for a NEW PROJECT

Adding to `src/data/projects.ts` auto-populates sitemap, llms, feed, API and
`/projects/[slug]`. Still verify each (see `skills/add-project`). Optional cover
in `public/projects/<slug>.png`.
