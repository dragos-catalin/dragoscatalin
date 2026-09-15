import Image from "next/image";
import { ViewTransition } from "react";
import { useTranslations } from "next-intl";
import { Star, Tag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui";
import type { Project, RepoStats } from "@/data/types";
import { coverGradient, coverTransitionName } from "./cover";
import { CoverArt } from "./CoverArt";
import { shotSrc } from "@/lib/shots";
import { statusVariant } from "./status";

export interface ProjectCardProps {
    project: Project;
    stats?: RepoStats;
    locale: string;
    index?: number;
    priority?: boolean;
}

const MAX_CHIPS = 5;

function localized(text: { en: string; ro: string }, locale: string): string {
    return locale === "ro" ? text.ro : text.en;
}

export function ProjectCard({ project, stats, locale, priority = false }: ProjectCardProps) {
    const t = useTranslations("projects");
    const chips = project.stack.slice(0, MAX_CHIPS);
    const extra = project.stack.length - chips.length;
    const shot = shotSrc(project.slug, "desktop-dark");
    const coverSrc = project.cover ?? shot;
    const years = project.years.to
        ? t("years", { from: project.years.from, to: project.years.to })
        : t("yearsNow", { from: project.years.from });

    return (
        <Link
            href={`/projects/${project.slug}`}
            className="group rounded-card surface gradient-border flex h-full flex-col overflow-hidden shadow-elev-2 transition-[transform,box-shadow] duration-300 hover:shadow-elev-3 focus-visible:outline motion-safe:hover:-translate-y-1"
        >
            <ViewTransition name={coverTransitionName(project.slug)}>
                <div
                    className="relative aspect-[16/10] overflow-hidden"
                    style={{ background: coverGradient(project.hue) }}
                >
                    {coverSrc ? (
                        <Image
                            src={coverSrc}
                            alt=""
                            fill
                            priority={priority}
                            sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                        />
                    ) : (
                        <CoverArt project={project} className="absolute inset-0 size-full" />
                    )}
                    {coverSrc ? (
                        <span
                            aria-hidden
                            className="pointer-events-none absolute -right-2 bottom-1 select-none font-mono text-[clamp(2.5rem,8vw,4rem)] font-bold leading-none tracking-tight text-fg opacity-[0.08]"
                        >
                            {project.name}
                        </span>
                    ) : null}
                </div>
            </ViewTransition>

            <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant[project.status]} dot={project.status === "live"}>
                        {t(`status.${project.status}`)}
                    </Badge>
                    {project.visibility === "private" ? (
                        <Badge variant="outline">{t("private")}</Badge>
                    ) : null}
                </div>

                <h2 className="text-lg font-semibold tracking-tight text-fg group-hover:text-accent">
                    {project.name}
                </h2>
                <p className="line-clamp-2 text-sm text-fg-muted">
                    {localized(project.tagline, locale)}
                </p>

                <ul className="mt-auto flex flex-wrap gap-1.5 pt-1" aria-label={t("stack")}>
                    {chips.map((s) => (
                        <li
                            key={s}
                            className="rounded-pill border border-line bg-surface-raised px-2 py-0.5 font-mono text-[11px] text-fg-muted"
                        >
                            {s}
                        </li>
                    ))}
                    {extra > 0 ? (
                        <li className="rounded-pill border border-line px-2 py-0.5 font-mono text-[11px] text-fg-subtle">
                            {t("more", { count: extra })}
                        </li>
                    ) : null}
                </ul>

                <div className="flex items-center justify-between gap-3 border-t border-line pt-3 font-mono text-xs text-fg-subtle">
                    <span>{years}</span>
                    {stats ? (
                        <span className="flex items-center gap-3">
                            <span
                                className="flex items-center gap-1"
                                aria-label={t("stars", { count: stats.stars })}
                            >
                                <Star className="size-3.5" aria-hidden />
                                {stats.stars}
                            </span>
                            {stats.releaseCount > 0 ? (
                                <span
                                    className="flex items-center gap-1"
                                    aria-label={t("releases", { count: stats.releaseCount })}
                                >
                                    <Tag className="size-3.5" aria-hidden />
                                    {stats.releaseCount}
                                </span>
                            ) : null}
                        </span>
                    ) : null}
                </div>
            </div>
        </Link>
    );
}
