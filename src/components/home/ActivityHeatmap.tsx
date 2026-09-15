import { getTranslations } from "next-intl/server";
import { fetchActivity } from "@/lib/github";
import { site } from "@/lib/site";

/** 52×7 GitHub contribution heatmap. Renders nothing when the token is absent. */
export async function ActivityHeatmap() {
    const activity = await fetchActivity(site.handle);
    if (!activity) return null;
    const t = await getTranslations("now");
    const weeks = activity.weeks.slice(-52);

    return (
        <div className="flex flex-col gap-3">
            <div
                role="img"
                aria-label={t("contributions", { count: activity.totalContributions })}
                className="grid w-full gap-[3px]"
                style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
            >
                {weeks.map((w, wi) => (
                    <div key={wi} className="grid grid-rows-7 gap-[3px]">
                        {w.days.map((d) => (
                            <div
                                key={d.date}
                                title={`${d.date}: ${d.count}`}
                                className="aspect-square rounded-[2px]"
                                style={{
                                    background: `oklch(from var(--accent) l c h / ${0.15 + d.level * 0.2})`,
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <p className="font-mono text-xs text-fg-muted">
                {t("contributions", { count: activity.totalContributions })}
            </p>
        </div>
    );
}
