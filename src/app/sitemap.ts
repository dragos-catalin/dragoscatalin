import type { MetadataRoute } from "next";
import { allRepos, projects } from "@/data/projects";
import { routing } from "@/i18n/routing";
import { fetchRepoStats } from "@/lib/github";
import { localeUrl } from "@/lib/seo";

const STATIC_PATHS = [
    "/",
    "/projects",
    "/services",
    "/lab",
    "/about",
    "/open-source",
    "/now",
    "/uses",
    "/press",
    "/privacy",
] as const;

function priorityFor(path: string): number {
    if (path === "/") return 1.0;
    if (path.startsWith("/projects") || path === "/services") return 0.8;
    return 0.6;
}

function entries(path: string, lastModified: Date): MetadataRoute.Sitemap {
    const languages: Record<string, string> = {};
    for (const l of routing.locales) languages[l] = localeUrl(l, path);
    return routing.locales.map((locale) => ({
        url: localeUrl(locale, path),
        lastModified,
        changeFrequency: "weekly",
        priority: priorityFor(path),
        alternates: { languages },
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const stats = await fetchRepoStats(allRepos);

    const out: MetadataRoute.Sitemap = [];
    for (const path of STATIC_PATHS) out.push(...entries(path, now));

    for (const p of projects) {
        const pushed = (p.repos ?? [])
            .map((r) => stats[`${r.owner}/${r.name}`]?.pushedAt)
            .filter((d): d is string => Boolean(d))
            .map((d) => new Date(d).getTime());
        const lastModified = pushed.length ? new Date(Math.max(...pushed)) : now;
        out.push(...entries(`/projects/${p.slug}`, lastModified));
    }
    return out;
}
