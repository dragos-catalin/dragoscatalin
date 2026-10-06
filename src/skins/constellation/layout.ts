import { coverRandom, coverSeed } from "@/components/projects/cover";

/** Poster viewBox (SVG user units). The R3F scene maps the same points with "slice" scaling. */
export const SKY_W = 100;
export const SKY_H = 60;
const STARS = 140;

export interface PosterStar {
    x: number;
    y: number;
    r: number;
    o: number;
}

export interface SkyLayout {
    stars: PosterStar[];
    /** Constellation vertices, in drawing order; the first `flags` are flagship projects. */
    bright: { x: number; y: number }[];
}

function round(n: number) {
    return Math.round(n * 100) / 100;
}

/**
 * Deterministic layout shared by the static SVG poster and the lazily mounted R3F scene, so the
 * constellation sits in the same place when the canvas cross-fades over the poster.
 */
export function skyLayout(flags: number): SkyLayout {
    const rnd = coverRandom(coverSeed("constellation"));
    const stars = Array.from({ length: STARS }, () => ({
        x: round(rnd() * SKY_W),
        y: round(rnd() * SKY_H),
        r: round(0.04 + rnd() * rnd() * 0.22),
        o: round(0.35 + rnd() * 0.65),
    }));
    const bright = Array.from({ length: Math.max(flags, 2) + 3 }, (_, i) => ({
        x: round(12 + i * 15 + rnd() * 6),
        y: round(14 + rnd() * 30),
    }));
    return { stars, bright };
}
