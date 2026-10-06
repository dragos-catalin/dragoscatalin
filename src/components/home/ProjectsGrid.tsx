import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ButtonLink, Section } from "@/components/ui";
import { projects } from "@/data/projects";
import type { Project, ProjectStatus, RepoStats } from "@/data/types";
import { fetchRepoStats } from "@/lib/github";

const SHOWN: ReadonlySet<ProjectStatus> = new Set<ProjectStatus>([
    "live",
    "launching",
    "active",
    "research",
    "maintenance",
    "case-study",
]);

function shownProjects(): Project[] {
    return projects.filter((p) => !p.featured && SHOWN.has(p.status)).slice(0, 6);
}

function Grid({
    shown,
    stats,
    locale,
}: {
    shown: Project[];
    stats: Record<string, RepoStats>;
    locale: string;
}) {
    return (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p, i) => {
                const first = p.repos?.[0];
                const s = first ? stats[`${first.owner}/${first.name}`] : undefined;
                return (
                    <li key={p.slug} className="flex min-w-0">
                        <ProjectCard project={p} stats={s} locale={locale} index={i} />
                    </li>
                );
            })}
        </ul>
    );
}

/** Streams in with live GitHub numbers; the static grid below is the LCP-safe fallback. */
async function GridWithStats({ shown, locale }: { shown: Project[]; locale: string }) {
    const stats = await fetchRepoStats(shown.flatMap((p) => p.repos ?? []));
    return <Grid shown={shown} stats={stats} locale={locale} />;
}

export async function ProjectsGrid() {
    const locale = await getLocale();
    const t = await getTranslations("projects");
    const shown = shownProjects();

    return (
        <Section
            id="projects"
            eyebrow={t("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle", { count: projects.length })}
            action={
                <ButtonLink href="/projects" variant="secondary">
                    {t("viewAll")}
                </ButtonLink>
            }
        >
            <Suspense fallback={<Grid shown={shown} stats={{}} locale={locale} />}>
                <GridWithStats shown={shown} locale={locale} />
            </Suspense>
        </Section>
    );
}
