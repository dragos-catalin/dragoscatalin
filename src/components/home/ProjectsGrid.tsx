import { getLocale, getTranslations } from "next-intl/server";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ButtonLink, Section } from "@/components/ui";
import { projects } from "@/data/projects";
import type { ProjectStatus } from "@/data/types";
import { fetchRepoStats } from "@/lib/github";

const SHOWN: ReadonlySet<ProjectStatus> = new Set<ProjectStatus>([
    "live",
    "launching",
    "active",
    "research",
    "maintenance",
    "case-study",
]);

export async function ProjectsGrid() {
    const locale = await getLocale();
    const t = await getTranslations("projects");
    const shown = projects.filter((p) => !p.featured && SHOWN.has(p.status)).slice(0, 9);
    const stats = await fetchRepoStats(shown.flatMap((p) => p.repos ?? []));

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
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {shown.map((p, i) => {
                    const first = p.repos?.[0];
                    const s = first ? stats[`${first.owner}/${first.name}`] : undefined;
                    return (
                        <li key={p.slug} className="flex">
                            <ProjectCard project={p} stats={s} locale={locale} index={i} />
                        </li>
                    );
                })}
            </ul>
        </Section>
    );
}
