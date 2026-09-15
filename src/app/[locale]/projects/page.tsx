import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui";
import { ProjectGridSkeleton } from "@/components/projects/ProjectGridSkeleton";
import { ProjectList } from "@/components/projects/ProjectList";
import { allRepos, projects } from "@/data/projects";
import { fetchRepoStats } from "@/lib/github";
import { localeAlternates } from "@/lib/seo";

const TOP_STACK = 12;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "projects" });
    return {
        title: t("title"),
        description: t("subtitle", { count: projects.length }),
        alternates: localeAlternates(locale, "/projects"),
    };
}

function topStack(): string[] {
    const freq = new Map<string, number>();
    for (const p of projects) for (const s of p.stack) freq.set(s, (freq.get(s) ?? 0) + 1);
    return [...freq.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, TOP_STACK)
        .map(([s]) => s);
}

async function ProjectsWithStats({ locale }: { locale: string }) {
    const stats = await fetchRepoStats(allRepos);
    const items = projects.map((project) => {
        const first = project.repos?.[0];
        return { project, stats: first ? stats[`${first.owner}/${first.name}`] : undefined };
    });
    return <ProjectList items={items} locale={locale} stackOptions={topStack()} />;
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: paramLocale } = await params;
    setRequestLocale(paramLocale);
    const locale = await getLocale();
    const t = await getTranslations("projects");

    return (
        <Section
            eyebrow={t("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle", { count: projects.length })}
            as="h1"
        >
            <Suspense fallback={<ProjectGridSkeleton />}>
                <ProjectsWithStats locale={locale} />
            </Suspense>
        </Section>
    );
}
