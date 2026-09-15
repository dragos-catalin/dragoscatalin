"use client";

import { parseAsArrayOf, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import type { ProjectCategory, ProjectStatus } from "@/data/types";

export const STATUSES = [
    "live",
    "launching",
    "active",
    "research",
    "maintenance",
    "case-study",
    "archived",
] as const satisfies readonly ProjectStatus[];
export const CATEGORIES = [
    "product",
    "platform",
    "tool",
    "library",
    "research",
    "hobby",
    "client",
] as const satisfies readonly ProjectCategory[];

export const projectFilterParsers = {
    q: parseAsString.withDefault(""),
    status: parseAsArrayOf(parseAsStringEnum<ProjectStatus>([...STATUSES])).withDefault([]),
    category: parseAsArrayOf(parseAsStringEnum<ProjectCategory>([...CATEGORIES])).withDefault([]),
    stack: parseAsArrayOf(parseAsString).withDefault([]),
};

export function useProjectFilters() {
    const [filters, setFilters] = useQueryStates(projectFilterParsers, { clearOnDefault: true });
    const isActive =
        filters.q !== "" ||
        filters.status.length > 0 ||
        filters.category.length > 0 ||
        filters.stack.length > 0;
    return { filters, setFilters, isActive } as const;
}

export type ProjectFilters = ReturnType<typeof useProjectFilters>["filters"];
