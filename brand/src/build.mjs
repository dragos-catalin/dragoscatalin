// build.mjs — Keystone brand pack generator (dragoscatalin.ro, V3-02). ONE source for the mark.
//
//   node brand/src/build.mjs
//
// Reads the shaped wordmark outlines (brand/concepts/src/build/glyphs.json, produced by
// brand/concepts/src/wordmark.py from Bricolage Grotesque wght 720 / opsz 96 / wdth 88) and writes:
//   brand/logo/*.svg                      masters (mark, 16 px cut, mono, construction, wordmarks, lockups)
//   brand/tokens.json                     DTCG 2025.10 (primitives -> semantic, typography, motion)
//   brand/contrast-pairs.json             input for brand/scripts/contrast-gate.mjs
//   src/components/brand/geometry.ts      path data the React mark/wordmark render (never hand-edit)
// Icons/favicons are rendered from brand/logo by scripts/optimize-assets.mjs.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseColor, toHex } from "../scripts/contrast-gate.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BRAND = join(HERE, "..");
const ROOT = join(BRAND, "..");
const glyphs = JSON.parse(
    readFileSync(join(BRAND, "concepts", "src", "build", "glyphs.json"), "utf8"),
);
const wm = glyphs.wordmarks.e;

const r3 = (n) => Math.round(n * 1000) / 1000;
const hex = (c) => toHex(parseColor(c).rgb);

// ------------------------------------------------------------------ palette (OKLCH source of truth)
const ok = (L, C, H) => `oklch(${L} ${C} ${H})`;
const N = 265; // slate hue
const P = {
    ember: ok(0.68, 0.19, 42), // #f46622 — brand solid, mark fill, default accent
    emberTextLight: ok(0.5, 0.19, 42),
    emberTextDark: ok(0.74, 0.19, 42),
    tile: ok(0.182, 0.016, N), // mark tile, both modes
    inkLight: ok(0.2, 0.01, N),
    inkDark: ok(0.95, 0.01, N),
    white: ok(1, 0, 0),
    black: ok(0, 0, 0),
};
const HEX = Object.fromEntries(Object.entries(P).map(([k, v]) => [k, hex(v)]));

// Site semantic tokens (mirror src/app/globals.css; the contrast gate proves them).
const SEM = {
    light: {
        bg: ok(0.99, 0.004, N),
        "bg-deep": ok(0.965, 0.008, N),
        surface: ok(1, 0, 0),
        "surface-raised": ok(0.975, 0.008, N),
        fg: ok(0.2, 0.01, N),
        "fg-muted": ok(0.45, 0.012, N),
        "fg-subtle": ok(0.5, 0.01, N),
        line: ok(0.88, 0.008, N),
        "line-strong": ok(0.78, 0.01, N),
        accent: ok(0.5, 0.19, 42),
        "accent-strong": ok(0.44, 0.19, 42),
        "accent-fg": ok(0.99, 0.01, 42),
        "accent-mark": P.ember,
        success: ok(0.47, 0.14, 155),
        "warning-fg": ok(0.42, 0.12, 70),
        danger: ok(0.53, 0.2, 25),
    },
    dark: {
        bg: ok(0.155, 0.016, N),
        "bg-deep": ok(0.13, 0.016, N),
        surface: ok(0.182, 0.016, N),
        "surface-raised": ok(0.212, 0.016, N),
        fg: ok(0.95, 0.01, N),
        "fg-muted": ok(0.72, 0.016, N),
        "fg-subtle": ok(0.64, 0.016, N),
        line: ok(0.32, 0.016, N),
        "line-strong": ok(0.42, 0.016, N),
        accent: ok(0.74, 0.19, 42),
        "accent-strong": ok(0.8, 0.19, 42),
        "accent-fg": ok(0.14, 0.03, 42),
        "accent-mark": P.ember,
        success: ok(0.75, 0.15, 155),
        "warning-fg": ok(0.85, 0.14, 80),
        danger: ok(0.7, 0.18, 25),
    },
};
const ACCENTS = [
    ["ember", 42, 0.19],
    ["orange", 50, 0.18],
    ["amber", 75, 0.16],
    ["rose", 15, 0.19],
    ["violet", 300, 0.19],
    ["indigo", 275, 0.18],
    ["cyan", 215, 0.14],
    ["emerald", 160, 0.15],
];

