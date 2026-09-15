import { getLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui";
import { archiveTimeline, projects } from "@/data/projects";
import { Link } from "@/i18n/navigation";
import { TimelineRail } from "./TimelineRail";

const FIRST_YEAR = 2015;
const LAST_YEAR = 2026;

interface Entry {
    key: string;
    name: string;
    note?: string;
    slug?: string;
}

export async function Timeline() {
    const locale = (await getLocale()) as "en" | "ro";
    const t = await getTranslations("timeline");

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
            <TimelineRail className="py-2">
                <ol className="flex flex-col gap-10">
                    {years.map(({ year, entries }, yi) => (
                        <li
                            key={year}
                            className="relative grid gap-3 pl-8 md:grid-cols-2 md:gap-x-12 md:pl-0"
                        >
                            <span
                                aria-hidden="true"
                                className="absolute top-1.5 left-0 size-[15px] rounded-full border-2 border-accent bg-bg md:left-1/2 md:-translate-x-1/2"
                            />
                            <div
                                className={
                                    yi % 2 === 0 ? "md:order-1 md:pl-12" : "md:text-right md:pr-12"
                                }
                            >
                                <time
                                    dateTime={String(year)}
                                    className="font-mono text-2xl font-bold tracking-tight text-fg"
                                >
                                    {year}
                                </time>
                            </div>
                            <ul
                                className={`flex flex-wrap gap-2 ${yi % 2 === 0 ? "md:justify-end md:pr-12" : "md:order-1 md:pl-12"}`}
                                aria-label={String(year)}
                            >
                                {entries.map((e) =>
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
                            </ul>
                        </li>
                    ))}
                </ol>
            </TimelineRail>
        </Section>
    );
}
