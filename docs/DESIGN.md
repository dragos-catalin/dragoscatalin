# Design brief — dragoscatalin.ro

Art direction contract. Every visual change is scored against this by the
`design-critic` pass. Product UI rules (a11y, reduced motion) still apply.

## SCENE: `/` (home)

> **Decision 2026-09-15** — the WebGL2 "constellation" hero was built and
> rejected by the owner (visual regression, perf cost). The v1 hero look was
> restored on top of the new token/i18n/registry stack. **No continuously
> animated objects** (canvas, shaders, scroll-linked springs, orbiting nodes)
> anywhere on the site. Motion is entrance-only or hover-only.

- **SUBJECT** — Calm, typographic hero: a centred two-line display headline
  (line 2 in `gradient-text` accent→counter), a status badge, one sentence,
  two pill CTAs and a wrapped row of technology pills with brand icons.
- **COMPOSITION** — Everything centred, `max-w-4xl`, ≥ 45 % negative space.
  Behind: one static ambient glow (`bg-accent-soft` blurred 120px) and a
  60px grid pattern at 3–5 % masked to the centre. Ultra-wide (>21:9): content
  stays `--container-max` (88rem) centred, background fills.
- **PALETTE (OKLCH, brand Keystone)** — slate neutrals, hue 265: dark base
  `oklch(0.155 0.016 265)`, surface `oklch(0.182 0.016 265)`, text
  `oklch(0.95 0.01 265)`. Light base `oklch(0.99 0.004 265)`, text
  `oklch(0.2 0.01 265)`. Accent = user-chosen, default **Ember**
  `oklch(0.68 0.19 42)` #f46622 (owner, gate A 2026-10-05); cool counter =
  accent hue +140°. Full table and proof: [`brand/BRAND.md`](../brand/BRAND.md).
- **LIGHTING** — a single soft accent glow behind the headline; page-wide
  static mesh (`.page-mesh`: one diagonal accent→counter gradient + one radial
  glow at the top). Nothing moves.
- **ATMOSPHERE** — film grain overlay at 2.5 % (`noise-overlay`), static.
- **TYPOGRAPHY** — Display: **Bricolage Grotesque** (`font-display`, 700/800,
  wdth 88, tight tracking −0.03em, sizes via `text-5xl → lg:text-8xl`) on the
  wordmark, h1 and section headings only. Body: Geist 400/500. Mono: Geist
  Mono for stats, versions, code. Two families plus mono, no more.
- **CHOREOGRAPHY** — entrance only: badge → headline → subtitle → CTAs rise
  with a 120 ms stagger (`HeroReveal`); tech pills fade in via pure CSS
  `animation-delay: 0.6s + i·40ms` (`.hero-pill`); settle by ~1.6 s. The only
  looping motion is the 1px scroll-hint dot and the badge ping, both CSS and
  both disabled under reduced motion.
- **INTERACTION** — pills lift 2px on hover; cards use `gradient-border`
  reveal on hover; sections reveal with `whileInView` once.
- **TRANSITION** — Project card → detail: React `<ViewTransition name="project-{slug}">`
  on the card cover; page content cross-fades. Back: reverse.
- **SOUND** — none.
- **ACCESSIBILITY** — `prefers-reduced-motion`: opacity-only fades, no pill
  stagger, no scroll dot. All text contrast ≥ 4.5:1 in every accent × mode.

## Theme system

- `data-mode="dark|light"` on `<html>` (system resolved client-side pre-paint).
- `data-accent="ember|orange|amber|rose|violet|indigo|cyan|emerald"` (default ember).
- `data-surface="solid|glass|contrast"` — glass adds backdrop blur +
  translucency to surfaces; contrast raises borders/text to AAA.
- Tokens live in `src/app/globals.css` under `@theme inline`; components use
  only semantic utilities (`bg-surface`, `text-fg`, `text-accent`,
  `border-line`). Raw palette classes (`bg-violet-500`) are banned.
- `data-skin="classic|editorial|constellation|command|devices"` (default classic) —
  see Skins below.

## Skins (V3-03)

