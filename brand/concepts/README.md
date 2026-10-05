# Brand concepts — dragoscatalin.ro (concept stage, 2026-10-05)

Five directions for the **Dragoș Cătălin** identity: DC monogram, wordmark, OKLCH palette,
type pairing, icons/OG mock and a logo-motion idea. **Nothing here is used by `src/` yet** —
the owner chooses first (tracker V3-02). The default accent is chosen after the concept.

| Sheet                                            | File                                               |
| ------------------------------------------------ | -------------------------------------------------- |
| Overview (all five side by side)                 | [`overview.png`](overview.png)                     |
| A · Trace — tech-premium                         | [`concept-a-trace.png`](concept-a-trace.png)       |
| B · Ink — editorial                              | [`concept-b-ink.png`](concept-b-ink.png)           |
| C · Hearth — warm-human                          | [`concept-c-hearth.png`](concept-c-hearth.png)     |
| D · Phosphor — brutalist / retro-terminal        | [`concept-d-phosphor.png`](concept-d-phosphor.png) |
| E · Keystone — recommended hybrid                | [`concept-e-keystone.png`](concept-e-keystone.png) |
| Romanian glyph render test, every candidate font | [`glyph-test.png`](glyph-test.png)                 |

Each sheet shows: the 512 px master on its 48-unit keyline grid, light/dark lockups, the
wordmark, 5 motion storyboard frames, a 16/24/32/48/128 px scale ladder on dark and light,
one-colour / inverse / blurred-squint tests, a browser tab strip and a Windows taskbar at
24 and 36 px, both 12-step ramps per mode, a UI sample, the full contrast table, the type
specimen with a Romanian glyph test, an OG image (1200 × 630 at 50 %) and app icons
(apple-touch, Android 108 dp with the 66 dp safe zone, PWA, favicon 32/16).

## How it is built (reproducible)

```powershell
# 1. Romanian glyph gate on every candidate font (fonttools + brotli in a throwaway uv venv)
python brand/scripts/check-glyphs.py brand/concepts/src/fonts/*.ttf
# 2. Wordmark outlines: HarfBuzz shaping (real kerning) of variable-font instances -> SVG paths
python brand/concepts/src/wordmark.py          # needs fonttools, uharfbuzz
# 3. Palettes, contrast gate, SVGs, tokens, HTML sheets
node brand/concepts/src/build.mjs
# 4. Screenshot with the repo's Playwright Chromium, palette-PNG via Next's sharp (each <= 300 KB)
node brand/concepts/src/render.mjs
```

- `brand/scripts/contrast-gate.mjs` + `check-glyphs.py` are vendored from the brand-system skill
  (self-test: 11/11 pass) so CI will not depend on a home directory.
- Palettes are **solved, not eyeballed**: neutral steps 9/11 and accent step 11 are searched by
  script until they clear WCAG with a small margin; status colours likewise.
- `src/<id>/` per concept: `mark.svg`, `mark-16.svg` (micro cut), `mark-construction.svg`,
  `mark-bare-light.svg`, `wordmark-{light,dark}.svg`, `lockup-{light,dark}.svg`,
  `tokens.json` (DTCG colour values, OKLCH + hex), `contrast-pairs.json`, `contrast.txt`
  (verbatim gate output, exit code at the end).
- Fonts in `src/fonts/` are the upstream OFL files from `google/fonts` with their `OFL-*.txt`.

## Contrast results (WCAG 2.2 AA, `contrast-gate.mjs`)

Pairs per mode: fg/muted/accent text on canvas and surface, text on the accent solid, focus
ring, strong border, danger and success text; plus the logo pairs. Keystone also checks all
8 switchable accents (text on canvas, text on solid, mark on tile, both modes).

| Concept      | Pairs | WCAG AA pass | Fail | APCA advisories* |
| ------------ | ----: | -----------: | ---: | ---------------: |
| A · Trace    |    24 |           24 |    0 |               13 |
| B · Ink      |    24 |           24 |    0 |               15 |
| C · Hearth   |    23 |           23 |    0 |               15 |
| D · Phosphor |    23 |           23 |    0 |               15 |
| E · Keystone |    63 |           63 |    0 |               54 |

\*APCA (Lc 75 body / 60 large / 45 UI) is advisory, not a conformance standard. Most advisories
are muted text at ~4.7–5:1 (Lc ≈ 70) and dark-mode body pairs that APCA scores lower than WCAG;
they are tuning targets for Gate C, not failures.

