---
name: add-project
description: >-
  Add or update a project in the dragoscatalin.ro registry (src/data/projects.ts) and verify
  every derived surface: detail page, OG image, sitemap, llms.txt, /api/projects, tracker,
  CHANGELOG and version bump. Use when the user says "add project X", "publish X on the site",
  or changes a project's status/links.
---

# Add a project

The registry is the ONLY place projects live (`src/data/projects.ts`, typed by
`src/data/types.ts`). Components never hardcode project names or links.

## 1. Interview (use askQuestions, one round)

slug · display name · tagline EN/RO · summary EN/RO (1–3 paragraphs, `\n\n`) ·
optional story (problem/approach/outcome EN/RO) · status · category ·
visibility · featured? · years from/to · stack · surfaces (label + url) ·
repos (owner/name) · packages (registry/name) · website · hue · related ·
disclaimer. Ask whether a cover PNG exists.

## 2. Vocabulary

- `status`: `live` · `launching` · `active` · `research` · `maintenance` · `case-study` · `archived`
- `category`: `product` · `platform` · `tool` · `library` · `research` · `hobby` · `client`
- `visibility`: `public` | `private`
- `hue` (OKLCH degrees) drives the cover gradient (`coverGradient` in
  `src/components/projects/cover.ts`, default 272). Pick the brand hue; keep
  ≥ 30° apart from neighbouring featured projects. Existing: codai 300, brivio 215.

## 3. Link policy

- `visibility: "private"` ⇒ NO `repos`, presented as a case study. Only
  allowlisted public mirrors are allowed (`dragoscv/brivio-releases`,
  `brivio-ro/brivio-sdk-*`). The registry test fails otherwise.
- `website`/`surfaces` URLs are fine for private products (they are public URLs).

## 4. Entry shape (all fields)

```ts
{
    slug: "example",
    name: "Example",
    tagline: { en: "One line.", ro: "O linie." },
    summary: { en: "Para 1.\n\nPara 2.", ro: "Paragraf 1.\n\nParagraf 2." },
    story: {
        problem: { en: "", ro: "" },
        approach: { en: "", ro: "" },
        outcome: { en: "", ro: "" },
    },
    status: "active",
    category: "tool",
    visibility: "public",
    featured: false,
    order: 10,
    years: { from: 2025 }, // to?: 2026
    stack: ["Next.js", "TypeScript"],
    surfaces: [{ label: "Web", url: "https://example.ro" }],
    repos: [{ owner: "dragoscv", name: "example", label: "Source" }],
    packages: [{ registry: "npm", name: "example" }],
    website: "https://example.ro",
    hue: 160,
    cover: "example.png", // public/projects/example.png
    related: [{ slug: "codai", relation: "part-of" }],
    disclaimer: { en: "experimental, unaudited", ro: "experimental, neauditat" },
},
```

Insert in the right section comment (Flagships / Products / Tools / …);
`featuredProjects` sorts by `order`.

## 5. Cover (optional)

`public/projects/<slug>.png`, 1200×630, no text baked in. Without it the
gradient cover from `hue` is used.

## 6. Verify (run, show output)

```powershell
pnpm test              # registry tests: unique slug, required fields, link policy
pnpm typecheck
pnpm lint
```

With `pnpm dev` on 24789, open and check console clean:
`/projects/<slug>`, `/ro/projects/<slug>`, `/projects/<slug>/opengraph-image`,
`/llms.txt` (lists it), `/sitemap.xml` (both locales), `/api/projects/<slug>`,
`/feed.xml`.

## 7. Bookkeeping (same commit)

- `docs/tracker.csv` + `docs/TRACKER.md` (project statuses table if status changed).
- `CHANGELOG.md` entry under Unreleased; `npm version --no-git-tag-version patch`.
- Stage explicit paths only: `git add src/data/projects.ts public/projects/<slug>.png docs/tracker.csv docs/TRACKER.md CHANGELOG.md package.json`.
