// build.mjs — brand concept generator for dragoscatalin.ro (gate A/B material, not shipped).
//
//   node brand/concepts/src/build.mjs     (after: python wordmark.py -> build/glyphs.json)
//
// Writes, per concept, brand/concepts/src/<id>/{mark,mark-16,mark-bare,wordmark,lockup}.svg,
// tokens.json (DTCG 2025.10 colour values), contrast-pairs.json + contrast.txt (output of the
// vendored brand/scripts/contrast-gate.mjs), and the HTML sheets rendered by render.mjs.
// Palettes are OKLCH; steps marked "solved" are searched by script to the WCAG threshold + margin.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseColor, toHex, wcagRatio, evaluate } from '../../scripts/contrast-gate.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const GATE = join(HERE, '..', '..', 'scripts', 'contrast-gate.mjs');
const glyphs = JSON.parse(readFileSync(join(HERE, 'build', 'glyphs.json'), 'utf8'));
const glyphGate = existsSync(join(HERE, 'build', 'glyph-gate.txt'))
  ? readFileSync(join(HERE, 'build', 'glyph-gate.txt'), 'utf8')
  : '';

// ---------------------------------------------------------------- colour helpers
const r3 = (n) => Math.round(n * 1000) / 1000;
const ok = (L, C, H) => `oklch(${r3(L)} ${r3(C)} ${r3(H)})`;
const rgbOf = (c) => parseColor(c).rgb;
const hex = (c) => toHex(rgbOf(c));
const ratio = (a, b) => wcagRatio(rgbOf(a), rgbOf(b));

function solve({ C, H, bg, min, from, dir }) {
  let L = from;
  for (let i = 0; i < 300; i++) {
    if (ratio(ok(L, C, H), bg) >= min) return L;
    L += dir * 0.005;
    if (L < 0.04 || L > 0.99) break;
  }
  throw new Error(`cannot solve ${min}:1 for C${C} H${H} vs ${bg}`);
}

function neutrals(mode, H, C) {
  if (mode === 'light') {
    const L = [0.99, 0.975, 0.952, 0.93, 0.908, 0.882, 0.848, 0, 0, 0, 0, 0.22];
    const n1 = ok(L[0], C * 0.5, H);
    const n2 = ok(L[1], C, H);
    L[8] = solve({ C, H, bg: n1, min: 3.1, from: 0.7, dir: -1 });
    L[7] = L[8] + 0.12;
    L[9] = L[8] - 0.05;
    L[10] = solve({ C, H, bg: n2, min: 4.7, from: Math.min(L[9], 0.56), dir: -1 });
    return L.map((l, i) => ok(l, i === 0 ? C * 0.5 : C, H));
  }
  const L = [0.155, 0.182, 0.212, 0.24, 0.268, 0.3, 0.348, 0.42, 0, 0, 0, 0.95];
  const n1 = ok(L[0], C, H);
  const n2 = ok(L[1], C, H);
  L[8] = solve({ C, H, bg: n1, min: 3.1, from: 0.48, dir: 1 });
  L[9] = L[8] + 0.05;
  L[10] = solve({ C, H, bg: n2, min: 4.7, from: Math.max(0.7, L[9]), dir: 1 });
  return L.map((l, i) => ok(l, i === 11 ? C * 0.6 : C, H));
}

function accentRamp(mode, { L9, C9, H }, bg2) {
  const light = mode === 'light';
  const fL = light ? [0.99, 0.975, 0.955, 0.93, 0.9, 0.865, 0.81, 0.74] : [0.17, 0.2, 0.245, 0.285, 0.325, 0.375, 0.445, 0.535];
  const fC = light ? [0.06, 0.12, 0.25, 0.36, 0.46, 0.56, 0.68, 0.82] : [0.12, 0.18, 0.3, 0.4, 0.5, 0.6, 0.7, 0.85];
  const steps = fL.map((l, i) => ok(l, C9 * fC[i], H));
  steps.push(ok(L9, C9, H));
  steps.push(light ? ok(L9 - (L9 > 0.8 ? 0.05 : 0.04), C9, H) : ok(Math.min(0.96, L9 + 0.04), C9, H));
  const L11 = light
    ? solve({ C: C9 * 0.9, H, bg: bg2, min: 4.7, from: Math.min(L9 - 0.06, 0.6), dir: -1 })
    : solve({ C: C9 * 0.85, H, bg: bg2, min: 4.7, from: Math.max(0.72, Math.min(L9, 0.8)), dir: 1 });
  steps.push(ok(L11, light ? C9 * 0.9 : C9 * 0.85, H));
  steps.push(light ? ok(0.3, C9 * 0.5, H) : ok(0.94, C9 * 0.3, H));
  return steps;
}

function onSolid(solid, H) {
  const white = ok(0.99, 0.008, H);
  const dark = ok(0.18, 0.03, H);
  return ratio(white, solid) >= ratio(dark, solid) ? white : dark;
}

function statusText(mode, H, bg) {
  return mode === 'light'
    ? ok(solve({ C: 0.17, H, bg, min: 4.7, from: 0.56, dir: -1 }), 0.17, H)
    : ok(solve({ C: 0.15, H, bg, min: 4.7, from: 0.7, dir: 1 }), 0.15, H);
}

function palette(c) {
  // make sure step 9 can carry 4.5:1 text in some colour; nudge darker if neither works
  let { L9 } = c.accent;
  const notes = [];
  for (let i = 0; i < 30; i++) {
    const s = ok(L9, c.accent.C9, c.accent.H);
    if (ratio(onSolid(s, c.accent.H), s) >= 4.5) break;
    L9 -= 0.01;
  }
  if (L9 !== c.accent.L9) notes.push(`step 9 L ${c.accent.L9} -> ${r3(L9)} so text on the solid reaches 4.5:1`);
  const acc = { ...c.accent, L9 };
  const out = { notes };
  for (const mode of ['light', 'dark']) {
    const n = neutrals(mode, c.neutral.H, mode === 'light' ? c.neutral.C : c.neutral.Cd ?? c.neutral.C);
    const a = accentRamp(mode, acc, n[1]);
    const focus = [a[8], a[9], a[10]].find((x) => ratio(x, n[0]) >= 3) ?? a[10];
    out[mode] = {
      n, a,
      sem: {
        canvas: n[0], surface: n[1], line: n[5], fg: n[11], muted: n[10], borderStrong: n[8],
        accentText: a[10], solid: a[8], onSolid: onSolid(a[8], acc.H), focus,
        danger: statusText(mode, c.dangerH, n[1]), success: statusText(mode, 150, n[1]),
      },
    };
  }
  return out;
}

