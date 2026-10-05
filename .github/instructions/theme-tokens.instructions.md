---
description: How to paint a surface with the OKLCH token system, motion and a11y rules
applyTo: "src/**/*.{tsx,css}"
---

# Theme tokens, motion, responsive, a11y

Source of truth: `src/app/globals.css` (`@theme inline`) and `docs/DESIGN.md`.
Theme state is stamped on `<html>` pre-paint by `THEME_INIT_SCRIPT`
(`src/lib/theme.ts`): `data-mode="dark|light"`,
`data-accent="ember|orange|amber|rose|violet|indigo|cyan|emerald"` (default ember, brand Keystone — `brand/BRAND.md`),
`data-surface="solid|glass|contrast"`,
`data-skin="classic|editorial|constellation|command|devices"` (from cookie `dc-skin`, default classic).

## Skins (`data-skin`, V3-03)

- Skin = home + chrome, in `src/app/[locale]/skin/<id>/` (thin route files) + `src/skins/<id>/`
  (components + `<id>.css`, imported only by that skin's layout). Shared bits: `src/skins/shared/`.
- Content pages restyle ONLY through `html[data-skin="<id>"]` token blocks in `globals.css`.
  `@theme inline` bakes values into utilities, so skins override the `--skin-font-display` /
  `--skin-radius-card` hooks and plain neutrals (`--bg`, `--surface`…) — keep each neutral at the
  classic lightness so contrast pairs hold. Classic has no block and must stay byte-for-byte styled.
- Skin CSS files use plain `:root` vars (`--line`, `--accent`, `--fg`…) and literal easings;
  fonts via utilities (`font-display`, `font-mono`).
- Skin chrome: no `usePathname` (proxy rewrite → hydration mismatch), no `aria-current`, a
  `data-skin-home="<id>"` root, `main#main`, and the `SkinTools` (theme menu, locale, Back to classic).
- Canvas only where `SKIN_META[id].hasCanvas` (constellation/devices, later tasks) — see DESIGN.md § Skins.

## Token vocabulary (use as Tailwind utilities: `bg-*`, `text-*`, `border-*`)

| Token                                          | Meaning                                                                                                                                                                                                                       |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bg` / `bg-deep`                               | page background / deeper bands                                                                                                                                                                                                |
| `surface` / `surface-raised`                   | cards, panels / hovered or nested panels                                                                                                                                                                                      |
| `fg` / `fg-muted` / `fg-subtle`                | body text / secondary / tertiary (≥ 4.5:1 in every mode)                                                                                                                                                                      |
| `line` / `line-strong`                         | borders / emphasised borders                                                                                                                                                                                                  |
| `accent` / `accent-strong` / `accent-soft`     | brand colour (hue from `data-accent`) / hover / tinted fills                                                                                                                                                                  |
| `accent-fg`                                    | text ON an accent fill                                                                                                                                                                                                        |
| `counter`                                      | complementary hue (`accent-h + 140°`) for gradients                                                                                                                                                                           |
| `success` / `warning` / `danger`               | status semantics only                                                                                                                                                                                                         |
| `shadow-glow`, `shadow-glow-sm`, `shadow-card` | glow uses `--accent-glow`                                                                                                                                                                                                     |
| `shadow-elev-1` / `-2` / `-3`                  | elevation: ambient + key shadow + 1px inner highlight; `-3` adds an accent ring. Header pill, primary buttons (press → `active:shadow-none`), cards (hover `-2`→`-3`), hero pills, badges (`shadow-[var(--elev-inset)]` only) |
| `rounded-card` (1.25rem), `rounded-pill`       | radii                                                                                                                                                                                                                         |
| `ease-out-expo`, `ease-spring`                 | easing tokens                                                                                                                                                                                                                 |

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

## Motion — CSS first, no continuously animated objects

**Owner rule (2026-09-15):** nothing on the site animates continuously — no
canvas, WebGL, rAF loops, orbiting objects or scroll-linked springs.
`e2e/home.spec.ts` asserts `canvas` count is 0. Entrance and hover only.

- **Prefer CSS keyframes** in `globals.css`: `.hero-item` (stagger via `--i`,
  `[data-lcp]` = transform-only so the LCP element is never hidden),
  `.hero-pill`, `.sheet-in`, `.pop-in`, `.skeleton`. All disabled under
  `prefers-reduced-motion`.
- `motion/react` is allowed **only in route-local components** (currently
  `ProjectList` on `/projects`). It is banned in Header / ThemeMenu / layout —
  it cost 44 KB gz on every page. Never put `initial="hidden"` on an LCP
  candidate.
- Presets in `src/lib/motion.ts` (`fadeUp`, `fade`, `stagger()`, `viewportOnce`)
  for the route-local cases; every use needs a `useReducedMotion()` branch.
- **No shared `layoutId` across conditionally rendered siblings** (crashes
  React 19). Active-tab indicators are plain spans.
- Scroll reveals: `whileInView` + `viewportOnce`, never continuous listeners.
- Shared-element navigation: `<ViewTransition name={coverTransitionName(slug)}>`
  from `react` (stable in 19.3), helper in `src/components/projects/cover.ts`.

## Responsive

- Wrap page content in `.container-x` (max `--container-max` = 88rem, fluid
  `padding-inline: clamp(1rem, 4vw, 3rem)`).
- \>21:9: `--container-max` grows to 104rem at ≥ 2200px and 120rem at ≥ 3000px
  with root font 17/18px; grids add a `3xl:` (2200px) column step. Backgrounds
  fill the viewport, content stays centred. Measure at 390 / 1440 / 2560 / 3440.
- Touch (`hover: none`): no tap highlight, `overscroll-behavior-y: none`,
  `touch-action: manipulation`, hidden scrollbars — native-app feel.
- The header is a **fixed floating pill**; `<main>` carries
  `HEADER_OFFSET_CLASS` (`pt-24 md:pt-28`) exported from `Header.tsx`.
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
- Run axe in e2e across the 8 accents × 2 modes × 3 surfaces.

## Skeletons

- Each route has `loading.tsx` mirroring the page layout with `Skeleton` /
  `SkeletonText` from `@/components/ui` (class `.skeleton`).
- Anything reading GitHub stats renders inside `<Suspense fallback={<Skeleton…/>}>`.
- Skeleton sizes match the final content to avoid layout shift.
