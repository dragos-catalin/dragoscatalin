import { cacheLife, cacheTag } from "next/cache";
import type { PackageRef, PackageStats, RepoRef, RepoStats } from "@/data/types";

const GQL = "https://api.github.com/graphql";

function token() {
    return process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? null;
}

function alias(i: number) {
    return `r${i}`;
}

interface GqlRepo {
    nameWithOwner: string;
    url: string;
    description: string | null;
    homepageUrl: string | null;
    stargazerCount: number;
    forkCount: number;
    pushedAt: string;
    isArchived: boolean;
    licenseInfo: { spdxId: string } | null;
    languages: {
        totalSize: number;
        edges: { size: number; node: { name: string; color: string | null } }[];
    };
    releases: {
        totalCount: number;
        nodes: { tagName: string; name: string | null; publishedAt: string; url: string }[];
    };
}

/**
 * Fetch stats for many repos in one GraphQL round-trip.
 * Cached for a day ("use cache" + cacheLife('days')). Without a token this
 * still works for public repos (60 req/h) — one query covers all of them.
 */
export async function fetchRepoStats(repos: RepoRef[]): Promise<Record<string, RepoStats>> {
    "use cache";
    cacheLife("days");
    cacheTag("github");

    if (repos.length === 0) return {};
    const fields = repos
        .map(
            (
                r,
                i,
            ) => `${alias(i)}: repository(owner: ${JSON.stringify(r.owner)}, name: ${JSON.stringify(r.name)}) {
        nameWithOwner url description homepageUrl stargazerCount forkCount pushedAt isArchived
        licenseInfo { spdxId }
        languages(first: 4, orderBy: {field: SIZE, direction: DESC}) { totalSize edges { size node { name color } } }
        releases(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) { totalCount nodes { tagName name publishedAt url } }
      }`,
        )
        .join("\n");
    const query = `query { ${fields} }`;

    const t = token();
    if (!t) return {};
    try {
        const res = await fetch(GQL, {
            method: "POST",
            headers: { "content-type": "application/json", authorization: `bearer ${t}` },
            body: JSON.stringify({ query }),
        });
        if (!res.ok) {
            console.warn(`[github] GraphQL ${res.status}`);
            return {};
        }
        const json = (await res.json()) as {
            data?: Record<string, GqlRepo | null>;
            errors?: unknown[];
        };
        const out: Record<string, RepoStats> = {};
        repos.forEach((r, i) => {
            const d = json.data?.[alias(i)];
            if (!d) return;
            const total = d.languages.totalSize || 1;
            out[`${r.owner}/${r.name}`] = {
                owner: r.owner,
                name: r.name,
                url: d.url,
                description: d.description,
                homepage: d.homepageUrl,
                stars: d.stargazerCount,
                forks: d.forkCount,
                pushedAt: d.pushedAt,
                isArchived: d.isArchived,
                license: d.licenseInfo?.spdxId ?? null,
                languages: d.languages.edges.map((e) => ({
                    name: e.node.name,
                    color: e.node.color,
                    percent: Math.round((e.size / total) * 100),
                })),
                latestRelease: d.releases.nodes[0]
                    ? {
                          tag: d.releases.nodes[0].tagName,
                          name: d.releases.nodes[0].name,
                          publishedAt: d.releases.nodes[0].publishedAt,
                          url: d.releases.nodes[0].url,
                      }
                    : null,
                releaseCount: d.releases.totalCount,
            };
        });
        return out;
    } catch (err) {
        console.warn("[github] fetch failed", err);
        return {};
    }
}

export async function fetchPackageStats(pkgs: PackageRef[]): Promise<Record<string, PackageStats>> {
    "use cache";
    cacheLife("days");
    cacheTag("packages");

    const out: Record<string, PackageStats> = {};
    await Promise.all(
        pkgs.map(async (p) => {
            const key = `${p.registry}:${p.name}`;
            try {
                if (p.registry === "npm") {
                    const [meta, dl] = await Promise.all([
                        fetch(
                            `https://registry.npmjs.org/${encodeURIComponent(p.name).replace("%40", "@")}/latest`,
                        ).then((r) => (r.ok ? r.json() : null)),
                        fetch(`https://api.npmjs.org/downloads/point/last-week/${p.name}`).then(
                            (r) => (r.ok ? r.json() : null),
                        ),
                    ]);
                    out[key] = {
                        registry: "npm",
                        name: p.name,
                        version: (meta as { version?: string } | null)?.version ?? null,
                        weeklyDownloads: (dl as { downloads?: number } | null)?.downloads ?? null,
                        url: `https://www.npmjs.com/package/${p.name}`,
                    };
                } else if (p.registry === "pypi") {
                    const meta = (await fetch(`https://pypi.org/pypi/${p.name}/json`).then((r) =>
                        r.ok ? r.json() : null,
                    )) as { info?: { version?: string } } | null;
                    out[key] = {
                        registry: "pypi",
                        name: p.name,
                        version: meta?.info?.version ?? null,
                        weeklyDownloads: null,
                        url: `https://pypi.org/project/${p.name}/`,
                    };
                }
            } catch {
                /* offline / rate-limited: leave undefined, UI falls back */
            }
        }),
    );
    return out;
}

export interface GitHubActivity {
    totalContributions: number;
    weeks: { days: { date: string; count: number; level: number }[] }[];
}

/** Contribution calendar for the last year (needs token). */
export async function fetchActivity(login: string): Promise<GitHubActivity | null> {
    "use cache";
    cacheLife("days");
    cacheTag("github");

    const t = token();
    if (!t) return null;
    const query = `query($login:String!){ user(login:$login){ contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }`;
    try {
        const res = await fetch(GQL, {
            method: "POST",
            headers: { "content-type": "application/json", authorization: `bearer ${t}` },
            body: JSON.stringify({ query, variables: { login } }),
        });
        if (!res.ok) return null;
        const json = (await res.json()) as {
            data?: {
                user?: {
                    contributionsCollection: {
                        contributionCalendar: {
                            totalContributions: number;
                            weeks: {
                                contributionDays: {
                                    date: string;
                                    contributionCount: number;
                                    contributionLevel: string;
                                }[];
                            }[];
                        };
                    };
                };
            };
        };
        const cal = json.data?.user?.contributionsCollection.contributionCalendar;
        if (!cal) return null;
        const levelMap: Record<string, number> = {
            NONE: 0,
            FIRST_QUARTILE: 1,
            SECOND_QUARTILE: 2,
            THIRD_QUARTILE: 3,
            FOURTH_QUARTILE: 4,
        };
        return {
            totalContributions: cal.totalContributions,
            weeks: cal.weeks.map((w) => ({
                days: w.contributionDays.map((d) => ({
                    date: d.date,
                    count: d.contributionCount,
                    level: levelMap[d.contributionLevel] ?? 0,
                })),
            })),
        };
    } catch {
        return null;
    }
}
