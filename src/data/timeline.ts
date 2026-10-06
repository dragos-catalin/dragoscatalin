import { archiveTimeline, projects } from "./projects";
import type { Project } from "./types";

type Locale = "en" | "ro";
type ArchiveEntry = (typeof archiveTimeline)[number];

export interface TimelineEntry {
    key: string;
    name: string;
    note?: string;
    slug?: string;
}

export interface TimelineYear {
    year: number;
    entries: TimelineEntry[];
}

/** First and last year present in the registry (`years.from`/`years.to`) and the archive. */
export function timelineRange(
    list: readonly Project[] = projects,
    archive: readonly ArchiveEntry[] = archiveTimeline,
): { first: number; last: number } {
    const years = [
        ...list.flatMap((p) => (p.years.to ? [p.years.from, p.years.to] : [p.years.from])),
        ...archive.map((a) => a.year),
    ];
    return { first: Math.min(...years), last: Math.max(...years) };
}

/** Years newest first; a project sits on the year it started. Empty years are skipped. */
export function buildTimeline(
    locale: Locale,
    list: readonly Project[] = projects,
    archive: readonly ArchiveEntry[] = archiveTimeline,
): TimelineYear[] {
    const { first, last } = timelineRange(list, archive);
    const out: TimelineYear[] = [];
    for (let year = last; year >= first; year--) {
        const entries: TimelineEntry[] = [
            ...list
                .filter((p) => p.years.from === year)
                .map((p) => ({
                    key: `p-${p.slug}`,
                    name: p.name,
                    note: p.tagline[locale],
                    slug: p.slug,
                })),
            ...archive
                .filter((a) => a.year === year)
                .map((a) => ({ key: `a-${year}-${a.name}`, name: a.name, note: a.note[locale] })),
        ];
        if (entries.length > 0) out.push({ year, entries });
    }
    return out;
}

/** Span of the timeline in years (e.g. 2015 → 2026 = 11), for the section title. */
export function timelineSpan(
    list: readonly Project[] = projects,
    archive: readonly ArchiveEntry[] = archiveTimeline,
): number {
    const { first, last } = timelineRange(list, archive);
    return last - first;
}