function pairsFor(c, p) {
  const pairs = [];
  for (const mode of ['light', 'dark']) {
    const s = p[mode].sem;
    const add = (name, fg, bg, use) => pairs.push({ name: `${mode}: ${name}`, fg, bg, use });
    add('fg on canvas', s.fg, s.canvas, 'body');
    add('fg on surface', s.fg, s.surface, 'body');
    add('muted on canvas', s.muted, s.canvas, 'body');
    add('muted on surface', s.muted, s.surface, 'body');
    add('accent text on canvas', s.accentText, s.canvas, 'body');
    add('accent text on surface', s.accentText, s.surface, 'body');
    add('on-solid text on accent', s.onSolid, s.solid, 'body');
    add('focus ring on canvas', s.focus, s.canvas, 'ui');
    add('border.strong on canvas', s.borderStrong, s.canvas, 'ui');
    add('danger text on surface', s.danger, s.surface, 'body');
    add('success text on surface', s.success, s.surface, 'body');
  }
  for (const [name, fg, bg] of c.logoPairs(p)) pairs.push({ name: `logo: ${name}`, fg, bg, use: 'ui' });
  if (c.extraPairs) pairs.push(...c.extraPairs(p));
  return pairs;
}

// ---------------------------------------------------------------- geometry helpers
let uid = 0;
const rad = (d) => (d * Math.PI) / 180;
function arc(cx, cy, r, a0, a1, large = 1, sweep = 0) {
  const p = (a) => `${r3(cx + r * Math.cos(rad(a)))} ${r3(cy + r * Math.sin(rad(a)))}`;
  return `M${p(a0)}A${r} ${r} 0 ${large} ${sweep} ${p(a1)}`;
}
function pixels(rows, colors, t = 1) {
  let out = '';
  const visible = Math.round(t * rows.length);
  rows.forEach((row, y) => {
    if (y >= visible && t < 1) return;
    for (let x = 0; x < row.length;) {
      const ch = row[x];
      if (colors[ch]) {
        let w = 1;
        while (row[x + w] === ch) w++;
        out += `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${colors[ch]}"/>`;
        x += w;
      } else x++;
    }
  });
  return out;
}
const dash = (t) => (t >= 1 ? '' : ` pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${r3(1 - t)}"`);
const clamp = (v) => Math.max(0, Math.min(1, v));

// 16-grid pixel maps (X = ink, + = accent)
const A_MICRO = [
  '................', '................', '................',
  '.XXXXX....XXX++.', '.XXXXXX..XXXX++.', '.XX..XX..XX.....', '.XX..XX..XX.....', '.XX..XX..XX.....',
  '.XX..XX..XX.....', '.XX..XX..XX.....', '.XX..XX..XX.....', '.XXXXXX..XXXX++.', '.XXXXX....XXX++.',
  '................', '................', '................',
];
const D_PIX = [
  '................',
  '.XXXX......XXXX.', '.XXXXX....XXXXX.', '.XX.XXX..XXX....', '.XX..XX..XX.....', '.XX..XX..XX.....',
  '.XX..XX..XX.....', '.XX..XX..XX.....', '.XX.XXX..XXX....', '.XXXXX....XXXXX.', '.XXXX......XXXX.',
  '................', '................', '.........++++++.', '.........++++++.', '................',
];

