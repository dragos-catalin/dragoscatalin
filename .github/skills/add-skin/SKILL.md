---
name: add-skin
description: >-
  Add (or rework) a skin on dragoscatalin.ro — a replacement home page + chrome selected by the
  dc-skin cookie / ?skin= preview, with content pages restyled only through html[data-skin]
  tokens. Covers registry, route folder, components, tokens, messages, tests, scans, Lighthouse
  and budgets. Use when the owner asks for a new skin or a skin home redesign (V3-04..07).
---

# Add a skin

Architecture and rules: `docs/DESIGN.md` § Skins, `.github/instructions/theme-tokens.instructions.md`
§ Skins, `.github/copilot-instructions.md` rule 11. Copy an existing skin (`command` is the
smallest) and rename.

## 1. Registry

- `src/skins/registry.ts`: append the id to `SKINS` and add `SKIN_META[<id>]`
  (`hasCanvas: false` unless DESIGN.md allows it). `SKIN_HOMES` derives from it.
- Hard-coded lists to extend (plain `.mjs`, no TS import): `scripts/contrast-scan.mjs`,
  `scripts/layout-scan.mjs`, `scripts/lighthouse-local.mjs`, `scripts/lighthouserc-skin.mjs`,
  `.github/workflows/lighthouse.yml` (one lhci step per skin), `e2e/skins.spec.ts` `SKIN_HOMES`.

## 2. Route + components (self-contained)

- `src/app/[locale]/skin/<id>/layout.tsx` (imports `@/skins/<id>/<id>.css`, renders the chrome)
  and `page.tsx` (`generateMetadata` = `skinHomeMetadata(params)`; render the home). Static
  folder — never a `[skin]` segment (bundles every skin) and never `_skin` (private, unroutable).
- `src/skins/<id>/`: `<Id>Chrome.tsx`, `<Id>Home.tsx`, `<id>.css`, anything else the skin needs.
  Reuse `src/skins/shared/` (`SkinBrand`, `SkinNav`, `SkinTools`, `SkinFooter`, `teaserProjects`,
  `skinHomeMetadata`). Projects only from `src/data/projects.ts`.
- Chrome contract: root `data-skin-home="<id>"`, a `<header>` with `SkinNav` + `SkinTools`
  (theme menu, locale link, Back to classic), `<main id="main">`, a `<footer>`; an `h1` with
  `hero.titleLine1` / `hero.titleLine2`; a `#contact` section (`ContactSection`) so `/#contact`
  works. **No `usePathname`** in skin chrome (proxy rewrite → hydration mismatch), no
  `aria-current`. Server components + CSS by default; client JS only for interaction.
- Motion: CSS, transform-only on the h1 (LCP), everything off under `prefers-reduced-motion`.
  `motion/react` / three.js only route-local and only when `hasCanvas` allows a scene (lazy after
  LCP, low-end gate, `frameloop="demand"`, pause offscreen/hidden, poster fallback).

## 3. Tokens for content pages

- `src/app/globals.css` § Skins: `html[data-skin="<id>"] { … }` — only `--skin-radius-card`,
  `--skin-font-display` and neutral tints at the **same lightness** as the defaults (mode-scoped
  with `[data-mode="dark"]` / `:not([data-mode="dark"])`). Never touch classic values.

## 4. Messages

- `skins.<id>.name` + `skins.<id>.description` (+ any skin copy) in BOTH `messages/en.json` and
  `messages/ro.json`; `node scripts/check-messages.mjs`.

## 5. Verify (show each output line)

```powershell
pnpm lint; pnpm typecheck; pnpm test          # registry.test.ts checks route + messages per skin
pwsh -NoProfile -File "$env:USERPROFILE\.copilot\hooks\run-build.ps1" -Purpose 'skin <id>' -TimeoutMin 120 -Wait -Command 'pnpm build'
pnpm size                                     # skin pages are in .next/server/app → budgeted
# own async terminal: pnpm exec next start --port 24792
node scripts/contrast-scan.mjs http://localhost:24792   # 0 findings
node scripts/layout-scan.mjs http://localhost:24792     # 0 findings
$env:PW_BASE_URL='http://localhost:24792'; pnpm exec playwright test e2e/skins.spec.ts e2e/home.spec.ts --reporter=line
pnpm lh -- --base http://localhost:24792 --skin <id>
curl.exe -s -H "Cookie: dc-skin=<id>" http://localhost:24792/ | rg 'data-skin-home="<id>"'
```

## 6. Ship

Tracker row (`docs/tracker.csv` + `docs/TRACKER.md`, evidence = real paths,
`pnpm tracker:check`), CHANGELOG + minor version bump, commit via `agentq commit -Paths …`,
then live: `curl.exe -s -H "Cookie: dc-skin=<id>" https://dragoscatalin.ro/` and
`curl.exe -s -o NUL -w '%{http_code}' https://dragoscatalin.ro/skin/<id>` = 404.
