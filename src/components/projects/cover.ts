import type { Project } from "@/data/types";

/** Projects without a brand hue follow the user's accent (CSS var, resolved at paint). */
export const DEFAULT_HUE = "var(--accent-h)";

/** Gradient background for a project cover, derived from its brand hue. */
export function coverGradient(hue: number | undefined): string {
    const h = hue ?? DEFAULT_HUE;
    return `radial-gradient(120% 80% at 30% 20%, oklch(0.6 0.18 ${h} / 0.55), transparent 60%), linear-gradient(135deg, oklch(0.25 0.06 ${h}), oklch(0.15 0.03 ${h}))`;
}

export function coverTransitionName(slug: Project["slug"]): string {
    return `project-cover-${slug}`;
}

/** Deterministic 32-bit hash of a slug (FNV-1a), used to seed generated cover art. */
export function coverSeed(slug: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < slug.length; i++) {
        h ^= slug.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

/** mulberry32 — tiny seeded PRNG returning floats in [0, 1). */
export function coverRandom(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
