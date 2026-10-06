# Design brief — dragoscatalin.ro

Art direction contract. Every visual change is scored against this by the
`design-critic` pass. Product UI rules (a11y, reduced motion) still apply.

## SCENE: `/` (home)

> **Decision 2026-09-15** — the WebGL2 "constellation" hero was built and
> rejected by the owner (visual regression, perf cost). The v1 hero look was
> restored on top of the new token/i18n/registry stack. **No continuously
> animated objects** (canvas, shaders, scroll-linked springs, orbiting nodes)
> anywhere on the site. Motion is entrance-only or hover-only.

- **SUBJECT** — (V3-41, 2026-10-06, owner asked for a new layout "representative
  of me") Asymmetric hero: left, status badge + mono eyebrow, a two-line display
  headline (line 2 in `gradient-text`, OKLCH accent→accent/counter mix), one
  sentence, two pill CTAs. Right, the **"What I ship" panel**: six layers from
  pocket to network (`src/data/stack.ts`), each with the registry projects that
  prove it. Tech pills sit below as a left-labelled band.
- **COMPOSITION** — 1.15fr / 0.85fr grid on `lg`, stacked below; text left-aligned
  on the golden-ratio line, ≥ 40 % negative space. Behind: one static ambient glow
  top-left of the headline and the 60px grid at 3–5 %. Ultra-wide: content stays
  `--container-max`, background fills.
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

| Skin            | Home                                                                                                                                             | Canvas policy                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `classic`       | The original design (this file's SCENE). **Default.**                                                                                            | none, ever                             |
| `editorial`     | Magazine cover: GSAP SplitText headline, pinned horizontal chapters (desktop, fine pointer); vertical list on touch/reduced motion               | none                                   |
| `constellation` | Night sky: SVG poster first, lazy R3F star field after load + idle behind the low-end gate                                                       | R3F (V3-05); poster stays the fallback |
| `command`       | Terminal: real prompt (help, ls, open, cd, skin, history, Tab completion), `/` or ⌘K to focus, live monitor strip                                | none                                   |
| `devices`       | CSS-3D ring of device mockups (prev/next, arrows, swipe, pausable auto-advance); 2D snap row before hydration, below md and under reduced motion | none (CSS 3D, no WebGL)                |

- **Mechanics** — cookie `dc-skin` (1 year). `?skin=<id>` on any URL sets it and 307s to the
  clean URL; `?skin=classic` or an invalid id clears it. `src/proxy.ts` rewrites `/` and `/ro`
  to the static `src/app/[locale]/skin/<id>/` route; direct `/skin/*` URLs are 404. The theme
  menu has a Skin group; skin chrome always shows "Back to classic".
- **Canvas guardrails** (constellation, `src/skins/constellation/gate.ts` +
  `SkyCanvasIsland.tsx`): dynamic import after `load` + `requestIdleCallback`; skipped under
  `prefers-reduced-motion`, `navigator.webdriver`, ≤ 4 cores, < 4 GB device memory,
  Save-Data or no WebGL2 (the static poster IS that fallback); `frameloop="demand"` driven at
  ≤ 30 fps only while visible and on screen; DPR ≤ 1.5; disposed on unmount.
  `SKIN_META[id].hasCanvas` in `src/skins/registry.ts` is the allowlist; e2e asserts zero
  canvases in lab runs.
- **GSAP** (editorial only) and **three / R3F** (constellation only) are route-local: never
  imported by shared chrome or classic.
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

| Section     | Subject                                         | Motion                |
| ----------- | ----------------------------------------------- | --------------------- |
| Hero        | Split headline + stack layers panel, tech band  | entrance stagger only |
| Now         | One-line status strip with live dot (+ heatmap) | dot ping only         |
| Help        | Audience bento (3/2, 2/3) from services.ts      | hover lift            |
| Flagships   | 3/2 bento, covers list each product's surfaces  | hover lift            |
| Projects    | Filterable grid, `<ViewTransition>` covers      | stagger reveal        |
| Open source | Packages with live downloads/stars              | count-up              |
| Timeline    | Year ledger, ≤ 8 entries per year then +N       | none                  |
| Contact     | Minimal form, invisible BotID                   | none                  |

## Anti-patterns to reject

Stock photos · centred everything · 3 identical cards in a row · raw Tailwind
palette classes · animations without reduced-motion variant · text on flat
colour without atmosphere · **any continuously running animation (canvas,
WebGL, rAF loops, scroll-linked springs)** — rejected by the owner for perf.
(Exception planned by the owner in V3: the constellation and devices skins only, under the
guardrails in § Skins. Classic, editorial and command stay canvas-free.)