// ------------------------------------------------------------------ mark geometry (48-unit grid)
// D: a solid block, 2-unit corner radius on the stem side, a 15-unit bowl.
// C: an annular sector carved out of the D, centre (22.5, 24), mean radius 6.5, opening +-40 deg.
const D_PATH = "M10.5 9H24A15 15 0 0 1 24 39H10.5Q8.5 39 8.5 37V11Q8.5 9 10.5 9Z";
const C_CENTRE = [22.5, 24];
const C_R = 6.5;
const C_OPEN = 40;
function cRing(width) {
    const [cx, cy] = C_CENTRE;
    const ro = C_R + width / 2,
        ri = C_R - width / 2;
    const a = (C_OPEN * Math.PI) / 180;
    const pt = (r, s) => `${r3(cx + r * Math.cos(a))} ${r3(cy + s * r * Math.sin(a))}`;
    return `M${pt(ro, -1)}A${ro} ${ro} 0 1 0 ${pt(ro, 1)}L${pt(ri, 1)}A${ri} ${ri} 0 1 1 ${pt(ri, -1)}Z`;
}
function cStroke() {
    const [cx, cy] = C_CENTRE;
    const a = (C_OPEN * Math.PI) / 180;
    const pt = (s) => `${r3(cx + C_R * Math.cos(a))} ${r3(cy + s * C_R * Math.sin(a))}`;
    return `M${pt(-1)}A${C_R} ${C_R} 0 1 0 ${pt(1)}`;
}
const STROKE = { master: 5, micro: 5.6 };
const MARK = {
    d: D_PATH,
    cStroke: cStroke(),
    cRing: cRing(STROKE.master),
    cRingMicro: cRing(STROKE.micro),
    knockout: `${D_PATH}${cRing(STROKE.master)}`,
    knockoutMicro: `${D_PATH}${cRing(STROKE.micro)}`,
};

// ------------------------------------------------------------------ wordmark (lettered comma)
// Text shaped as "Dragos Cătălin" (plain s); the comma-below is drawn here as a round accent drop.
const COMMA_R = 9.5;
function commaPath(cx, r) {
    const hy = r + 7;
    const k = (n) => r3(n);
    // circle as two arcs + tail, one closed path so it is a single fill
    return (
        `M${k(cx - r)} ${k(hy)}A${r} ${r} 0 1 1 ${k(cx + r)} ${k(hy)}` +
        `C${k(cx + r)} ${k(hy + r * 1.9)} ${k(cx - r * 0.2)} ${k(hy + r * 3)} ${k(cx - r * 1.15)} ${k(hy + r * 3.35)}` +
        `L${k(cx - r * 1.3)} ${k(hy + r * 2.9)}C${k(cx - r * 0.45)} ${k(hy + r * 2.4)} ${k(cx + r * 0.05)} ${k(hy + r * 1.7)} ${k(cx)} ${k(hy + r * 0.95)}` +
        `A${r} ${r} 0 0 1 ${k(cx - r)} ${k(hy)}Z`
    );
}
const anchor = wm.anchors[0];
const COMMA_CX = (anchor.x0 + anchor.x1) / 2;
const COMMA = commaPath(COMMA_CX, COMMA_R);
const PAD = 6;
const [bx0, by0, bx1] = wm.bounds;
const WM_BOX = { x: bx0 - PAD, y: Math.min(by0, -112) - PAD, w: bx1 - bx0 + PAD * 2 };
WM_BOX.h = COMMA_R * 4.5 + 7 + PAD - WM_BOX.y;

