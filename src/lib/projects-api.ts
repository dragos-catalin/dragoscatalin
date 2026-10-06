import { allRepos } from "@/data/projects";
import type { Project, RepoStats } from "@/data/types";
import { fetchRepoStats } from "@/lib/github";
import { liveSurfaces, liveWebsite, sortedPlatforms, sortedStores } from "@/lib/project-links";
import { site } from "@/lib/site";

export interface ApiProject {
    slug: string;
    name: string;
    url: string;
    tagline: Project["tagline"];
    summary: Project["summary"];
    status: Project["status"];
    category: Project["category"];
    visibility: Project["visibility"];
    years: Project["years"];
    stack: string[];
    surfaces: NonNullable<Project["surfaces"]>;
    platforms: NonNullable<Project["platforms"]>;
    stores: NonNullable<Project["stores"]>;
    metrics: NonNullable<Project["metrics"]>;
    teaser?: Project["teaser"];
    listings: NonNullable<Project["listings"]>;
    website?: string;
    repos: { owner: string; name: string; url?: string; stats?: RepoStats }[];
    packages: NonNullable<Project["packages"]>;
    disclaimer?: Project["disclaimer"];
}

export function toApiProject(p: Project, stats: Record<string, RepoStats>): ApiProject {
    const website = liveWebsite(p);
    return {
        slug: p.slug,
        name: p.name,
        url: `${site.url}/projects/${p.slug}`,
        tagline: p.tagline,
        summary: p.summary,
        status: p.status,
        category: p.category,
        visibility: p.visibility,
        years: p.years,
        stack: p.stack,
        surfaces: liveSurfaces(p),
        platforms: sortedPlatforms(p),
        stores: sortedStores(p),
        metrics: p.metrics ?? [],
        ...(p.teaser ? { teaser: p.teaser } : {}),
        listings: p.listings ?? [],
        ...(website ? { website } : {}),
        repos: (p.repos ?? []).map((r) => {
            const s = stats[`${r.owner}/${r.name}`];
            return {
                owner: r.owner,
                name: r.name,
                ...(p.visibility === "public"
                    ? { url: `https://github.com/${r.owner}/${r.name}` }
                    : {}),
                ...(s ? { stats: s } : {}),
            };
        }),
        packages: p.packages ?? [],
        ...(p.disclaimer ? { disclaimer: p.disclaimer } : {}),
    };
}

export function loadStats(): Promise<Record<string, RepoStats>> {
    return fetchRepoStats(allRepos);
}

export const API_HEADERS: Record<string, string> = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800",
};

export function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), { status, headers: API_HEADERS });
}
