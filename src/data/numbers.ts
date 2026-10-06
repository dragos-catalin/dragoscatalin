import measuredData from "./measured.json";
import { horae } from "./horae";
import { allPackages, projects } from "./projects";
import type { Platform, Project } from "./types";

/**
 * Real numbers for the bio, hero and About page (V3-11). Nothing here is typed in by hand:
 *
 * - Registry numbers are computed at build time from src/data/projects.ts (+ horae.json).
 * - Machine numbers (languages, commits) come from src/data/measured.json, written by
 *   `pnpm measure:repos` (scripts/measure-repos.mjs) over the owner's repos under E:\gh;
 *   `measured.measuredAt` and `measured.method` say when and how.
 * - Career years are from the owner profile (V3-34, 2026-10-05): coding since ~age 10, first paid
 *   work at 15, first legal job at 18 → "20+ years of code, 15+ paid". Stated as floors, not
 *   computed, because the start dates are the owner's answer and not in any repo.
 */

export interface MeasuredLanguage {
    name: string;
    lines: number;
    /** percent of measured lines, one decimal */
    share: number;
}

export interface Measured {
    measuredAt: string;
    method: string;
    year: number;
    repos: number;
    commits: { total: number; reposWithCommits: number };
    languages: MeasuredLanguage[];
    alsoWorkedWith: { name: string; repos: number }[];
}

export const measured: Measured = measuredData;

/** Statuses that mean "someone can use it today". */
const SHIPPED: ReadonlySet<Project["status"]> = new Set(["live", "maintenance", "launching"]);

export function shippedProjects(list: readonly Project[] = projects): Project[] {
    return list.filter((p) => SHIPPED.has(p.status));
}

/** Distinct platforms across the registry (web, Android, Wear OS, Windows…). */
export function platformsCovered(list: readonly Project[] = projects): Platform[] {
    return [...new Set(list.flatMap((p) => p.platforms ?? []))];
}

/** Store listings: project store links on app stores/marketplaces + individually listed items. */
export function storeListingCount(list: readonly Project[] = projects): number {
    const appStores = new Set(["play", "ms-store", "app-store", "vscode-marketplace", "open-vsx"]);
    const links = list.flatMap((p) =>
        (p.stores ?? []).filter((s) => appStores.has(s.store) && !s.url.includes("/developer?")),
    ).length;
    const items = list.flatMap((p) => p.listings ?? []).length;
    return links + items;
}

export const CAREER = { codeYears: 20, paidYears: 15 } as const;

export interface HeadlineNumber {
    key: "projects" | "shipped" | "platforms" | "stores" | "packages" | "commits";
    value: number;
}

export function headlineNumbers(list: readonly Project[] = projects): HeadlineNumber[] {
    return [
        { key: "projects", value: list.length },
        { key: "shipped", value: shippedProjects(list).length },
        { key: "platforms", value: platformsCovered(list).length },
        { key: "stores", value: storeListingCount(list) },
        { key: "packages", value: allPackages.length },
        { key: "commits", value: measured.commits.total },
    ];
}

/** Horae: faces live on Google Play (from horae.json, synced from the watch-faces repo). */
export const horaeLive = horae.live;
