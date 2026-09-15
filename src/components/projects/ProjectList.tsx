"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import type { Project, RepoStats } from "@/data/types";
import { baseTransition } from "@/lib/motion";
import { ProjectCard } from "./ProjectCard";
import { ProjectFilters } from "./ProjectFilters";
import { useProjectFilters } from "./useProjectFilters";

export interface ProjectListItem {
    project: Project;
    stats?: RepoStats;
}

export interface ProjectListProps {
    items: ProjectListItem[];
    locale: string;
    stackOptions: string[];
}

function matches(project: Project, locale: string, q: string): boolean {
    if (!q) return true;
    const hay = [
        project.name,
        project.slug,
        project.tagline.en,
        project.tagline.ro,
        ...project.stack,
    ]
        .join(" ")
        .toLowerCase();
    void locale;
    return hay.includes(q);
}

export function ProjectList({ items, locale, stackOptions }: ProjectListProps) {
    const t = useTranslations("projects");
    const { filters } = useProjectFilters();

    const visible = useMemo(() => {
        const q = filters.q.trim().toLowerCase();
        return items.filter(({ project }) => {
            if (filters.status.length > 0 && !filters.status.includes(project.status)) return false;
            if (filters.category.length > 0 && !filters.category.includes(project.category))
                return false;
            if (filters.stack.length > 0 && !filters.stack.some((s) => project.stack.includes(s)))
                return false;
            return matches(project, locale, q);
        });
    }, [items, filters, locale]);

    return (
        <div className="flex flex-col gap-8">
            <ProjectFilters stackOptions={stackOptions} count={visible.length} />

            {visible.length === 0 ? (
                <p className="rounded-card surface p-10 text-center text-fg-muted">
                    {t("filters.results", { count: 0 })}
                </p>
            ) : (
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {visible.map(({ project, stats }, i) => (
                            <motion.li
                                key={project.slug}
                                layout
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ ...baseTransition, duration: 0.35 }}
                                className="h-full"
                            >
                                <ProjectCard
                                    project={project}
                                    stats={stats}
                                    locale={locale}
                                    index={i}
                                    priority={i < 4}
                                />
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            )}
        </div>
    );
}