A skin replaces the **home page and its chrome** (header, nav, footer). Every content page
(projects, about, services, lab, now, uses, press, open-source, privacy, feedbrake) is shared:
it keeps the classic chrome and only picks up the skin's tokens through
`html[data-skin="<id>"]` in `globals.css` (radius, display font, neutral tint at the same
lightness, so contrast pairs still hold).

| Skin            | Home                                                                 | Canvas policy                                   |
| --------------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| `classic`       | The original design (this file's SCENE). **Default.**                | none, ever                                      |
| `editorial`     | Magazine masthead, kinetic headline (CSS), numbered index of work    | none                                            |
| `constellation` | Night sky; static SVG starfield poster, projects as stars            | allowed from V3-05 (R3F), poster stays fallback |
| `command`       | Terminal `whoami` + `ps` process table, monospace, keyboard hint     | none                                            |
| `devices`       | Wall of CSS device frames (watch/phone/desktop/TV) with shots/covers | allowed from V3-07 (3D carousel), 2D fallback   |

- **Mechanics** — cookie `dc-skin` (1 year). `?skin=<id>` on any URL sets it and 307s to the
  clean URL; `?skin=classic` or an invalid id clears it. `src/proxy.ts` rewrites `/` and `/ro`
  to the static `src/app/[locale]/skin/<id>/` route; direct `/skin/*` URLs are 404. The theme
  menu has a Skin group; skin chrome always shows "Back to classic".
- **Canvas guardrails** (constellation/devices, later tasks): mount after LCP and only when
  the device passes a low-end gate, `frameloop="demand"`, pause offscreen and in hidden tabs,
  never under `prefers-reduced-motion` (the static poster IS that fallback), budget-gated.
  `SKIN_META[id].hasCanvas` in `src/skins/registry.ts` is the allowlist; e2e asserts zero
  canvases until then.
- **Rules** — skin chrome never uses `usePathname` (rewrite → hydration mismatch), so nav has
  no `aria-current`. Skin homes keep canonical `/` / `/ro` and are not in the sitemap or
  llms.txt. Every skin passes `pnpm scan:contrast`, `pnpm scan:layout`, axe and Lighthouse.
  Recipe for a new skin: `.github/skills/add-skin/SKILL.md`.

## Brand (Keystone, V3-02)

The brand book is [`brand/BRAND.md`](../brand/BRAND.md), with facts in `brand/brand.json`
and DTCG tokens in `brand/tokens.json`.

- **Mark** — a solid D with the C carved out of it, on a slate tile. The D takes
  `--accent-mark` (the live accent at L 0.68) and the tile is `--mark-tile`. Render it with
  `BrandMark`, never as an `<img>`.
- **Wordmark** — "Dragoș Cătălin" in Bricolage 720, with the comma of ș drawn as a round
  accent drop (`Wordmark`). Use diacritics and no family name.
- **Logo motion** — CSS only, header only, once per session (`<html data-intro>`):
  the D lands, the C is carved, the comma drops (~1 s). Hover: the C turns −90°. Reduced
  motion: final frame.
- **Icons and OG** — generated from `brand/logo/` by `scripts/optimize-assets.mjs`.
  `src/lib/og.tsx` uses hex values and the Bricolage TTF cuts.

## Section signatures (home)

| Section     | Subject                                           | Motion                  |
| ----------- | ------------------------------------------------- | ----------------------- |
| Hero        | Centred headline + tech pills, static glow/grid   | entrance stagger only   |
| Now         | Terminal-style status strip, live GitHub activity | typewriter once         |
| Flagships   | 2 large cards (codai, brivio) with product cover  | cover parallax on hover |
| Projects    | Filterable grid, `<ViewTransition>` covers        | stagger reveal          |
| Open source | Packages with live downloads/stars                | count-up                |
| Timeline    | Year rail (2015→2026), static gradient rail       | items reveal once       |
| Contact     | Minimal form, Turnstile                           | none                    |

## Anti-patterns to reject

Stock photos · centred everything · 3 identical cards in a row · raw Tailwind
palette classes · animations without reduced-motion variant · text on flat
colour without atmosphere · **any continuously running animation (canvas,
WebGL, rAF loops, scroll-linked springs)** — rejected by the owner for perf.
(Exception planned by the owner in V3: the constellation and devices skins only, under the
guardrails in § Skins. Classic, editorial and command stay canvas-free.)
