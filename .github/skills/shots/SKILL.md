---
name: shots
description: >-
  Generate, refresh or debug the weekly project screenshots (public/shots/) that power the
  project card covers and the DeviceShowcase gallery: run pnpm shots locally or via the
  GitHub Action, add an authenticated internal page, validate the manifest, and wire a new
  project's live URL so it gets captured. Use when a card shows the SVG placeholder for a live
  project, when adding a project with a website, or when the weekly PR fails.
---

# Screenshots pipeline

Design decision (owner, 2026-09-15): screenshots are **generated in CI weekly,
committed as static JPEGs** under `public/shots/<slug>/`, and served from the
CDN. Zero runtime cost; `CoverArt` (deterministic SVG) is the fallback.

## Files

- `scripts/shots.mjs` — Playwright capture. Targets = every registry project
  with a `website` (+ http(s) `surfaces[].url`, deduped), skipping `archived`,
  read from `${SHOTS_BASE_URL}/api/projects`.
- `public/shots/manifest.json` — `{ generatedAt, shots: { [slug]: { url, capturedAt, files } } }`.
- `src/lib/shots.ts` — zod-free reader (`getShots`, `shotSrc`, `hasShots`) —
  imported by client cards, so **no zod here**.
- `src/lib/shots.schema.ts` — zod schema, tests + tooling only.
- `scripts/check-shots-manifest.mjs` — pre-commit gate when `public/shots/**` is staged.
- `.github/workflows/shots.yml` — Mondays 05:00 UTC + `workflow_dispatch(only, force)`;
  opens PR `chore(shots): weekly screenshot refresh` on `chore/shots-refresh`.
- `shots.config.json` — optional authenticated internal pages per slug.

## Capture matrix

`desktop` 1440×900 · `tablet` 1024×1366 · `mobile` 390×844 × `dark` / `light`
(`emulateMedia`), plus `full-dark` (full page, ≤ 4000 px). JPEG q82.
Keys: `desktop-dark`, `mobile-light`, … `full-dark`.

## Run locally

```powershell
pnpm shots -- --dry-run --base http://localhost:24789     # list targets, no browser
pnpm shots -- --only titi,codai --force                    # real capture, ignore 6-day freshness
node scripts/check-shots-manifest.mjs                      # validate + files exist
```

Then commit `public/shots/**` (explicit paths). The card cover switches from
`CoverArt` to `shotSrc(slug, "desktop-dark")` automatically; the project page
shows `DeviceShowcase` once `getShots(slug)` returns files.

## Add an authenticated internal page

1. Log in once in a Playwright context and save `storageState` JSON.
2. Store it as a repo secret, e.g. `SHOTS_STATE_BRIVIO`.
3. In `shots.config.json`:
   ```json
   {
     "brivio": {
       "storageStateSecret": "SHOTS_STATE_BRIVIO",
       "pages": [{ "name": "dashboard", "path": "/app" }]
     }
   }
   ```
4. Add `SHOTS_STATE_BRIVIO: ${{ secrets.SHOTS_STATE_BRIVIO }}` under `env:` in
   `shots.yml` — GitHub cannot glob secrets, each must be listed.
   Output: `brivio/dashboard-desktop-dark.jpg` etc.

## New project with a live URL

Set `website` in `src/data/projects.ts` → next weekly run captures it, or
`workflow_dispatch` with `only=<slug>`. Lapsed domains (402/DNS dead) must NOT
have `website` — probe first (`Invoke-WebRequest -Method Head`).

## Failure modes

- Cookie banner in the shot → extend the accept regex / hide selector in `shots.mjs`.
- Site needs JS-rendered fonts → 800 ms wait is already there; bump per-target if needed.
- PR opens with no changes → freshness skip; pass `force=true`.
- `check-shots-manifest` fails "does not exist" → a file was deleted but the
  manifest still lists it; rerun `pnpm shots -- --only <slug> --force`.
