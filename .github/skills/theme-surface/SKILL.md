---
name: theme-surface
description: >-
  Design or add a themed component for dragoscatalin.ro following docs/DESIGN.md: semantic
  tokens only, glass/contrast variants, reduced motion, then verify contrast and axe across the
  8 accents × 2 modes × 3 surfaces. Use for any new section, card, hero or visual redesign.
---

# Theme surface

## Before code

1. Read `docs/DESIGN.md` (scene, palette, choreography, anti-patterns) and
   `.github/instructions/theme-tokens.instructions.md`.
2. Write a 5-line scene description: subject, composition, lighting (accent key
   / counter fill), motion arc, reduced-motion fallback. For high-craft surfaces
   run the `artist-designer` skill first.

## Build

- Tokens only (`bg-surface`, `text-fg-muted`, `border-line`, `text-accent`,
  `shadow-glow`, `rounded-card`). Add missing tokens to `src/app/globals.css`
  `@theme inline`, never inline `oklch()`.
- Wrap in `.container-x`; use `Section` / `Badge` / `Button` from `@/components/ui`.
- Motion via presets in `src/lib/motion.ts`; `useReducedMotion()` branch; no
  shared `layoutId`.
- Server component unless it needs state; `"use client"` leaf only.
- Strings in `messages/en.json` + `messages/ro.json`.

## Verify matrix: 8 accents × 2 modes × 3 surfaces (48 combos)

Playwright snippet (put in `e2e/theme-matrix.spec.ts`):

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ACCENTS = ["ember", "orange", "amber", "rose", "violet", "indigo", "cyan", "emerald"];
const MODES = ["dark", "light"];
const SURFACES = ["solid", "glass", "contrast"];

for (const accent of ACCENTS)
  for (const mode of MODES)
    for (const surface of SURFACES) {
      test(`axe ${accent}/${mode}/${surface}`, async ({ page }) => {
        await page.goto("/");
        await page.evaluate(
          ([a, m, s]) => {
            const h = document.documentElement;
            h.setAttribute("data-accent", a!);
            h.setAttribute("data-mode", m!);
            h.setAttribute("data-surface", s!);
          },
          [accent, mode, surface],
        );
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
          .analyze();
        expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
      });
    }
```

Run: `pnpm test:e2e -- e2e/theme-matrix.spec.ts` (dev server on 24789 or
Playwright `webServer`). Also test the component's own route.

## Design-critic pass (mandatory before "done")

Invoke the `design-critic` skill with screenshots of dark+light at 390 px and
1440 px. It scores against `docs/DESIGN.md`: negative space 40–55 %, two type
families, accent key + counter fill, no centred-everything, no three identical
cards, reduced-motion variant present. Fix anything below 8/10.

## Bookkeeping

CHANGELOG + version bump; tracker row (area `design`) with evidence paths;
stage explicit paths only.
