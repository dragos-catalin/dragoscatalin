---
description: How to paint a surface with the OKLCH token system, motion and a11y rules
applyTo: "src/**/*.{tsx,css}"
---

# Theme tokens, motion, responsive, a11y

Source of truth: `src/app/globals.css` (`@theme inline`) and `docs/DESIGN.md`.
Theme state is stamped on `<html>` pre-paint by `THEME_INIT_SCRIPT`
(`src/lib/theme.ts`): `data-mode="dark|light"`,
`data-accent="violet|indigo|cyan|emerald|amber|rose"`,
`data-surface="solid|glass|contrast"`.

## Token vocabulary (use as Tailwind utilities: `bg-*`, `text-*`, `border-*`)

| Token                                          | Meaning                                                      |
| ---------------------------------------------- | ------------------------------------------------------------ |
| `bg` / `bg-deep`                               | page background / deeper bands                               |
| `surface` / `surface-raised`                   | cards, panels / hovered or nested panels                     |
| `fg` / `fg-muted` / `fg-subtle`                | body text / secondary / tertiary (≥ 4.5:1 in every mode)     |
| `line` / `line-strong`                         | borders / emphasised borders                                 |
| `accent` / `accent-strong` / `accent-soft`     | brand colour (hue from `data-accent`) / hover / tinted fills |
| `accent-fg`                                    | text ON an accent fill                                       |
| `counter`                                      | complementary hue (`accent-h + 140°`) for gradients          |
| `success` / `warning` / `danger`               | status semantics only                                        |
| `shadow-glow`, `shadow-glow-sm`, `shadow-card` | glow uses `--accent-glow`                                    |
| `rounded-card` (1.25rem), `rounded-pill`       | radii                                                        |
| `ease-out-expo`, `ease-spring`                 | easing tokens                                                |

Raw palette classes are an ESLint error (`no-restricted-syntax` in
`eslint.config.mjs`). Never write `oklch(...)` literals in components — add a
token to `globals.css` instead.

## Variants

- `dark:` — custom variant on `[data-mode="dark"]`.
- `glass:` / `contrast:` — custom variants on `data-surface`. `.surface` already
  becomes translucent + `backdrop-filter` under glass; contrast raises `line`
  and maps `fg-muted` → `fg`. Design for solid first; test the other two.
- Helpers in `@layer components`: `.container-x`, `.surface`, `.gradient-text`,
  `.glow`, `.gradient-border`, `.noise-overlay`, `.skeleton`.

## Motion (motion 13, `import { motion, useReducedMotion } from "motion/react"`)

- Presets in `src/lib/motion.ts`: `fadeUp`, `fade`, `scaleIn`, `stagger()`,
  `viewportOnce`, `baseTransition`, `springTransition`. Reuse them.
- Every animation needs a reduced-motion variant: `useReducedMotion()` →
  opacity-only, or rely on the global `prefers-reduced-motion` CSS clamp.
- **No shared `layoutId` across conditionally rendered siblings** (crashes
  React 19). Active-tab indicators are plain spans.
- Scroll reveals: `whileInView` + `viewportOnce`, never continuous listeners.
- Shared-element navigation: `<ViewTransition name={coverTransitionName(slug)}>`
  from `react` (stable in 19.3), helper in `src/components/projects/cover.ts`.

## Responsive

- Wrap page content in `.container-x` (max `--container-max` = 88rem, fluid
  `padding-inline: clamp(1rem, 4vw, 3rem)`).
- \>21:9: backgrounds/scenes fill the viewport, content stays centred at 88rem.
- Safe areas: body already pads `env(safe-area-inset-bottom)`; fixed bars add
  `pb-[env(safe-area-inset-bottom)]`.
- Touch targets ≥ 44×44 px (`min-h-11 min-w-11`) for every control.
- Type scales with `clamp()`; never below 16px body on mobile.

## Accessibility checklist

- Every control has a name: visible label, `aria-label`, or `<label htmlFor>`.
- Toggles use `aria-pressed`; selects/menus use `role="menu"`/`menuitemradio`
  with `aria-checked` (see `ThemeMenu.tsx`).
- Dialogs: `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap, Esc closes.
- Rely on the global `:focus-visible` outline; never `outline-none` without a
  replacement ring.
- Decorative canvases/SVG: `aria-hidden`; meaningful ones `role="img"` + `aria-label`.
- Colour is never the only signal (add icon or text).
- Run axe in e2e across the 6 accents × 2 modes × 3 surfaces.

## Skeletons

- Each route has `loading.tsx` mirroring the page layout with `Skeleton` /
  `SkeletonText` from `@/components/ui` (class `.skeleton`).
- Anything reading GitHub stats renders inside `<Suspense fallback={<Skeleton…/>}>`.
- Skeleton sizes match the final content to avoid layout shift.
