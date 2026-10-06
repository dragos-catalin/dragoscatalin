import { Suspense, ViewTransition } from "react";
import { ArrowUpRight, GitFork, Star, Tag } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge, Section, type BadgeVariant } from "@/components/ui";
import { coverGradient } from "@/components/projects/cover";
import { featuredProjects } from "@/data/projects";
import type { Project, RepoStats } from "@/data/types";
import { Link } from "@/i18n/navigation";
import { fetchRepoStats } from "@/lib/github";
import { cn } from "@/lib/utils";

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

/** Streams in after the card shell: the GitHub round-trip never blocks LCP. */
async function FeaturedStats({ project, locale }: { project: Project; locale: "en" | "ro" }) {
    const tp = await getTranslations("projects");
    const stats = await fetchRepoStats(project.repos ?? []);
    const s = sumStats(project, stats);
    if (!s) return null;
    return (
        <dl className="mt-auto flex flex-wrap gap-5 pt-2 font-mono text-xs text-fg-subtle">
            <div className="flex items-center gap-1.5">
                <Star className="size-3.5" aria-hidden="true" />
                <dt className="sr-only">{tp("stars", { count: s.stars })}</dt>
                <dd>{s.stars.toLocaleString(locale)}</dd>
            </div>
            <div className="flex items-center gap-1.5">
                <GitFork className="size-3.5" aria-hidden="true" />
                <dt className="sr-only">{tp("forks", { count: s.forks })}</dt>
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
    );
}

export async function Featured() {
    const locale = (await getLocale()) as "en" | "ro";
    const t = await getTranslations("featured");
    const tp = await getTranslations("projects");

    return (
        <Section id="featured" eyebrow={t("eyebrow")} title={t("title")}>
            <div className="grid gap-5 lg:grid-cols-5">
                {featuredProjects.slice(0, 2).map((p, i) => {
                    const surfaces = p.surfaces ?? [];
                    return (
                        <Link
                            key={p.slug}
                            href={`/projects/${p.slug}`}
                            aria-label={t("explore", { name: p.name })}
                            className={cn(
                                "surface gradient-border rounded-card group flex flex-col overflow-hidden no-underline shadow-elev-2 transition-[transform,box-shadow] duration-300 hover:shadow-elev-3 motion-safe:hover:-translate-y-1",
                                i === 0 ? "lg:col-span-3" : "lg:col-span-2",
                            )}
                        >
                            <ViewTransition name={`project-cover-${p.slug}`}>
                                <div
                                    aria-hidden="true"
                                    className="relative h-56 overflow-hidden md:h-64"
                                    style={{ background: coverGradient(p.hue) }}
                                >
                                    <span className="cover-grid absolute inset-0" />
                                    <ul className="absolute inset-x-5 bottom-5 flex flex-wrap gap-2 md:inset-x-6 md:bottom-6">
                                        {surfaces.slice(0, i === 0 ? 7 : 5).map((s) => (
                                            <li
                                                key={s.label}
                                                className="rounded-pill border border-line bg-bg/80 px-3 py-1 font-mono text-[11px] text-fg backdrop-blur-sm transition-transform duration-500 ease-out-expo motion-safe:group-hover:-translate-y-0.5"
                                            >
                                                {s.label}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </ViewTransition>
                            <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h3 className="flex items-center gap-2 font-display text-3xl font-bold tracking-[-0.02em] text-fg">
                                        {p.name}
                                        <ArrowUpRight
                                            className="size-5 text-fg-subtle transition-[color,transform] duration-300 group-hover:text-accent motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                                            aria-hidden="true"
                                        />
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
                                <Suspense
                                    fallback={<div className="mt-auto h-4" aria-hidden="true" />}
                                >
                                    <FeaturedStats project={p} locale={locale} />
                                </Suspense>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </Section>
    );
}