// ---------------------------------------------------------------- concepts
const C = [
  {
    id: 'a', name: 'Trace', mood: 'Tech-premium', sheetMode: 'dark',
    tagline: 'Dark graphite, one discreet neon, a 4-unit grid, monospace everything.',
    meaning: 'DC drawn as one circuit trace on a 48-unit grid — the lime pads are where the system connects.',
    neutral: { H: 255, C: 0.01, Cd: 0.014 }, accent: { L9: 0.89, C9: 0.2, H: 128, name: 'Signal lime' }, dangerH: 25,
    display: { family: 'Martian Mono', file: 'MartianMono[wdth,wght].ttf', css: "font-family:'Martian Mono';font-weight:560;font-variation-settings:'wdth' 87.5", licence: 'OFL 1.1', url: 'https://github.com/evilmartians/mono' },
    motion: 'The trace draws itself from the D stem to the C pads (stroke-dashoffset, 600 ms), then the pads light — "link up". Thinking = pads pulse in turn.',
    pros: 'Unmistakably engineering; mark and grid feed the Command-center and Constellation skins directly.',
    cons: 'Cold for the warm-human tone; lime needs dark text and a border on light surfaces.',
    tileShape: 'rect', rx: 10,
    microGrid: true,
    draw({ v, fg, accent, t = 1 }) {
      if (v === 'micro') return pixels(A_MICRO, { X: fg, '+': accent });
      const sw = v === 'master' ? 4 : 4.6;
      const tt = clamp(t / 0.8);
      return `<path d="M7 13H16L21 18V30L16 35H7Z" fill="none" stroke="${fg}" stroke-width="${sw}"${dash(tt)}/>`
        + `<path d="M41 13H35L29 19V29L35 35H41" fill="none" stroke="${fg}" stroke-width="${sw}"${dash(tt)}/>`
        + (t >= 0.8 ? `<rect x="38.5" y="10.5" width="5" height="5" fill="${accent}"/><rect x="38.5" y="32.5" width="5" height="5" fill="${accent}"/>` : '');
    },
    tile: (p) => ({ bg: p.dark.n[0], fg: p.dark.n[11], accent: p.dark.a[8] }),
    bare: (p, mode) => ({ fg: p[mode].sem.fg, accent: mode === 'light' ? p.light.a[10] : p.dark.a[8] }),
    logoPairs: (p) => [['mark ink on tile', p.dark.n[11], p.dark.n[0]], ['lime pads on tile', p.dark.a[8], p.dark.n[0]]],
  },
  {
    id: 'b', name: 'Ink', mood: 'Editorial', sheetMode: 'light',
    tagline: 'Black on paper, generous whitespace, big serif type, one spot red.',
    meaning: 'A roman D overprinted by an italic C, like two plates on a press; the red comma of "ș" is the only colour.',
    neutral: { H: 80, C: 0.004, Cd: 0.004 }, accent: { L9: 0.58, C9: 0.215, H: 28, name: 'Press red' }, dangerH: 355,
    display: { family: 'Instrument Serif', file: 'InstrumentSerif-Regular.ttf', css: "font-family:'Instrument Serif';font-weight:400", licence: 'OFL 1.1', url: 'https://github.com/Instrument/instrument-serif' },
    motion: 'The italic C slides over the roman D and the overprint appears where they meet — a page being set (500 ms). The red comma drops last.',
    pros: 'Most timeless; perfect for the Editorial skin and long-form case studies.',
    cons: 'Hairline serif strokes need a heavier micro cut; red collides with error states (danger moves to crimson).',
    tileShape: 'rect', rx: 3,
    draw({ v, fg, accent, over, t = 1 }) {
      const s = v === 'micro' ? 0.34 : 0.3;
      const sw = v === 'master' ? 0 : v === 'small' ? 4 : 8;
      const gD = glyphs.glyphs.b_D, gC = glyphs.glyphs.b_C;
      const ov = 7 * (s / 0.3);
      const unionW = (68.1 - 2.6) * s + (71.8 - 7.6) * s - ov;
      const txD = 24 - unionW / 2 - 2.6 * s;
      const txC = txD + 68.1 * s - ov - 7.6 * s + (1 - t) * 14;
      const by = 24 + 50 * s;
      const id = `bclip${uid++}`;
      const st = (col) => (sw ? ` stroke="${col}" stroke-width="${sw}" stroke-linejoin="round"` : '');
      const D = (col) => `<path d="${gD.d}" transform="translate(${r3(txD)} ${r3(by)}) scale(${s})" fill="${col}"${st(col)}/>`;
      const Cp = `<path d="${gC.d}" transform="translate(${r3(txC)} ${r3(by)}) scale(${s})" fill="${accent}" opacity="${r3(t)}"${st(accent)}/>`;
      const overprint = t >= 1 && over
        ? `<clipPath id="${id}"><path d="${gC.d}" transform="translate(${r3(txC)} ${r3(by)}) scale(${s})"/></clipPath><g clip-path="url(#${id})">${D(over)}</g>`
        : '';
      return D(fg) + Cp + overprint;
    },
    tile: (p) => ({ bg: p.light.n[0], fg: p.light.n[11], accent: p.light.a[8], over: p.light.a[11] }),
    bare: (p, mode) => ({ fg: p[mode].sem.fg, accent: mode === 'light' ? p.light.a[8] : p.dark.a[9], over: mode === 'light' ? p.light.a[11] : p.dark.a[11] }),
    logoPairs: (p) => [['ink D on paper tile', p.light.n[11], p.light.n[0]], ['red C on paper tile', p.light.a[8], p.light.n[0]]],
  },
  {
    id: 'c', name: 'Hearth', mood: 'Warm-human', sheetMode: 'light',
    tagline: 'Cream and cocoa, an apricot sun, round strokes, room for a portrait.',
    meaning: 'A lowercase "dc" in one round stroke inside a circle — the same circle that will later hold the portrait.',
    neutral: { H: 65, C: 0.014, Cd: 0.018 }, accent: { L9: 0.76, C9: 0.15, H: 58, name: 'Apricot' }, dangerH: 25,
    display: { family: 'Fraunces', file: 'Fraunces[SOFT,WONK,opsz,wght].ttf', css: "font-family:'Fraunces';font-weight:620;font-variation-settings:'SOFT' 100,'WONK' 1,'opsz' 72", licence: 'OFL 1.1', url: 'https://github.com/undercasetype/Fraunces' },
    motion: 'The d bowl rolls in, the stem rises, the c opens like a smile (450 ms ease-out); avatar swap = the circle cross-fades to the photo.',
    pros: 'Warmest and most approachable; the circle frame makes the future portrait a drop-in.',
    cons: 'Least "cloud & network"; soft serif reads lifestyle more than engineering for enterprise buyers.',
    tileShape: 'circle',
    draw({ v, fg, accent, t = 1 }) {
      const sw = v === 'master' ? 4.5 : v === 'small' ? 5 : 5.8;
      const a = clamp(t * 3), b = clamp(t * 3 - 1), c = clamp(t * 3 - 2);
      const g = 'transform="translate(1.25 2)"';
      return `<g ${g} fill="none" stroke-width="${sw}" stroke-linecap="round">`
        + (a > 0 ? `<path d="${arc(17, 26, 7, 0, 359.99, 1, 1)}" stroke="${fg}"${dash(a)}/>` : '')
        + (b > 0 ? `<path d="M24 33V11" stroke="${fg}"${dash(b)}/>` : '')
        + (c > 0 ? `<path d="${arc(31, 26, 7, -50, 50, 1, 0)}" stroke="${accent}"${dash(c)}/>` : '')
        + '</g>';
    },
    tile: (p) => ({ bg: p.light.a[8], fg: p.light.n[11], accent: p.light.n[11] }),
    bare: (p, mode) => ({ fg: p[mode].sem.fg, accent: mode === 'light' ? p.light.a[10] : p.dark.a[8] }),
    logoPairs: (p) => [['cocoa dc on apricot tile', p.light.n[11], p.light.a[8]]],
  },
  {
    id: 'd', name: 'Phosphor', mood: 'Brutalist / retro-terminal', sheetMode: 'dark',
    tagline: 'Amber phosphor on black, hard edges, hard shadows, a blinking cursor.',
    meaning: 'DC set on a 16 × 16 pixel grid with a prompt cursor under it — the mark IS its own favicon.',
    neutral: { H: 85, C: 0.008, Cd: 0.01 }, accent: { L9: 0.82, C9: 0.165, H: 75, name: 'Amber phosphor' }, dangerH: 25,
    display: { family: 'Space Mono', file: 'SpaceMono-Bold.ttf', css: "font-family:'Space Mono';font-weight:700", licence: 'OFL 1.1', url: 'https://github.com/googlefonts/spacemono' },
    motion: 'Pixels type in row by row like a 9600-baud terminal, the cursor blinks twice and stops. Thinking = the cursor blinks (steps(1)).',
    pros: 'Perfect 16 px fidelity (pixel-native); strongest personality; ideal for the Command-center skin.',
    cons: 'Retro reads "hobby" to enterprise buyers; amber on light needs dark text everywhere.',
    tileShape: 'rect', rx: 0, pixel: true,
    draw({ fg, accent, t = 1 }) {
      return pixels(D_PIX, { X: fg, '+': t >= 1 ? accent : 'none' }, t);
    },
    tile: (p) => ({ bg: p.dark.n[0], fg: p.dark.a[8], accent: p.dark.a[8] }),
    bare: (p, mode) => ({ fg: p[mode].sem.fg, accent: mode === 'light' ? p.light.n[11] : p.dark.a[8] }),
    logoPairs: (p) => [['amber pixels on black tile', p.dark.a[8], p.dark.n[0]]],
  },
  {
    id: 'e', name: 'Keystone', mood: 'Hybrid', sheetMode: 'dark', recommended: true,
    tagline: 'Slate neutrals, one solid mark, a grotesque with width + optical-size axes, any accent.',
    meaning: 'A solid D with the C carved out of it — one block from foundation to finish; the comma of "ș" is the signature.',
    neutral: { H: 265, C: 0.008, Cd: 0.016 }, accent: { L9: 0.68, C9: 0.19, H: 42, name: 'Ember' }, dangerH: 10,
    display: { family: 'Bricolage Grotesque', file: 'BricolageGrotesque[opsz,wdth,wght].ttf', css: "font-family:'Bricolage Grotesque';font-weight:720;font-variation-settings:'opsz' 96,'wdth' 88", licence: 'OFL 1.1', url: 'https://github.com/ateliertriay/bricolage' },
    motion: 'The D lands as a solid block, the C is carved out in one stroke (dash, 500 ms), the comma of "ș" drops into the wordmark last. Thinking = the carved C turns in 90° steps.',
    pros: 'Solid silhouette extrudes for 3D (Constellation, Device wall), pixel-snaps for the terminal, wdth/opsz axes cover kinetic Editorial type; accent is swappable.',
    cons: 'Less literal about any single mood; needs the wordmark comma to carry the Romanian cue.',
    tileShape: 'rect', rx: 11,
    draw({ v, fg, bg, t = 1 }) {
      const sw = v === 'micro' ? 5.6 : 5;
      const s = 0.9 + 0.1 * clamp(t * 2);
      const c = clamp(t * 2 - 1);
      return `<g transform="translate(24 24) scale(${r3(s)}) translate(-24 -24)">`
        + `<path d="M10.5 9H24A15 15 0 0 1 24 39H10.5Q8.5 39 8.5 37V11Q8.5 9 10.5 9Z" fill="${fg}"/>`
        + (c > 0 ? `<path d="${arc(22.5, 24, 6.5, -40, 40, 1, 0)}" fill="none" stroke="${bg}" stroke-width="${sw}"${dash(c)}/>` : '')
        + '</g>';
    },
    tile: (p) => ({ bg: p.dark.n[1], fg: p.dark.a[8], accent: p.dark.a[8] }),
    bare: (p, mode) => ({ fg: mode === 'light' ? p.light.n[11] : p.dark.a[8], accent: mode === 'light' ? p.light.a[10] : p.dark.a[8] }),
    logoPairs: (p) => [['ember D on slate tile', p.dark.a[8], p.dark.n[1]]],
  },
];

