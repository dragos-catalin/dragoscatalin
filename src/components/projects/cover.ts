import type { Project } from "@/data/types";

export const DEFAULT_HUE = 272;

/** Gradient background for a project cover, derived from its brand hue. */
export function coverGradient(hue: number | undefined): string {
    const h = hue ?? DEFAULT_HUE;
    return `radial-gradient(120% 80% at 30% 20%, oklch(0.6 0.18 ${h} / 0.55), transparent 60%), linear-gradient(135deg, oklch(0.25 0.06 ${h}), oklch(0.15 0.03 ${h}))`;
}

export function coverTransitionName(slug: Project["slug"]): string {
    return `project-cover-${slug}`;
}