function wordmarkInner(ink, comma) {
    return `<path d="${wm.d}" fill="${ink}"/><path d="${COMMA}" fill="${comma}"/>`;
}
function wordmarkSvg(ink, comma, height = 96) {
    const width = (height * WM_BOX.w) / WM_BOX.h;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r3(WM_BOX.x)} ${r3(WM_BOX.y)} ${r3(WM_BOX.w)} ${r3(WM_BOX.h)}" width="${r3(width)}" height="${height}" role="img" aria-label="Dragoș Cătălin">${wordmarkInner(ink, comma)}</svg>\n`;
}

// ------------------------------------------------------------------ mark svgs
function markSvg({
    size = 512,
    micro = false,
    tile = HEX.tile,
    fill = HEX.ember,
    rx = 11,
    label = true,
} = {}) {
    const knock = micro ? MARK.knockoutMicro : MARK.knockout;
    const bg = tile ? `<rect width="48" height="48" rx="${rx}" fill="${tile}"/>` : "";
    const a = label ? ' role="img" aria-label="Dragoș Cătălin"' : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}"${a}>${bg}<path d="${knock}" fill="${fill}" fill-rule="evenodd"/></svg>\n`;
}
function constructionSvg() {
    const lines = [];
    for (let i = 4; i < 48; i += 4) lines.push(`M${i} 0V48M0 ${i}H48`);
    const g = "#7e8085";
    return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 52 52" width="1040" height="1040">` +
        `<rect x="-2" y="-2" width="52" height="52" fill="${HEX.tile}"/>` +
        `<path d="${MARK.knockout}" fill="${HEX.ember}" fill-rule="evenodd"/>` +
        `<g fill="none" stroke="${g}" stroke-width="0.08"><path d="${lines.join("")}" opacity="0.5"/>` +
        `<rect x="0" y="0" width="48" height="48" rx="11"/><rect x="4" y="4" width="40" height="40"/>` +
        `<circle cx="24" cy="24" r="20"/><path d="M24 0V48M0 24H48"/>` +
        `<circle cx="24" cy="24" r="15" stroke="#f46622" stroke-dasharray="0.6 0.6"/>` +
        `<circle cx="${C_CENTRE[0]}" cy="${C_CENTRE[1]}" r="${C_R}" stroke="#ebeef5" stroke-dasharray="0.4 0.4"/>` +
        `<path d="M${C_CENTRE[0]} ${C_CENTRE[1]}L${r3(C_CENTRE[0] + 12 * Math.cos(0.698))} ${r3(C_CENTRE[1] - 12 * Math.sin(0.698))}M${C_CENTRE[0]} ${C_CENTRE[1]}L${r3(C_CENTRE[0] + 12 * Math.cos(0.698))} ${r3(C_CENTRE[1] + 12 * Math.sin(0.698))}" stroke="#ebeef5"/>` +
        `</g><g fill="#ebeef5" font-family="monospace" font-size="1.4">` +
        `<text x="0.5" y="-0.5">48-unit grid · tile r 11 · D bowl r 15 · C r 6.5 ± 2.5 (16 px cut ± 2.8) · opening ±40°</text></g></svg>\n`
    );
}
function lockupSvg(ink, comma, h = 128) {
    const capBox = h * 0.58;
    const wmW = (capBox * WM_BOX.w) / WM_BOX.h;
    const gap = h * 0.28;
    const W = h + gap + wmW,
        H = h;
    return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r3(W)} ${H}" width="${r3(W)}" height="${H}" role="img" aria-label="Dragoș Cătălin">` +
        markSvg({ size: h, label: false }).trim().replace("<svg ", '<svg x="0" y="0" ') +
        `<svg x="${r3(h + gap)}" y="${r3((h - capBox) / 2 + capBox * 0.06)}" width="${r3(wmW)}" height="${r3(capBox)}" viewBox="${r3(WM_BOX.x)} ${r3(WM_BOX.y)} ${r3(WM_BOX.w)} ${r3(WM_BOX.h)}">${wordmarkInner(ink, comma)}</svg></svg>\n`
    );
}

