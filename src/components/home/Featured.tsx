import { ViewTransition } from "react";
import { GitFork, Star, Tag } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge, Section, type BadgeVariant } from "@/components/ui";
import { featuredProjects } from "@/data/projects";
import type { Project, RepoStats } from "@/data/types";
import { Link } from "@/i18n/navigation";
import { fetchRepoStats } from "@/lib/github";

const STATUS_VARIANT: Record<Project["status"], BadgeVariant> = {
    live: "success",
    launching: "accent",
    active: "accent",
    research: "warning",
    maintenance: "outline",
    "case-study": "muted",
    archived: "muted",
};

function sumStats(project: Project, stats: Record<string, RepoStats>) {
    let stars = 0;
    let forks = 0;
    let releases = 0;
    let any = false;
    for (const r of project.repos ?? []) {
        const s = stats[`${r.owner}/${r.name}`];
        if (!s) continue;
        any = true;
        stars += s.stars;
        forks += s.forks;
        releases += s.releaseCount;
    }
    return any ? { stars, forks, releases } : null;
}

export async function Featured() {
    const locale = (await getLocale()) as "en" | "ro";
    const t = await getTranslations("featured");
    const tp = await getTranslations("projects");
    const stats = await fetchRepoStats(featuredProjects.flatMap((p) => p.repos ?? []));

    return (
        <Section id="featured" eyebrow={t("eyebrow")} title={t("title")}>
            <div className="grid gap-6 lg:grid-cols-2">
                {featuredProjects.slice(0, 2).map((p) => {
                    const hue = p.hue ?? 300;
                    const s = sumStats(p, stats);
                    return (
                        <Link
                            key={p.slug}
                            href={`/projects/${p.slug}`}
                            aria-label={t("explore", { name: p.name })}
                            className="surface gradient-border rounded-card group flex flex-col overflow-hidden no-underline transition-shadow hover:shadow-card"
                        >
                            <ViewTransition name={`project-cover-${p.slug}`}>
                                <div
                                    aria-hidden="true"
                                    className="relative aspect-[16/9] overflow-hidden"
                                    style={{
                                        background: `radial-gradient(120% 80% at 30% 20%, oklch(0.6 0.18 ${hue} / 0.55), transparent 60%), linear-gradient(135deg, oklch(0.25 0.06 ${hue}), oklch(0.15 0.03 ${hue}))`,
                                    }}
                                >
                                    <span className="absolute -right-4 -bottom-6 font-mono text-[clamp(4rem,14vw,9rem)] leading-none font-bold tracking-tighter text-accent-fg/15 select-none transition-transform duration-700 ease-out-expo group-hover:-translate-x-3 group-hover:-translate-y-2">
                                        {p.name}
                                    </span>
                                </div>
                            </ViewTransition>
                            <div className="flex flex-1 flex-col gap-4 p-6">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h3 className="text-2xl font-bold tracking-tight text-fg">
                                        {p.name}
                                    </h3>
                                    <Badge variant={STATUS_VARIANT[p.status]} dot>
                                        {tp(`status.${p.status}`)}
                                    </Badge>
                                </div>
                                <p className="text-fg-muted text-pretty">{p.tagline[locale]}</p>
                                <ul className="flex flex-wrap gap-1.5" aria-label={tp("stack")}>
                                    {p.stack.slice(0, 6).map((s) => (
                                        <li
                                            key={s}
                                            className="rounded-pill border border-line bg-surface-raised px-2 py-0.5 font-mono text-[11px] text-fg-muted"
                                        >
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                                {s ? (
                                    <dl className="mt-auto flex flex-wrap gap-5 pt-2 font-mono text-xs text-fg-subtle">
                                        <div className="flex items-center gap-1.5">
                                            <Star className="size-3.5" aria-hidden="true" />
                                            <dt className="sr-only">
                                                {tp("stars", { count: s.stars })}
                                            </dt>
                                            <dd>{s.stars.toLocaleString(locale)}</dd>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <GitFork className="size-3.5" aria-hidden="true" />
                                            <dt className="sr-only">
                                                {tp("forks", { count: s.forks })}
                                            </dt>
                                            <dd>{s.forks.toLocaleString(locale)}</dd>
                                        </div>
                                        {s.releases > 0 ? (
                                            <div className="flex items-center gap-1.5">
                                                <Tag className="size-3.5" aria-hidden="true" />
                                                <dt className="sr-only">{tp("latestRelease")}</dt>
                                                <dd>{tp("releases", { count: s.releases })}</dd>
                                            </div>
                                        ) : null}
                                    </dl>
                                ) : null}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </Section>
    );
}
