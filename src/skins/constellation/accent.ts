/** Brand fallback (Ember) when the computed accent colour cannot be parsed. */
export const FALLBACK_ACCENT = "#f46622";

const NUM = String.raw`(-?[\d.]+(?:e-?\d+)?)(%?)`;
const RGB_RE = new RegExp(String.raw`^rgba?\(\s*${NUM}[\s,]+${NUM}[\s,]+${NUM}`, "i");
const SRGB_RE = new RegExp(String.raw`^color\(\s*srgb\s+${NUM}\s+${NUM}\s+${NUM}`, "i");
const OKLCH_RE = new RegExp(String.raw`^oklch\(\s*${NUM}\s+${NUM}\s+${NUM}`, "i");

function clamp01(n: number) {
    return Math.min(1, Math.max(0, n));
}

function toHex(r: number, g: number, b: number) {
    return `#${[r, g, b]
        .map((c) =>
            Math.round(clamp01(c) * 255)
                .toString(16)
                .padStart(2, "0"),
        )
        .join("")}`;
}

function gamma(linear: number) {
    const c = clamp01(linear);
    return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

/** OKLCH (L 0..1, C, H degrees) -> gamma-encoded sRGB 0..1 (Björn Ottosson's matrices). */
function oklchToSrgb(l: number, c: number, h: number): [number, number, number] {
    const rad = (h * Math.PI) / 180;
    const a = c * Math.cos(rad);
    const b = c * Math.sin(rad);
    const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [
        gamma(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
        gamma(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
        gamma(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
    ];
}

function channel(match: RegExpExecArray, i: number, percentScale: number) {
    const value = Number(match[i * 2 + 1]);
    return match[i * 2 + 2] === "%" ? (value / 100) * percentScale : value;
}

/**
 * Parse a computed CSS colour (`getComputedStyle(el).color`) to `#rrggbb`. Browsers return
 * `rgb()`, `color(srgb …)` or — for OKLCH sources in current Chromium/WebKit — `oklch()`.
 * Returns null for anything else so the caller can fall back to {@link FALLBACK_ACCENT}.
 */
export function parseCssColor(input: string): string | null {
    const value = input.trim();
    const rgb = RGB_RE.exec(value);
    if (rgb) {
        return toHex(
            channel(rgb, 0, 255) / 255,
            channel(rgb, 1, 255) / 255,
            channel(rgb, 2, 255) / 255,
        );
    }
    const srgb = SRGB_RE.exec(value);
    if (srgb) return toHex(channel(srgb, 0, 1), channel(srgb, 1, 1), channel(srgb, 2, 1));
    const oklch = OKLCH_RE.exec(value);
    if (oklch) {
        const [r, g, b] = oklchToSrgb(
            channel(oklch, 0, 1),
            channel(oklch, 1, 0.4),
            channel(oklch, 2, 1),
        );
        return toHex(r, g, b);
    }
    return null;
}