// ------------------------------------------------------------------ tokens (DTCG 2025.10)
const col = (s) => {
    const m = s.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/);
    return {
        $type: "color",
        $value: { colorSpace: "oklch", components: [+m[1], +m[2], +m[3]], hex: hex(s) },
    };
};
const concept = JSON.parse(
    readFileSync(join(BRAND, "concepts", "src", "e", "tokens.json"), "utf8"),
);
const tokens = {
    $description:
        "dragoscatalin.ro brand Keystone — DTCG 2025.10. Generated by brand/src/build.mjs; do not hand-edit.",
    primitive: {
        color: {
            neutral: concept.color.neutral,
            ember: concept.color.accent,
            brand: Object.fromEntries(Object.entries(P).map(([k, v]) => [k, col(v)])),
            accentHues: Object.fromEntries(
                ACCENTS.map(([n, h, c]) => [
                    n,
                    {
                        $type: "color",
                        $description: `data-accent="${n}" — hue ${h}, chroma ${c}; mark solid L 0.68`,
                        $value: {
                            colorSpace: "oklch",
                            components: [0.68, c, h],
                            hex: hex(ok(0.68, c, h)),
                        },
                    },
                ]),
            ),
        },
    },
    semantic: {
        light: Object.fromEntries(Object.entries(SEM.light).map(([k, v]) => [k, col(v)])),
        dark: Object.fromEntries(Object.entries(SEM.dark).map(([k, v]) => [k, col(v)])),
    },
    typography: {
        display: {
            $type: "fontFamily",
            $value: ["Bricolage Grotesque", "Arial", "sans-serif"],
            $description: "wght 600-800, opsz auto, wdth 88 (pinned in the subset)",
        },
        body: {
            $type: "fontFamily",
            $value: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        },
        mono: { $type: "fontFamily", $value: ["Geist Mono", "ui-monospace", "monospace"] },
        wordmark: {
            $type: "typography",
            $value: {
                fontFamily: "{typography.display}",
                fontWeight: 720,
                letterSpacing: { value: -0.025, unit: "em" },
            },
        },
    },
    motion: {
        duration: {
            land: { $type: "duration", $value: { value: 380, unit: "ms" } },
            carve: { $type: "duration", $value: { value: 480, unit: "ms" } },
            drop: { $type: "duration", $value: { value: 320, unit: "ms" } },
        },
        delay: {
            carve: { $type: "duration", $value: { value: 260, unit: "ms" } },
            drop: { $type: "duration", $value: { value: 700, unit: "ms" } },
        },
        easing: {
            outExpo: { $type: "cubicBezier", $value: [0.16, 1, 0.3, 1] },
            spring: { $type: "cubicBezier", $value: [0.34, 1.56, 0.64, 1] },
        },
        logo: {
            $description:
                "intro: D lands (scale 0.9 -> 1, fade), C carved in one stroke (dashoffset 1 -> 0), comma drops (-0.5em -> 0). Total 1020 ms. Reduced motion: final frame, no animation. Static mark == final frame.",
        },
    },
};

// ------------------------------------------------------------------ contrast pairs
const pairs = [];
for (const mode of ["light", "dark"]) {
    const s = SEM[mode];
    const add = (name, fg, bg, use) => pairs.push({ name: `${mode}: ${name}`, fg, bg, use });
    for (const bg of ["bg", "bg-deep", "surface", "surface-raised"]) {
        add(`fg on ${bg}`, s.fg, s[bg], "body");
        add(`fg-muted on ${bg}`, s["fg-muted"], s[bg], "body");
        add(`fg-subtle on ${bg}`, s["fg-subtle"], s[bg], "body");
        add(`accent on ${bg}`, s.accent, s[bg], "body");
    }
    add("accent-fg on accent", s["accent-fg"], s.accent, "body");
    // line / line-strong are decorative separators; the focus ring carries SC 1.4.11.
    add("success on surface", s.success, s.surface, "body");
    add("warning-fg on surface", s["warning-fg"], s.surface, "body");
    add("danger on surface", s.danger, s.surface, "body");
    add("focus ring (accent) on bg", s.accent, s.bg, "ui");
    add("mark tile on bg (ui)", P.tile, s.bg, mode === "light" ? "ui" : "ui-skip");
    for (const [n, h, c] of ACCENTS) {
        const L = mode === "light" ? 0.5 : 0.74;
        add(`accent ${n} text on bg`, ok(L, c, h), s.bg, "body");
        add(`accent ${n} text on surface`, ok(L, c, h), s.surface, "body");
        add(
            `accent ${n} fg on solid`,
            mode === "light" ? ok(0.99, 0.01, h) : ok(0.14, 0.03, h),
            ok(L, c, h),
            "body",
        );
    }
}
for (const [n, h, c] of ACCENTS)
    pairs.push({ name: `logo: ${n} D on slate tile`, fg: ok(0.68, c, h), bg: P.tile, use: "ui" });
