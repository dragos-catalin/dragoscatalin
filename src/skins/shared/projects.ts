import { featuredProjects, projects } from "@/data/projects";
import type { Project } from "@/data/types";

const SHOWN: readonly Project["status"][] = ["live", "launching", "active"];

/**
 * Projects a skin home teases: the flagships first (registry order), then the most recent
 * shipped or in-flight work. Always driven by src/data/projects.ts — never hardcode names.
 */
export function teaserProjects(count: number): Project[] {
    const featured = new Set(featuredProjects.map((p) => p.slug));
    const rest = projects
        .filter((p) => !featured.has(p.slug) && SHOWN.includes(p.status))
        .sort((a, b) => (b.years.to ?? 9999) - (a.years.to ?? 9999) || b.years.from - a.years.from);
    return [...featuredProjects, ...rest].slice(0, count);
}