## Glyph gate

`check-glyphs.py` (cmap check for ș ț Ș Ț comma-below, ă â î Ă Â Î) on 13 files: **12 OK**,
**Silkscreen FAILS** (no ș ț ă) → excluded from every concept. The render test
(`glyph-test.png`) shows each font drawing the real glyphs next to the wrong cedilla forms.

| Font                            | Role                      | Licence                                                  | Gate        |
| ------------------------------- | ------------------------- | -------------------------------------------------------- | ----------- |
| Geist / Geist Mono              | body + mono, all concepts | OFL 1.1 — https://github.com/vercel/geist-font           | OK          |
| Martian Mono                    | A display                 | OFL 1.1 — https://github.com/evilmartians/mono           | OK          |
| Instrument Serif (+ Italic)     | B display + monogram      | OFL 1.1 — https://github.com/Instrument/instrument-serif | OK          |
| Fraunces                        | C display                 | OFL 1.1 — https://github.com/undercasetype/Fraunces      | OK          |
| Space Mono                      | D display                 | OFL 1.1 — https://github.com/googlefonts/spacemono       | OK          |
| Bricolage Grotesque             | E display                 | OFL 1.1 — https://github.com/ateliertriay/bricolage      | OK          |
| Mona Sans, Pixelify Sans, VT323 | tested alternates         | OFL 1.1                                                  | OK          |
| Silkscreen                      | tested alternate          | OFL 1.1                                                  | **MISSING** |