// Site accents the owner can still switch between (globals.css), checked inside Keystone
const SITE_ACCENTS = [
  ['ember', 42, 0.19], ['orange', 50, 0.18], ['amber', 75, 0.16], ['rose', 15, 0.19],
  ['violet', 300, 0.19], ['indigo', 275, 0.18], ['cyan', 215, 0.14], ['emerald', 160, 0.15],
];
C[4].extraPairs = (p) => {
  const out = [];
  for (const [name, H, C9] of SITE_ACCENTS) {
    for (const mode of ['light', 'dark']) {
      const a = accentRamp(mode, { L9: 0.68, C9, H }, p[mode].n[1]);
      out.push({ name: `accent ${name} ${mode}: text on canvas`, fg: a[10], bg: p[mode].n[0], use: 'body' });
      out.push({ name: `accent ${name} ${mode}: on-solid text`, fg: onSolid(a[8], H), bg: a[8], use: 'body' });
    }
    out.push({ name: `accent ${name}: mark on slate tile`, fg: ok(0.68, C9, H), bg: p.dark.n[1], use: 'ui' });
  }
  return out;
};

// ---------------------------------------------------------------- svg builders
function markSvg(c, { v = 'master', size, colors, tile = true, t = 1, construction = false, extra = '' }) {
  const micro = (v === 'micro' && c.microGrid) || c.pixel;
  const vb = micro ? 16 : 48;
  const k = vb / 48;
  let bgShape = '';
  if (tile) {
    bgShape = c.tileShape === 'circle'
      ? `<circle cx="${vb / 2}" cy="${vb / 2}" r="${vb / 2}" fill="${colors.bg}"/>`
      : `<rect width="${vb}" height="${vb}" rx="${r3((c.rx ?? 0) * k)}" fill="${colors.bg}"/>`;
  }
  const body = c.draw({ v, ...colors, bg: colors.bg ?? colors.knock, t });
  let cons = '';
  if (construction) {
    const l = [];
    for (let i = 4; i < 48; i += 4) l.push(`M${i} 0V48M0 ${i}H48`);
    const stroke = colors.guide;
    cons = `<g fill="none" stroke="${stroke}" stroke-width="0.12" opacity="0.9"><path d="${l.join('')}" opacity="0.45"/>`
      + `<rect x="4" y="4" width="40" height="40"/><circle cx="24" cy="24" r="20"/><path d="M24 0V48M0 24H48"/>`
      + (c.consExtra ?? '') + '</g>';
    if (micro) cons = cons.replace('<g ', '<g transform="scale(0.333333)" ');
  }
  const crisp = micro ? ' shape-rendering="crispEdges"' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}" width="${size}" height="${size}"${crisp}>${bgShape}${body}${cons}${extra}</svg>`;
}

function comma(cx, r, color) {
  const hy = r + 7;
  return `<circle cx="${r3(cx)}" cy="${r3(hy)}" r="${r}" fill="${color}"/>`
    + `<path d="M${r3(cx + r)} ${r3(hy)}C${r3(cx + r)} ${r3(hy + r * 1.9)} ${r3(cx - r * 0.2)} ${r3(hy + r * 3)} ${r3(cx - r * 1.15)} ${r3(hy + r * 3.35)}L${r3(cx - r * 1.3)} ${r3(hy + r * 2.9)}C${r3(cx - r * 0.45)} ${r3(hy + r * 2.4)} ${r3(cx + r * 0.05)} ${r3(hy + r * 1.7)} ${r3(cx)} ${r3(hy + r * 0.95)}Z" fill="${color}"/>`;
}

function wordmarkSvg(id, { fg, accent, height, inner = false }) {
  const w = glyphs.wordmarks[id];
  let [x0, y0, x1, y1] = w.bounds;
  y0 = Math.min(y0, -112);
  let extra = '';
  if (w.ownComma) {
    for (const an of w.anchors) {
      const r = id === 'b' ? 6.5 : 9.5;
      extra += comma((an.x0 + an.x1) / 2, r, accent);
      y1 = Math.max(y1, r * 4.5 + 7);
    }
  }
  if (id === 'a') {
    extra += `<rect x="${r3(w.advance + 16)}" y="-100" width="48" height="100" fill="${accent}"/>`;
    x1 = w.advance + 64;
  }
  if (id === 'd') {
    extra += `<rect x="${r3(w.advance + 22)}" y="14" width="66" height="16" fill="${accent}"/>`;
    x1 = w.advance + 88;
    y1 = Math.max(y1, 30);
  }
  const pad = 6;
  const vbW = x1 - x0 + pad * 2, vbH = y1 - y0 + pad * 2;
  const width = (height * vbW) / vbH;
  const inside = `<path d="${w.d}" fill="${fg}"/>${extra}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r3(x0 - pad)} ${r3(y0 - pad)} ${r3(vbW)} ${r3(vbH)}" width="${r3(width)}" height="${height}">${inside}</svg>`;
  return inner ? { inside, vb: [x0 - pad, y0 - pad, vbW, vbH], width } : svg;
}

function lockupSvg(c, p, mode, h = 96) {
  const colors = c.bare(p, mode);
  const bg = p[mode].sem.canvas;
  const mark = markSvg(c, { v: 'master', size: h, colors: { ...c.tile(p) } });
  const capH = h * 0.36;
  const wm = wordmarkSvg(c.id, { ...colors, height: capH * 1.6, inner: true });
  const gap = h * 0.28;
  const W = h + gap + wm.width + 24, H = h + 24;
  const wmY = 12 + (h - capH * 1.6) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r3(W)} ${H}" width="${r3(W)}" height="${H}"><rect width="100%" height="100%" fill="${bg}"/>`
    + mark.replace('<svg ', `<svg x="12" y="12" `)
    + `<svg x="${r3(12 + h + gap)}" y="${r3(wmY)}" width="${r3(wm.width)}" height="${r3(capH * 1.6)}" viewBox="${wm.vb.map(r3).join(' ')}">${wm.inside}</svg></svg>`;
}

