import { getLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui";
import { archiveTimeline, projects } from "@/data/projects";
import { Link } from "@/i18n/navigation";
import { TimelineRail } from "./TimelineRail";

const FIRST_YEAR = 2015;
const LAST_YEAR = 2026;
/** Chips shown per year before collapsing into "+N" (2026 alone has 11 entries). */
const MAX_PER_YEAR = 8;

interface Entry {
    key: string;
    name: string;
    note?: string;
    slug?: string;
}

export async function Timeline() {
    const locale = (await getLocale()) as "en" | "ro";
    const t = await getTranslations("timeline");
    const tp = await getTranslations("projects");

    const years: { year: number; entries: Entry[] }[] = [];
    for (let year = LAST_YEAR; year >= FIRST_YEAR; year--) {
        const entries: Entry[] = [
            ...projects
                .filter((p) => p.years.from === year)
                .map((p) => ({
                    key: `p-${p.slug}`,
                    name: p.name,
                    note: p.tagline[locale],
                    slug: p.slug,
                })),
            ...archiveTimeline
                .filter((a) => a.year === year)
                .map((a) => ({ key: `a-${year}-${a.name}`, name: a.name, note: a.note[locale] })),
        ];
        if (entries.length > 0) years.push({ year, entries });
    }

    return (
        <Section id="timeline" eyebrow={t("eyebrow")} title={t("title")}>
            <TimelineRail className="py-1">
                <ol className="flex flex-col">
                    {years.map(({ year, entries }, yi) => (
                        <li
                            key={year}
                            className="relative grid gap-3 border-b border-line py-6 pl-8 last:border-b-0 md:grid-cols-[8rem_minmax(0,1fr)] md:items-start md:gap-x-10"
                        >
                            <span
                                aria-hidden="true"
                                className={`absolute top-[1.85rem] left-0 size-[15px] rounded-full border-2 ${yi === 0 ? "border-accent bg-accent" : "border-accent bg-bg"}`}
                            />
                            <div>
                                <time
                                    dateTime={String(year)}
                                    className="font-display text-3xl font-bold tracking-tight text-fg"
                                >
                                    {year}
                                </time>
                            </div>
                            <ul className="flex flex-wrap gap-2 md:pt-1" aria-label={String(year)}>
                                {entries.slice(0, MAX_PER_YEAR).map((e) =>
                                    e.slug ? (
                                        <li key={e.key}>
                                            <Link
                                                href={`/projects/${e.slug}`}
                                                title={e.note}
                                                className="surface rounded-pill inline-flex items-center gap-1.5 px-3 py-1 text-sm text-fg no-underline transition-colors hover:border-accent hover:text-accent"
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className="size-1.5 rounded-full bg-accent"
                                                />
                                                {e.name}
                                            </Link>
                                        </li>
                                    ) : (
                                        <li
                                            key={e.key}
                                            title={e.note}
                                            className="rounded-pill inline-flex items-center border border-dashed border-line px-3 py-1 text-sm text-fg-muted"
                                        >
                                            {e.name}
                                        </li>
                                    ),
                                )}
                                {entries.length > MAX_PER_YEAR ? (
                                    <li>
                                        <Link
                                            href="/projects"
                                            className="rounded-pill inline-flex items-center px-3 py-1 text-sm text-fg-muted no-underline transition-colors hover:text-accent"
                                        >
                                            {tp("more", { count: entries.length - MAX_PER_YEAR })}
                                        </Link>
                                    </li>
                                ) : null}
                            </ul>
                        </li>
                    ))}
                </ol>
            </TimelineRail>
        </Section>
    );
}