All OFL 1.1: web embedding allowed, and modification allowed for the lettered wordmarks
(no Reserved Font Name is used in a derivative's name).

## The concepts

### A · Trace — tech-premium

DC drawn as **one circuit trace** on a 48-unit grid; two lime pads are where the system
connects. Martian Mono wordmark with a block cursor. Motion: the trace draws from the D stem
to the pads (stroke-dashoffset, 600 ms), then the pads light; "thinking" = pads pulse in turn.

|                         | light                                        | dark                             |
| ----------------------- | -------------------------------------------- | -------------------------------- |
| canvas                  | `oklch(0.99 0.005 255)` #fafcff              | `oklch(0.155 0.014 255)` #080d12 |
| fg                      | `oklch(0.22 0.01 255)` #181b1f               | `oklch(0.95 0.008 255)` #ebeff4  |
| accent text             | `oklch(0.53 0.18 128)` #547a00               | `oklch(0.8 0.17 128)` #9ed24d    |
| accent solid / on-solid | `oklch(0.89 0.2 128)` #b4f24e / dark #0e1406 | same                             |

- Unmistakably engineering; feeds the Command-center and Constellation skins.
  − Cold for a warm tone; lime needs dark text and a border on light surfaces.

### B · Ink — editorial

A roman **D overprinted by an italic C**, like two plates on a press. Instrument Serif
wordmark with the comma of "ș" redrawn in press red — the only colour. Motion: the italic C
slides over the D, the overprint appears, the red comma drops last (500 ms).

|                         | light                                          | dark                            |
| ----------------------- | ---------------------------------------------- | ------------------------------- |
| canvas                  | `oklch(0.99 0.002 80)` #fcfcfa                 | `oklch(0.155 0.004 80)` #0d0c0a |
| fg                      | `oklch(0.22 0.004 80)` #1c1a19                 | `oklch(0.95 0.002 80)` #efeeed  |
| accent text             | `oklch(0.52 0.194 28)` #bf201d                 | `oklch(0.72 0.183 28)` #ff7264  |
| accent solid / on-solid | `oklch(0.58 0.215 28)` #dd2824 / white #fffbfa | same                            |

- Most timeless; ideal for the Editorial skin and long-form case studies.
  − Hairline serifs weaken at 16 px (the favicon needs a heavier cut); red overlaps error
  semantics (danger shifted to crimson, hue 355).

### C · Hearth — warm-human

A lowercase **"dc" in one round stroke** inside a circle — the same circle that later holds
the portrait. Fraunces (SOFT 100, WONK) wordmark. Motion: the d bowl rolls in, the stem rises,
the c opens like a smile (450 ms); avatar swap = the circle cross-fades to the photo.

|                         | light                                         | dark                            |
| ----------------------- | --------------------------------------------- | ------------------------------- |
| canvas                  | `oklch(0.99 0.007 65)` #fffbf7                | `oklch(0.155 0.018 65)` #120b05 |
| fg                      | `oklch(0.22 0.014 65)` #1f1914                | `oklch(0.95 0.011 65)` #f4ede7  |
| accent text             | `oklch(0.55 0.135 58)` #a95a00                | `oklch(0.76 0.128 58)` #ed9b59  |
| accent solid / on-solid | `oklch(0.76 0.15 58)` #f79643 / cocoa #1b0e05 | same                            |

- Warmest; the circle frame makes the future portrait a drop-in.
  − Least "cloud & network"; reads lifestyle more than engineering to enterprise buyers.

### D · Phosphor — brutalist / retro-terminal

DC set on a **16 × 16 pixel grid** with a prompt cursor underneath — the mark is its own
favicon. Space Mono uppercase wordmark with a cursor. Motion: pixels type in row by row like
a 9600-baud terminal, the cursor blinks twice and stops; thinking = `steps(1)` blink.

|                         | light                                         | dark                           |
| ----------------------- | --------------------------------------------- | ------------------------------ |
| canvas                  | `oklch(0.99 0.004 85)` #fdfcf9                | `oklch(0.155 0.01 85)` #0e0c08 |
| fg                      | `oklch(0.22 0.008 85)` #1c1a16                | `oklch(0.95 0.006 85)` #f0eeea |
| accent text             | `oklch(0.545 0.149 75)` #976500               | `oklch(0.8 0.14 75)` #f2af48   |
| accent solid / on-solid | `oklch(0.82 0.165 75)` #ffb334 / dark #190f03 | same                           |

- Perfect 16 px fidelity; strongest personality; native to the Command-center skin.
  − Reads "hobby" to enterprise buyers; amber always needs dark text. (Fixed during review:
  the cursor sat one row under the C and read as "Ç" — now two rows of gap.)

### E · Keystone — recommended hybrid

A **solid D with the C carved out of it** — one block from foundation to finish. Bricolage
Grotesque (opsz 96, wdth 88) wordmark; the comma of "ș" is redrawn as a round accent drop,
the brand's one Romanian signature. Motion: the D lands as a block, the C is carved in one
stroke (500 ms), the comma drops into the wordmark last; thinking = the carved C turns in
90° steps.

|                         | light                                        | dark                             |
| ----------------------- | -------------------------------------------- | -------------------------------- |
| canvas                  | `oklch(0.99 0.004 265)` #fafcff              | `oklch(0.155 0.016 265)` #090c13 |
| fg                      | `oklch(0.22 0.008 265)` #191b1e              | `oklch(0.95 0.01 265)` #ebeef5   |
| accent text             | `oklch(0.555 0.171 42)` #bf4700              | `oklch(0.72 0.162 42)` #f67d4b   |
| accent solid / on-solid | `oklch(0.68 0.19 42)` #f46622 / dark #1d0d07 | same                             |

The ember accent is a placeholder: the sheet shows the same mark in all 8 switchable accents
(ember, orange, amber, rose, violet, indigo, cyan, emerald), all contrast-checked.

- Solid silhouette extrudes cleanly for 3D (Constellation, Device wall), pixel-snaps for the
  terminal, the wdth/opsz axes drive kinetic Editorial type; accent stays swappable.
  − Less literal about any one mood; the Romanian cue lives in the wordmark, not the symbol.

## Recommendation: E · Keystone

The site ships **four skins**, so the mark must survive all four rather than win one:
a filled silhouette is the only shape that extrudes for the 3D skins, reads at 16 px in a tab,
pixel-snaps for the terminal skin and sits quietly under big Editorial type. A, B, C and D
each own one skin and fight the others (lime/amber/serif hairlines/pixels). Keystone also keeps
the existing accent switcher meaningful (63/63 pairs pass across 8 accents) and stays close to
today's orange default, so the v3 move is evolution, not a hard break. Runner-up: **A · Trace**
if the owner wants the identity to say "engineer" first.

Considered and dropped before drawing (banned-cliché scan): sparkle/neural-node/orb marks, a
violet→blue gradient (crowded AI category), a "DC" circuit-chip with pins (generic
electronics icon).

## Next gates (not started — owner decides first)

Gate A/B: pick a direction (or combine). Then: Gate C palette tuning on the chosen
direction, Gate D type pairing, Gate E logo-motion demo, then `brand/brand.json` + DTCG pack
and roll-out to favicon, manifest, OG, `globals.css` tokens.
