import { getTranslations } from "next-intl/server";
import type { GitHubActivity } from "@/lib/github";

const LEVEL_OPACITY = [0, 0.25, 0.5, 0.75, 1] as const;

/** Server-rendered contribution heatmap (no client JS). */
export async function Heatmap({ activity, locale }: { activity: GitHubActivity; locale: string }) {
    const t = await getTranslations({ locale, namespace: "now" });
    const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

    return (
        <figure className="surface rounded-card p-4 sm:p-6">
            <div className="overflow-x-auto">
                <ul aria-label={t("heatmapLabel")} className="flex min-w-max gap-[3px]">
                    {activity.weeks.map((week, wi) => (
                        <li key={wi} className="flex flex-col gap-[3px]">
                            {week.days.map((day) => (
                                <span
                                    key={day.date}
                                    role="img"
                                    aria-label={t("heatmapDay", {
                                        count: day.count,
                                        date: fmt.format(new Date(day.date)),
                                    })}
                                    title={t("heatmapDay", {
                                        count: day.count,
                                        date: fmt.format(new Date(day.date)),
                                    })}
                                    className="block size-[11px] rounded-[2px] bg-accent"
                                    style={{
                                        opacity:
                                            day.level === 0
                                                ? undefined
                                                : (LEVEL_OPACITY[day.level] ?? 1),
                                        background:
                                            day.level === 0 ? "var(--surface-raised)" : undefined,
                                    }}
                                />
                            ))}
                        </li>
                    ))}
                </ul>
            </div>
            <figcaption className="mt-4 font-mono text-sm text-fg-muted">
                {t("contributions", { count: activity.totalContributions })}
            </figcaption>
        </figure>
    );
}