// ---------------------------------------------------------------- tokens
function dtcg(c, p) {
  const col = (s) => {
    const m = s.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/);
    return { $type: 'color', $value: { colorSpace: 'oklch', components: [Number(m[1]), Number(m[2]), Number(m[3])], hex: hex(s) } };
  };
  const ramp = (arr) => Object.fromEntries(arr.map((s, i) => [String(i + 1), col(s)]));
  const sem = (m) => Object.fromEntries(Object.entries(p[m].sem).map(([k, v]) => [k, col(v)]));
  return {
    $description: `dragoscatalin.ro brand concept ${c.id.toUpperCase()} · ${c.name} (${c.mood}). Concept stage — not shipped.`,
    color: {
      neutral: { light: ramp(p.light.n), dark: ramp(p.dark.n) },
      accent: { $description: c.accent.name, light: ramp(p.light.a), dark: ramp(p.dark.a) },
    },
    semantic: { light: sem('light'), dark: sem('dark') },
  };
}

// ---------------------------------------------------------------- html
const FONT_FILES = [
  ['Geist', 'Geist[wght].ttf', '100 900'], ['Geist Mono', 'GeistMono[wght].ttf', '100 900'],
  ['Martian Mono', 'MartianMono[wdth,wght].ttf', '100 800'], ['Instrument Serif', 'InstrumentSerif-Regular.ttf', '400'],
  ['Instrument Serif Italic', 'InstrumentSerif-Italic.ttf', '400'], ['Fraunces', 'Fraunces[SOFT,WONK,opsz,wght].ttf', '100 900'],
  ['Bricolage Grotesque', 'BricolageGrotesque[opsz,wdth,wght].ttf', '200 800'], ['Mona Sans', 'MonaSans[wdth,wght].ttf', '200 900'],
  ['Space Mono', 'SpaceMono-Bold.ttf', '700'], ['Space Mono R', 'SpaceMono-Regular.ttf', '400'],
  ['Silkscreen', 'Silkscreen-Regular.ttf', '400'], ['Pixelify Sans', 'PixelifySans[wght].ttf', '400 700'], ['VT323', 'VT323-Regular.ttf', '400'],
];
const fontCss = FONT_FILES.map(([f, file, w]) => `@font-face{font-family:'${f}';src:url('fonts/${encodeURIComponent(file)}');font-weight:${w};font-display:block}`).join('\n');

const HEAD_RO = 'Construiesc produse cap-coadă — de la cloud și rețea până la aplicația din buzunarul tău.';
const HEAD_EN = 'I build products end to end — from cloud and network to the app in your pocket.';
const GLYPH_LINE = 'ș ț ă â î Ș Ț Ă Â Î';

function baseCss(s) {
  return `${fontCss}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1600px;background:${s.canvas};color:${s.fg};font-family:Geist,sans-serif;padding:48px;-webkit-font-smoothing:antialiased}
.lab{font:500 11px/1.4 'Geist Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:${s.muted}}
.mut{color:${s.muted}}
h2{font:600 13px/1 'Geist Mono',monospace;letter-spacing:.1em;text-transform:uppercase;color:${s.muted};margin:44px 0 14px;display:flex;gap:12px;align-items:center}
h2::after{content:'';flex:1;height:1px;background:${s.line}}
.row{display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}
.panel{background:${s.surface};border:1px solid ${s.line};border-radius:14px;padding:18px}
.c{display:flex;flex-direction:column;gap:8px;align-items:center}
table{border-collapse:collapse;font:12px/1.5 'Geist Mono',monospace}
td,th{padding:3px 10px 3px 0;text-align:left;white-space:nowrap}
th{color:${s.muted};font-weight:500}
.ok{color:${s.success}}.bad{color:${s.danger};font-weight:700}.warn{color:${s.muted}}
.sw{width:62px;height:46px;border-radius:6px;display:flex;align-items:flex-end;padding:3px 4px;font:9px/1.1 'Geist Mono',monospace}
`;
}

