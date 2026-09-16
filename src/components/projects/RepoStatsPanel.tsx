import { getLocale, getTranslations } from "next-intl/server";
import { GitFork, Scale, Star, Tag } from "lucide-react";
import type { RepoRef, RepoStats } from "@/data/types";
import { fetchRepoStats } from "@/lib/github";

export interface RepoStatsPanelProps {
    repos: RepoRef[];
}

function LanguageBar({ languages }: { languages: RepoStats["languages"] }) {
    if (languages.length === 0) return null;
    return (
        <div className="flex flex-col gap-1.5">
            <div
                className="flex h-1.5 w-full overflow-hidden rounded-pill bg-surface-raised"
                aria-hidden
            >
                {languages.map((l) => (
                    <span
                        key={l.name}
                        style={{ width: `${l.percent}%`, background: l.color ?? "var(--accent)" }}
                    />
                ))}
            </div>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-fg-subtle">
                {languages.map((l) => (
                    <li key={l.name} className="flex items-center gap-1">
                        <span
                            className="size-2 rounded-full"
                            style={{ background: l.color ?? "var(--accent)" }}
                            aria-hidden
                        />
                        {l.name} {l.percent}%
                    </li>
                ))}
            </ul>
        </div>
    );
}

export async function RepoStatsPanel({ repos }: RepoStatsPanelProps) {
    if (repos.length === 0) return null;
    const [locale, t, stats] = await Promise.all([
        getLocale(),
        getTranslations("projects"),
        fetchRepoStats(repos),
    ]);
    const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    const hasAny = Object.keys(stats).length > 0;

    return (
        <ul className="flex flex-col gap-4">
            {repos.map((r) => {
                const full = `${r.owner}/${r.name}`;
                const s = stats[full];
                return (
                    <li
                        key={full}
                        className="flex flex-col gap-3 border-t border-line pt-4 first:border-t-0 first:pt-0"
                    >
                        <a
                            href={s?.url ?? `https://github.com/${full}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-inline font-mono text-sm font-medium text-fg hover:text-accent"
                        >
                            {r.label ?? full}
                        </a>
                        {s ? (
                            <>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-fg-muted">
                                    <span
                                        className="flex items-center gap-1"
                                        aria-label={t("stars", { count: s.stars })}
                                    >
                                        <Star className="size-3.5" aria-hidden />
                                        {s.stars}
                                    </span>
                                    <span
                                        className="flex items-center gap-1"
                                        aria-label={t("forks", { count: s.forks })}
                                    >
                                        <GitFork className="size-3.5" aria-hidden />
                                        {s.forks}
                                    </span>
                                    {s.license ? (
                                        <span
                                            className="flex items-center gap-1"
                                            aria-label={t("license")}
                                        >
                                            <Scale className="size-3.5" aria-hidden />
                                            {s.license}
                                        </span>
                                    ) : null}
                                </div>
                                <LanguageBar languages={s.languages} />
                                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                                    {s.latestRelease ? (
                                        <>
                                            <dt className="text-fg-subtle">{t("latestRelease")}</dt>
                                            <dd className="font-mono text-fg">
                                                <a
                                                    href={s.latestRelease.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 hover:text-accent"
                                                >
                                                    <Tag className="size-3" aria-hidden />
                                                    {s.latestRelease.tag}
                                                </a>
                                                <span className="text-fg-subtle">
                                                    {" "}
                                                    ·{" "}
                                                    {fmt.format(
                                                        new Date(s.latestRelease.publishedAt),
                                                    )}
                                                </span>
                                            </dd>
                                        </>
                                    ) : null}
                                    <dt className="text-fg-subtle">{t("lastPush")}</dt>
                                    <dd className="font-mono text-fg">
                                        {fmt.format(new Date(s.pushedAt))}
                                    </dd>
                                </dl>
                            </>
                        ) : null}
                    </li>
                );
            })}
            {!hasAny ? <li className="text-xs text-fg-subtle">{t("noStats")}</li> : null}
        </ul>
    );
}
