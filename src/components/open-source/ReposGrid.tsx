import { getTranslations } from "next-intl/server";
import { ArrowUpRight, GitFork, Scale, Star, Tag } from "lucide-react";
import { projects } from "@/data/projects";
import type { Project, RepoRef, RepoStats } from "@/data/types";
import { fetchRepoStats } from "@/lib/github";

interface RepoRow {
    ref: RepoRef;
    key: string;
    project: Project;
    stats: RepoStats | undefined;
}

export async function ReposGrid({ locale }: { locale: string }) {
    const t = await getTranslations({ locale, namespace: "openSource" });
    const tp = await getTranslations({ locale, namespace: "projects" });

    const seen = new Set<string>();
    const refs: { ref: RepoRef; project: Project }[] = [];
    for (const project of projects) {
        if (project.visibility !== "public") continue;
        for (const ref of project.repos ?? []) {
            const key = `${ref.owner}/${ref.name}`;
            if (seen.has(key)) continue;
            seen.add(key);
            refs.push({ ref, project });
        }
    }

    const stats = await fetchRepoStats(refs.map((r) => r.ref));
    const rows: RepoRow[] = refs
        .map(({ ref, project }) => {
            const key = `${ref.owner}/${ref.name}`;
            return { ref, key, project, stats: stats[key] };
        })
        .sort((a, b) => (b.stats?.pushedAt ?? "").localeCompare(a.stats?.pushedAt ?? ""));

    const numberFmt = new Intl.NumberFormat(locale, { notation: "compact" });
    const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

    return (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ ref, key, project, stats: s }) => {
                const url = s?.url ?? `https://github.com/${key}`;
                const description =
                    s?.description ?? (locale === "ro" ? project.tagline.ro : project.tagline.en);
                return (
                    <li
                        key={key}
                        className="surface rounded-card gradient-border flex flex-col gap-4 p-5"
                    >
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-inline gap-1 font-mono text-sm font-medium text-fg hover:text-accent"
                        >
                            <span className="break-all">{key}</span>
                            <ArrowUpRight
                                className="mt-0.5 size-3.5 shrink-0 text-fg-subtle"
                                aria-hidden
                            />
                        </a>
                        <p className="flex-1 text-sm leading-relaxed text-fg-muted">
                            {description}
                        </p>

                        {s ? (
                            <>
                                <dl className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-fg-muted">
                                    <div className="inline-flex items-center gap-1">
                                        <dt className="sr-only">{t("stars")}</dt>
                                        <Star className="size-3.5" aria-hidden />
                                        <dd>{numberFmt.format(s.stars)}</dd>
                                    </div>
                                    <div className="inline-flex items-center gap-1">
                                        <dt className="sr-only">{t("forks")}</dt>
                                        <GitFork className="size-3.5" aria-hidden />
                                        <dd>{numberFmt.format(s.forks)}</dd>
                                    </div>
                                    {s.license ? (
                                        <div className="inline-flex items-center gap-1">
                                            <dt className="sr-only">{t("license")}</dt>
                                            <Scale className="size-3.5" aria-hidden />
                                            <dd>{s.license}</dd>
                                        </div>
                                    ) : null}
                                    {s.latestRelease ? (
                                        <div className="inline-flex items-center gap-1">
                                            <dt className="sr-only">{tp("latestRelease")}</dt>
                                            <Tag className="size-3.5" aria-hidden />
                                            <dd>
                                                <a
                                                    href={s.latestRelease.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="link-inline hover:text-accent"
                                                >
                                                    {s.latestRelease.tag}
                                                </a>
                                            </dd>
                                        </div>
                                    ) : null}
                                </dl>
                                {s.languages.length > 0 ? (
                                    <div>
                                        <div
                                            role="img"
                                            aria-label={`${t("languagesLabel")}: ${s.languages.map((l) => `${l.name} ${l.percent}%`).join(", ")}`}
                                            className="flex h-1.5 w-full overflow-hidden rounded-pill bg-surface-raised"
                                        >
                                            {s.languages.map((l) => (
                                                <span
                                                    key={l.name}
                                                    className="block h-full"
                                                    style={{
                                                        width: `${l.percent}%`,
                                                        background: l.color ?? "var(--accent)",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-fg-subtle">
                                            {s.languages.map((l) => (
                                                <li
                                                    key={l.name}
                                                    className="inline-flex items-center gap-1"
                                                >
                                                    <span
                                                        className="size-2 rounded-full"
                                                        style={{
                                                            background: l.color ?? "var(--accent)",
                                                        }}
                                                        aria-hidden
                                                    />
                                                    {l.name} {l.percent}%
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}
                                <time
                                    dateTime={s.pushedAt}
                                    className="font-mono text-[11px] text-fg-subtle"
                                >
                                    {tp("lastPush")}: {dateFmt.format(new Date(s.pushedAt))}
                                </time>
                            </>
                        ) : (
                            <p className="font-mono text-xs text-fg-subtle">{t("noStats")}</p>
                        )}
                        <span className="sr-only">{ref.label ?? project.name}</span>
                    </li>
                );
            })}
        </ul>
    );
}
