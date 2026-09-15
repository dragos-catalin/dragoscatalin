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
- **PALETTE (OKLCH)** — dark base `oklch(0.13 0.02 272)`, surface
  `oklch(0.17 0.025 272)`, text ivory `oklch(0.95 0.015 80)`. Light base
  `oklch(0.985 0.005 80)`, text `oklch(0.18 0.02 272)`. Accent = user-chosen
  (default **orange** `oklch(0.72 0.18 50)`, owner decision 2026-09-15); cool
  counter = accent hue +140° (→ teal for orange).
- **LIGHTING** — a single soft accent glow behind the headline; page-wide
  static mesh (`.page-mesh`: one diagonal accent→counter gradient + one radial
  glow at the top). Nothing moves.
- **ATMOSPHERE** — film grain overlay at 2.5 % (`noise-overlay`), static.
- **TYPOGRAPHY** — Display: Geist (700/800, tight tracking −0.03em, sizes via
  `text-5xl → lg:text-8xl`). Body: Geist 400/500. Mono: Geist Mono for
  stats, versions, code. Two families only.
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
- `data-accent="orange|violet|indigo|cyan|emerald|amber|rose"` (default orange).
- `data-surface="solid|glass|contrast"` — glass adds backdrop blur +
  translucency to surfaces; contrast raises borders/text to AAA.
- Tokens live in `src/app/globals.css` under `@theme inline`; components use
  only semantic utilities (`bg-surface`, `text-fg`, `text-accent`,
  `border-line`). Raw palette classes (`bg-violet-500`) are banned.

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