const STANDINS = [
  ['#f2b632', 'M5 9h6l2 2h6v8H5z'], ['#2f7de1', 'M12 5a7 7 0 1 0 0 14a7 7 0 1 0 0-14M5 12h14M12 5c3 3 3 11 0 14c-3-3-3-11 0-14'],
  ['#1e1e1e', 'M6 8l4 4l-4 4M12 16h6'], ['#7a5af8', 'M6 7h12v8h-7l-4 3v-3H6z'], ['#e5484d', 'M9 17V8l9-2v9M9 17a2 2 0 1 1-4 0a2 2 0 1 1 4 0M18 15a2 2 0 1 1-4 0a2 2 0 1 1 4 0'],
  ['#6b7280', 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8M12 3v3M12 18v3M3 12h3M18 12h3'],
];
function standin([bg, d], size) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><rect width="24" height="24" rx="5" fill="${bg}"/><path d="${d}" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function contrastTable(res, filter) {
  const rows = res.filter((r) => filter(r.name)).map((r) => {
    const cls = !r.wcagPass ? 'bad' : r.apcaPass ? 'ok' : 'warn';
    const tag = !r.wcagPass ? 'FAIL' : r.apcaPass ? 'PASS' : 'PASS*';
    return `<tr><td><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${r.fgHex};outline:1px solid #8886"></span> <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${r.bgHex};outline:1px solid #8886"></span></td><td>${r.name.replace(/^(light|dark|logo): /, '')}</td><td>${r.use}</td><td>${r.ratio.toFixed(2)}</td><td class="${cls}">${tag}</td><td class="mut">Lc ${r.lc.toFixed(0)}</td></tr>`;
  }).join('');
  return `<table><tr><th></th><th>pair</th><th>use</th><th>WCAG</th><th>AA</th><th>APCA</th></tr>${rows}</table>`;
}

function rampRow(label, arr) {
  return `<div class="row" style="gap:6px;align-items:center"><div class="lab" style="width:110px">${label}</div>${arr.map((s, i) => {
    const t = ratio('oklch(0.99 0 0)', s) > ratio('oklch(0.18 0 0)', s) ? '#fff' : '#111';
    return `<div class="sw" style="background:${s};color:${t}" title="${s}">${i + 1}<br>${hex(s)}</div>`;
  }).join('')}</div>`;
}

function glyphStatus(file) {
  const line = glyphGate.split(/\r?\n/).find((l) => l.startsWith(file));
  return line ? (line.includes(': OK') ? 'Romanian glyph gate: OK' : 'Romanian glyph gate: MISSING') : 'glyph gate not run';
}

function sheet(c, p, res) {
  const m = c.sheetMode;
  const s = p[m].sem;
  const tile = c.tile(p);
  const pass = res.filter((r) => r.wcagPass).length;
  const warn = res.filter((r) => r.wcagPass && !r.apcaPass).length;
  const lightBg = p.light.sem.canvas, darkBg = p.dark.sem.canvas;
  const guide = m === 'dark' ? p.dark.a[10] : p.light.a[10];
  const sizes = [16, 24, 32, 48, 128];
  const ladder = (bg) => `<div class="row" style="background:${bg};padding:18px;border-radius:12px;gap:22px;align-items:flex-end">${sizes.map((z) =>
    `<div class="c">${markSvg(c, { v: z === 16 ? 'micro' : z < 64 ? 'small' : 'master', size: z, colors: tile })}<span class="lab" style="color:${bg === darkBg ? p.dark.sem.muted : p.light.sem.muted}">${z}</span></div>`).join('')}</div>`;
  const mono = (fg, bg) => markSvg(c, { size: 72, colors: { bg, fg, accent: fg, over: fg } });
  const frames = [0.2, 0.45, 0.7, 0.9, 1].map((t) => `<div class="c">${markSvg(c, { size: 84, colors: tile, t })}<span class="lab">${Math.round(t * 100)}%</span></div>`).join('');
  const tabs = ['Inbox', 'Docs', 'Dragoș Cătălin', 'Build', 'Music'].map((title, i) => {
    const fav = i === 2 ? markSvg(c, { v: 'micro', size: 16, colors: tile }) : standin(STANDINS[i], 16);
    const active = i === 2;
    return `<div style="display:flex;gap:8px;align-items:center;padding:8px 12px;border-radius:8px 8px 0 0;background:${active ? '#2b2d31' : 'transparent'};color:${active ? '#f2f2f2' : '#a0a0a8'};font:12px Geist;width:150px">${fav}<span>${title}</span></div>`;
  }).join('');
  const taskbar = (z) => `<div class="row" style="background:#202024;padding:${z / 3}px ${z / 2}px;border-radius:8px;gap:${z / 2}px;align-items:center">${STANDINS.slice(0, 3).map((x) => standin(x, z)).join('')}${markSvg(c, { v: z < 32 ? 'micro' : 'small', size: z, colors: tile })}${STANDINS.slice(3).map((x) => standin(x, z)).join('')}</div>`;
  const androidMask = `<div style="position:relative;width:108px;height:108px">${markSvg(c, { size: 108, colors: { ...tile }, tile: true }).replace('<svg ', '<svg style="clip-path:circle(50%)" ')}<div style="position:absolute;left:21px;top:21px;width:66px;height:66px;border:1px dashed ${guide};border-radius:50%"></div></div>`;
  const og = `<div style="width:600px;height:315px;background:${darkBg};border-radius:10px;position:relative;overflow:hidden;padding:36px;display:flex;flex-direction:column;justify-content:space-between;border:1px solid ${p.dark.sem.line}">
    <div style="display:flex;gap:14px;align-items:center">${markSvg(c, { size: 44, colors: tile })}${wordmarkSvg(c.id, { ...c.bare(p, 'dark'), height: 26 })}</div>
    <div style="${c.display.css};font-size:${c.id === 'b' ? 38 : c.id === 'a' || c.id === 'd' ? 25 : 33}px;line-height:1.12;color:${p.dark.sem.fg};letter-spacing:${c.id === 'e' ? '-0.02em' : '0'}">${HEAD_EN}</div>
    <div style="font:12px 'Geist Mono';color:${p.dark.sem.muted}">dragoscatalin.ro · product engineer · founder</div></div>`;
  const appIcons = `<div class="row" style="gap:28px;align-items:flex-end">
    <div class="c">${markSvg(c, { size: 120, colors: tile }).replace('<svg ', `<svg style="border-radius:27px" `)}<span class="lab">apple-touch 180 (@⅔)</span></div>
    <div class="c">${androidMask}<span class="lab">Android 108 · safe 66</span></div>
    <div class="c">${markSvg(c, { size: 64, colors: tile })}<span class="lab">PWA 512 (@⅛)</span></div>
    <div class="c">${markSvg(c, { v: 'micro', size: 32, colors: tile })}<span class="lab">favicon 32</span></div>
    <div class="c">${markSvg(c, { v: 'micro', size: 16, colors: tile })}<span class="lab">16</span></div></div>`;
  const accentsRow = c.id === 'e' ? `<h2>Accent stays the owner's choice — same mark, 8 accents (all contrast-checked)</h2><div class="row" style="gap:18px">${SITE_ACCENTS.map(([name, H, C9]) =>
    `<div class="c">${markSvg(c, { size: 72, colors: { ...tile, fg: ok(0.68, C9, H) } })}<span class="lab">${name}</span></div>`).join('')}</div>` : '';
  const display = c.display;
  return `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>${c.name}</title><style>${baseCss(s)}</style></head><body>
<header style="display:flex;justify-content:space-between;align-items:flex-end;gap:40px;padding-bottom:22px;border-bottom:1px solid ${s.line}">
  <div><div class="lab">Concept ${c.id.toUpperCase()} · ${c.mood}${c.recommended ? ' · RECOMMENDED' : ''}</div>
  <div style="${display.css};font-size:64px;line-height:1.05;margin-top:8px">${c.name}</div>
  <div style="font-size:18px;margin-top:10px;max-width:900px">${c.tagline}</div>
  <div class="mut" style="font-size:15px;margin-top:6px;max-width:900px">${c.meaning}</div></div>
  <div class="panel" style="min-width:300px"><div class="lab">WCAG 2.2 AA (computed by contrast-gate.mjs)</div>
  <div style="font:700 34px 'Geist Mono';margin-top:6px;color:${pass === res.length ? s.success : s.danger}">${pass}/${res.length} pass</div>
  <div class="mut" style="font-size:12px;margin-top:4px">${res.length - pass} fail · ${warn} APCA advisories (PASS*)</div></div>
</header>
<div class="row" style="margin-top:32px;gap:32px;flex-wrap:nowrap">
  <div><div class="lab" style="margin-bottom:8px">Master 512 px · 48-unit keyline grid</div>${markSvg(c, { size: 512, colors: { ...tile, guide }, construction: true })}</div>
  <div style="flex:1;display:flex;flex-direction:column;gap:18px">
    <div class="lab">Lockups — light / dark</div>
    <div style="border-radius:12px;overflow:hidden;border:1px solid ${p.light.sem.line};background:${p.light.sem.canvas}">${lockupSvg(c, p, 'light', 110)}</div>
    <div style="border-radius:12px;overflow:hidden;border:1px solid ${p.dark.sem.line};background:${p.dark.sem.canvas}">${lockupSvg(c, p, 'dark', 110)}</div>
    <div class="lab" style="margin-top:6px">Wordmark — outlined from ${display.family}${glyphs.wordmarks[c.id].ownComma ? ', comma-below redrawn in the accent' : ''}</div>
    <div class="panel" style="background:${lightBg};padding:22px 26px">${wordmarkSvg(c.id, { ...c.bare(p, 'light'), height: 64 })}</div>
    <div class="lab" style="margin-top:6px">Logo motion — ${c.motion}</div>
    <div class="row" style="gap:16px">${frames}</div>
  </div>
</div>
<h2>Scale ladder — 16 micro · 24–48 small · 128 master — dark / light</h2>
<div class="row">${ladder(darkBg)}${ladder(lightBg)}</div>
<h2>Tests — one colour · inverse · blurred squint · browser tabs · Windows taskbar 24 / 36</h2>
<div class="row" style="align-items:center;gap:26px">
  <div class="c">${mono('#111111', '#ffffff')}<span class="lab">one colour</span></div>
  <div class="c">${mono('#ffffff', '#111111')}<span class="lab">inverse</span></div>
  <div class="c"><div style="filter:blur(3px)">${markSvg(c, { size: 72, colors: tile })}</div><span class="lab">squint</span></div>
  <div><div style="display:flex;background:#1b1c1f;padding:8px 8px 0;border-radius:10px;width:800px">${tabs}</div><div class="lab" style="margin-top:6px">16 px favicon among stand-in tabs</div></div>
  <div class="c">${taskbar(24)}${taskbar(36)}<span class="lab">taskbar 100 % / 150 % (stand-in icons)</span></div>
</div>
<h2>Palette — OKLCH, 12-step ramps (Radix step jobs) · accent: ${c.accent.name}</h2>
<div style="display:flex;flex-direction:column;gap:8px">
${rampRow('accent · light', p.light.a)}${rampRow('accent · dark', p.dark.a)}${rampRow('neutral · light', p.light.n)}${rampRow('neutral · dark', p.dark.n)}
</div>
${p.notes.length ? `<div class="mut" style="font-size:12px;margin-top:8px">Adjusted by the gate: ${p.notes.join('; ')}</div>` : ''}
<div class="row" style="margin-top:16px;gap:16px">${['light', 'dark'].map((md) => {
    const q = p[md].sem;
    return `<div style="background:${q.canvas};border:1px solid ${q.line};border-radius:14px;padding:20px;width:400px"><div style="font-size:15px;color:${q.fg}">${HEAD_EN.slice(0, 44)}…</div><div style="font-size:13px;color:${q.muted};margin:6px 0 14px">Muted text · <span style="color:${q.accentText}">accent link</span> · <span style="color:${q.danger}">error</span> · <span style="color:${q.success}">done</span></div><span style="background:${q.solid};color:${q.onSolid};padding:8px 14px;border-radius:999px;font:600 13px Geist;outline:2px solid ${q.focus};outline-offset:3px">Start a project</span> <span style="border:1px solid ${q.borderStrong};color:${q.fg};padding:7px 14px;border-radius:999px;font:500 13px Geist;margin-left:10px">See work</span></div>`;
  }).join('')}</div>
<h2>Contrast — every shipped pair, light / dark / logo (PASS* = WCAG pass, APCA below advisory)</h2>
<div class="row" style="gap:28px;align-items:flex-start">
  <div class="panel">${contrastTable(res, (n) => n.startsWith('light'))}</div>
  <div class="panel">${contrastTable(res, (n) => n.startsWith('dark') || n.startsWith('logo'))}</div>
  ${c.id === 'e' ? `<div class="panel">${contrastTable(res, (n) => n.startsWith('accent'))}</div>` : ''}
</div>
${accentsRow}
<h2>Type — ${display.family} (display, ${display.licence}) + Geist / Geist Mono (body, OFL 1.1)</h2>
<div class="row" style="gap:24px;flex-wrap:nowrap">
  <div class="panel" style="flex:1.4"><div style="${display.css};font-size:${c.id === 'a' || c.id === 'd' ? 30 : 40}px;line-height:1.12">${HEAD_RO}</div>
    <div style="font-size:17px;margin-top:14px;max-width:640px">${HEAD_EN} 20+ years of code, 15+ paid — product engineer, founder, cloud & networking.</div>
    <div style="font:13px 'Geist Mono';margin-top:10px" class="mut">const stack = ["Next.js", "Kotlin", "Rust", "Postgres"]; // 0 1 l I O</div></div>
  <div class="panel" style="flex:1"><div class="lab">Romanian glyph render test (comma-below, not cedilla)</div>
    <div style="${display.css};font-size:46px;margin-top:10px">${GLYPH_LINE}</div>
    <div style="font:500 40px Geist;margin-top:4px">${GLYPH_LINE}</div>
    <div class="mut" style="font-size:12px;margin-top:8px">${display.file}: ${glyphStatus(display.file)} · Geist[wght].ttf: ${glyphStatus('Geist[wght].ttf')}<br>Licence: <span style="color:${s.accentText}">${display.url}</span></div></div>
</div>
<h2>Favicon · app icons · OG image (1200 × 630 shown at 50 %)</h2>
<div class="row" style="gap:36px;align-items:flex-end">${og}${appIcons}</div>
<div class="lab" style="margin-top:36px">Pros — ${c.pros}</div><div class="lab" style="margin-top:6px">Cons — ${c.cons}</div>
</body></html>`;
}

function overview(all) {
  const s = all[4].p.dark.sem;
  const col = ({ c, p, res }) => {
    const tile = c.tile(p);
    const pass = res.filter((r) => r.wcagPass).length;
    const warn = res.filter((r) => r.wcagPass && !r.apcaPass).length;
    const strip = (arr) => `<div style="display:flex;height:16px;border-radius:4px;overflow:hidden">${arr.map((x) => `<div style="flex:1;background:${x}"></div>`).join('')}</div>`;
    return `<div style="width:286px;display:flex;flex-direction:column;gap:12px;padding:18px;border-radius:16px;background:${s.surface};border:${c.recommended ? `2px solid ${p.dark.a[8]}` : `1px solid ${s.line}`}">
      <div class="lab">${c.id.toUpperCase()} · ${c.mood}${c.recommended ? ' ★' : ''}</div>
      <div style="${c.display.css};font-size:34px;line-height:1">${c.name}</div>
      <div style="display:flex;justify-content:center;padding:10px 0">${markSvg(c, { size: 180, colors: tile })}</div>
      <div style="display:flex;gap:10px;align-items:center;justify-content:center;background:${p.light.sem.canvas};padding:8px;border-radius:8px">${markSvg(c, { v: 'micro', size: 16, colors: tile })}${markSvg(c, { v: 'small', size: 32, colors: tile })}${markSvg(c, { size: 48, colors: tile })}</div>
      <div style="background:${p.light.sem.canvas};padding:12px;border-radius:8px;display:flex;justify-content:center">${wordmarkSvg(c.id, { ...c.bare(p, 'light'), height: 30 })}</div>
      <div style="background:${p.dark.sem.canvas};padding:12px;border-radius:8px;display:flex;justify-content:center;border:1px solid ${p.dark.sem.line}">${wordmarkSvg(c.id, { ...c.bare(p, 'dark'), height: 30 })}</div>
      ${strip(p.light.a)}${strip(p.dark.n)}
      <div style="font-size:13px">${c.accent.name} <span class="mut">${hex(p.light.a[8])}</span></div>
      <div style="${c.display.css};font-size:24px">${GLYPH_LINE.slice(0, 9)}</div>
      <div class="mut" style="font-size:12px">${c.display.family} + Geist · OFL 1.1</div>
      <div style="font:600 14px 'Geist Mono';color:${pass === res.length ? s.success : s.danger}">WCAG AA ${pass}/${res.length} · ${warn} APCA adv.</div>
      <div class="mut" style="font-size:12px;line-height:1.45">${c.tagline}</div>
      <div style="font-size:12px;line-height:1.45"><b>+</b> ${c.pros}</div>
      <div class="mut" style="font-size:12px;line-height:1.45"><b>−</b> ${c.cons}</div></div>`;
  };
  return `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>Overview</title><style>${baseCss(s)}</style></head><body>
<div class="lab">dragoscatalin.ro · brand concepts · gate A/B · ${new Date().toISOString().slice(0, 10)}</div>
<div style="font:700 44px 'Bricolage Grotesque';font-variation-settings:'opsz' 96,'wdth' 88;margin:8px 0 6px">Dragoș Cătălin — five directions</div>
<div class="mut" style="font-size:16px;margin-bottom:24px">${HEAD_EN}</div>
<div style="display:flex;gap:16px;align-items:stretch">${all.map(col).join('')}</div></body></html>`;
}

function glyphPage() {
  const s = { canvas: '#fbfaf8', surface: '#ffffff', fg: '#1b1b1f', muted: '#5d5d66', line: '#dedcd8', success: '#1f7a3a', danger: '#c0262d' };
  const rows = FONT_FILES.map(([fam, file]) => {
    const st = glyphStatus(file);
    const okk = st.endsWith('OK');
    return `<tr><td style="width:300px"><div style="font:600 14px Geist">${fam}</div><div class="lab">${file}</div><div style="font:600 12px 'Geist Mono';color:${okk ? s.success : s.danger}">${st}</div></td>
    <td style="font-family:'${fam}';font-size:40px;padding:10px 0">${GLYPH_LINE} · Dragoș Cătălin</td>
    <td style="font-family:'${fam}';font-size:20px;color:${s.muted};padding-left:18px">ş ţ<br><span style="font:10px Geist">cedilla (wrong)</span></td></tr>`;
  }).join('');
  return `<!doctype html><html lang="ro"><head><meta charset="utf-8"><style>${baseCss(s)} td{border-bottom:1px solid ${s.line};vertical-align:middle;white-space:normal}</style></head><body>
<div class="lab">Romanian glyph render test · brand/scripts/check-glyphs.py (fontTools cmap) + browser render</div>
<div style="font:700 36px Geist;margin:8px 0 18px">ș ț ă â î Ș Ț Ă Â Î — every candidate font</div>
<table style="width:100%">${rows}</table>
<div class="mut" style="font-size:13px;margin-top:16px">A missing glyph renders in the fallback face (visible as a different shape). Silkscreen fails the gate and is excluded from every concept.</div></body></html>`;
}

// ---------------------------------------------------------------- main
const all = [];
for (const c of C) {
  const p = palette(c);
  const pairs = pairsFor(c, p);
  const dir = join(HERE, c.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'contrast-pairs.json'), JSON.stringify({ $description: `Concept ${c.id.toUpperCase()} ${c.name}`, pairs }, null, 2));
  const run = spawnSync(process.execPath, [GATE, join(dir, 'contrast-pairs.json')], { encoding: 'utf8' });
  writeFileSync(join(dir, 'contrast.txt'), `${run.stdout}${run.stderr}exit ${run.status}\n`);
  const res = evaluate(pairs);
  const tile = c.tile(p);
  writeFileSync(join(dir, 'mark.svg'), markSvg(c, { size: 512, colors: tile }));
  writeFileSync(join(dir, 'mark-16.svg'), markSvg(c, { v: 'micro', size: 16, colors: tile }));
  writeFileSync(join(dir, 'mark-construction.svg'), markSvg(c, { size: 512, colors: { ...tile, guide: p.dark.a[10] }, construction: true }));
  writeFileSync(join(dir, 'mark-bare-light.svg'), markSvg(c, { size: 512, tile: false, colors: { ...c.bare(p, 'light'), knock: p.light.sem.canvas } }));
  writeFileSync(join(dir, 'wordmark-light.svg'), wordmarkSvg(c.id, { ...c.bare(p, 'light'), height: 120 }));
  writeFileSync(join(dir, 'wordmark-dark.svg'), wordmarkSvg(c.id, { ...c.bare(p, 'dark'), height: 120 }));
  writeFileSync(join(dir, 'lockup-light.svg'), lockupSvg(c, p, 'light', 128));
  writeFileSync(join(dir, 'lockup-dark.svg'), lockupSvg(c, p, 'dark', 128));
  writeFileSync(join(dir, 'tokens.json'), JSON.stringify(dtcg(c, p), null, 2));
  writeFileSync(join(HERE, `sheet-${c.id}.html`), sheet(c, p, res));
  const pass = res.filter((r) => r.wcagPass).length;
  const warn = res.filter((r) => r.wcagPass && !r.apcaPass).length;
  console.log(`${c.id} ${c.name.padEnd(9)} pairs ${res.length}  WCAG pass ${pass}  fail ${res.length - pass}  APCA advisories ${warn}  gate exit ${run.status}  ${p.notes.join('; ')}`);
  all.push({ c, p, res });
}
writeFileSync(join(HERE, 'overview.html'), overview(all));
writeFileSync(join(HERE, 'glyph-test.html'), glyphPage());
writeFileSync(join(HERE, 'build', 'summary.json'), JSON.stringify(all.map(({ c, p, res }) => ({
  id: c.id, name: c.name, mood: c.mood, accent: c.accent.name, notes: p.notes,
  pairs: res.length, pass: res.filter((r) => r.wcagPass).length, apcaAdvisories: res.filter((r) => r.wcagPass && !r.apcaPass).length,
  semantic: { light: Object.fromEntries(Object.entries(p.light.sem).map(([k, v]) => [k, `${v} ${hex(v)}`])), dark: Object.fromEntries(Object.entries(p.dark.sem).map(([k, v]) => [k, `${v} ${hex(v)}`])) },
  accentRamp: { light: p.light.a.map((v) => `${v} ${hex(v)}`), dark: p.dark.a.map((v) => `${v} ${hex(v)}`) },
  neutralRamp: { light: p.light.n.map((v) => `${v} ${hex(v)}`), dark: p.dark.n.map((v) => `${v} ${hex(v)}`) },
  fails: res.filter((r) => !r.wcagPass).map((r) => `${r.name} ${r.ratio.toFixed(2)}`),
})), null, 2));
