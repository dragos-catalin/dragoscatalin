import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { Heatmap } from "@/components/now/Heatmap";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Section } from "@/components/ui";
import { allRepos, projects } from "@/data/projects";
import type { RepoStats } from "@/data/types";
import { fetchActivity, fetchRepoStats } from "@/lib/github";
import { localeAlternates } from "@/lib/seo";
import { site } from "@/lib/site";

// Build-time constant so the page stays statically prerenderable.
const BUILT_AT = new Date();

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "now" });
    return {
        title: t("title"),
        description: t("focus"),
        alternates: localeAlternates(locale, "/now"),
    };
}

function primaryStats(
    stats: Record<string, RepoStats>,
    repos: { owner: string; name: string }[] | undefined,
): RepoStats | undefined {
    for (const r of repos ?? []) {
        const s = stats[`${r.owner}/${r.name}`];
        if (s) return s;
    }
    return undefined;
}

export default async function NowPage({ params }: { params: Params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "now" });
    const [stats, activity] = await Promise.all([
        fetchRepoStats(allRepos),
        fetchActivity(site.handle),
    ]);

    const shipping = projects.filter(
        (p) =>
            p.status === "launching" ||
            p.status === "active" ||
            (p.featured && p.status === "live"),
    );

    const releases = Object.values(stats)
        .flatMap((s) =>
            s.latestRelease ? [{ repo: `${s.owner}/${s.name}`, ...s.latestRelease }] : [],
        )
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, 10);

    const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    const builtAt = new Intl.DateTimeFormat(locale, {
        dateStyle: "long",
        timeStyle: "short",
    }).format(BUILT_AT);

    return (
        <>
            <Section eyebrow={t("eyebrow")} title={t("title")} as="h1">
                <p className="max-w-3xl text-balance text-2xl leading-snug font-medium text-fg md:text-3xl">
                    {t("focus")}
                </p>
            </Section>

            <Section title={t("shipping")}>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {shipping.map((p) => (
                        <li key={p.slug}>
                            <ProjectCard
                                project={p}
                                stats={primaryStats(stats, p.repos)}
                                locale={locale}
                            />
                        </li>
                    ))}
                </ul>
            </Section>

            <Section title={t("activity")}>
                {activity ? (
                    <Heatmap activity={activity} locale={locale} />
                ) : (
                    <p className="text-fg-muted">{t("noActivity")}</p>
                )}
            </Section>

            <Section title={t("releases")}>
                {releases.length === 0 ? (
                    <p className="text-fg-muted">{t("noReleases")}</p>
                ) : (
                    <ol className="surface rounded-card divide-y divide-line overflow-hidden">
                        {releases.map((r) => (
                            <li
                                key={r.url}
                                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm"
                            >
                                <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-6 items-center gap-1 font-mono text-fg hover:text-accent"
                                >
                                    {r.repo}
                                    <ExternalLink className="size-3.5 text-fg-subtle" aria-hidden />
                                </a>
                                <span className="rounded-pill bg-accent-soft px-2 py-0.5 font-mono text-xs text-accent">
                                    {r.tag}
                                </span>
                                {r.name && r.name !== r.tag ? (
                                    <span className="truncate text-fg-muted">{r.name}</span>
                                ) : null}
                                <time
                                    dateTime={r.publishedAt}
                                    className="ml-auto font-mono text-xs text-fg-subtle"
                                >
                                    {dateFmt.format(new Date(r.publishedAt))}
                                </time>
                            </li>
                        ))}
                    </ol>
                )}
                <p className="mt-8 font-mono text-xs text-fg-subtle">
                    {t("lastActive")} · {t("updated", { date: builtAt })}
                </p>
            </Section>
        </>
    );
}