pairs.push({
    name: "logo: wordmark ink on light bg",
    fg: P.inkLight,
    bg: SEM.light.bg,
    use: "large",
});
pairs.push({ name: "logo: wordmark ink on dark bg", fg: P.inkDark, bg: SEM.dark.bg, use: "large" });
const gatePairs = pairs.filter((p) => p.use !== "ui-skip");

// ------------------------------------------------------------------ write
const LOGO = join(BRAND, "logo");
mkdirSync(LOGO, { recursive: true });
const files = {
    "mark.svg": markSvg(),
    "mark-16.svg": markSvg({ size: 16, micro: true }),
    "mark-square.svg": markSvg({ rx: 0 }),
    "mark-mono-black.svg": markSvg({ tile: null, fill: "#000000" }),
    "mark-mono-white.svg": markSvg({ tile: null, fill: "#ffffff" }),
    "mark-bare.svg": markSvg({ tile: null }),
    "construction.svg": constructionSvg(),
    "wordmark-light.svg": wordmarkSvg(HEX.inkLight, "#bf4700"),
    "wordmark-dark.svg": wordmarkSvg(HEX.inkDark, HEX.ember),
    "wordmark-mono-black.svg": wordmarkSvg("#000000", "#000000"),
    "lockup-light.svg": lockupSvg(HEX.inkLight, "#bf4700"),
    "lockup-dark.svg": lockupSvg(HEX.inkDark, HEX.ember),
};
for (const [f, s] of Object.entries(files)) writeFileSync(join(LOGO, f), s);
writeFileSync(join(BRAND, "tokens.json"), JSON.stringify(tokens, null, 2) + "\n");
writeFileSync(
    join(BRAND, "contrast-pairs.json"),
    JSON.stringify(
        {
            $description: "Keystone site + logo pairs (generated by brand/src/build.mjs)",
            pairs: gatePairs,
        },
        null,
        2,
    ) + "\n",
);

const ts = `// GENERATED by brand/src/build.mjs — do not edit. Keystone mark + wordmark geometry.
// Mark: 48-unit grid. Wordmark: cap height 100, baseline y = 0 (Bricolage Grotesque 720/96/88).
export const MARK = ${JSON.stringify({ d: MARK.d, cStroke: MARK.cStroke, knockout: MARK.knockout }, null, 4)} as const;

export const WORDMARK = ${JSON.stringify(
    {
        viewBox: [WM_BOX.x, WM_BOX.y, WM_BOX.w, WM_BOX.h].map(r3).join(" "),
        comma: COMMA,
        commaCx: r3(COMMA_CX),
    },
    null,
    4,
)} as const;

/** Comma-below on its own (for live-text wordmarks): viewBox fits the drop, origin = s centre. */
export const COMMA = ${JSON.stringify({ d: commaPath(0, COMMA_R), viewBox: `${r3(-COMMA_R * 1.3)} 7 ${r3(COMMA_R * 2.3)} ${r3(COMMA_R * 4.35)}` }, null, 4)} as const;
`;
mkdirSync(join(ROOT, "src", "components", "brand"), { recursive: true });
writeFileSync(join(ROOT, "src", "components", "brand", "geometry.ts"), ts);

console.log("logo:", Object.keys(files).join(", "));
console.log("pairs:", gatePairs.length, "· hex", HEX);
console.log("wordmark box", WM_BOX, "comma cx", r3(COMMA_CX));
