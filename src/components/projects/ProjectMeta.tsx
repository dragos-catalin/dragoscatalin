import { getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import type { LocalizedText, Project } from "@/data/types";
import { sortedPlatforms, sortedStores } from "@/lib/project-links";

function pick(text: LocalizedText, locale: string): string {
    return locale === "ro" ? text.ro : text.en;
}

const SECTION_TITLE = "font-mono text-[11px] uppercase tracking-wider text-fg-subtle";

/** Store / marketplace badges. Server component. */
export async function StoreBadges({ project }: { project: Project }) {
    const stores = sortedStores(project);
    if (stores.length === 0) return null;
    const t = await getTranslations("projects");
    return (
        <ul
            className="flex flex-wrap gap-2"
            aria-label={t("storesLabel")}
            data-testid="store-badges"
        >
            {stores.map((s) => (
                <li key={s.url}>
                    <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t("storeLink", {
                            name: project.name,
                            store: t(`store.${s.store}`),
                        })}
                        data-store={s.store}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-pill border border-line-strong bg-surface-raised px-3 text-xs font-medium text-fg transition-colors hover:border-accent hover:text-accent"
                    >
                        {t(`store.${s.store}`)}
                        <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                </li>
            ))}
        </ul>
    );
}

/** Platform chips. Server component. */
export async function PlatformChips({ project }: { project: Project }) {
    const platforms = sortedPlatforms(project);
    if (platforms.length === 0) return null;
    const t = await getTranslations("projects");
    return (
        <section className="flex flex-col gap-3">
            <h2 className={SECTION_TITLE}>{t("platformsLabel")}</h2>
            <ul className="flex flex-wrap gap-1.5" data-testid="platform-chips">
                {platforms.map((p) => (
                    <li
                        key={p}
                        className="rounded-pill border border-line bg-surface-raised px-2 py-0.5 text-xs text-fg-muted"
                    >
                        {t(`platform.${p}`)}
                    </li>
                ))}
            </ul>
        </section>
    );
}

/** Sourced numbers. Server component. */
export async function MetricsList({ project, locale }: { project: Project; locale: string }) {
    const metrics = project.metrics ?? [];
    if (metrics.length === 0) return null;
    const t = await getTranslations("projects");
    return (
        <section className="flex flex-col gap-3">
            <h2 className={SECTION_TITLE}>{t("metricsLabel")}</h2>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="metrics">
                {metrics.map((m) => (
                    <div key={m.label.en} className="rounded-card surface flex flex-col gap-1 p-4">
                        <dt className="order-2 text-xs text-fg-muted">
                            {pick(m.label, locale)}
                            {m.asOf ? (
                                <span className="text-fg-subtle">
                                    {" "}
                                    · {t("metricAsOf", { date: m.asOf })}
                                </span>
                            ) : null}
                            {m.source ? (
                                <>
                                    {" · "}
                                    <a
                                        href={m.source}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent hover:underline"
                                    >
                                        {t("metricSource")}
                                    </a>
                                </>
                            ) : null}
                        </dt>
                        <dd className="order-1 font-display text-2xl font-bold tracking-tight text-fg">
                            {m.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}

/** Published items (e.g. live watch faces). Server component. */
export async function ListingsList({ project, locale }: { project: Project; locale: string }) {
    const listings = project.listings ?? [];
    if (listings.length === 0) return null;
    const t = await getTranslations("projects");
    return (
        <section className="flex flex-col gap-3">
            <h2 className={SECTION_TITLE}>{t("listingsLabel")}</h2>
            <ul className="grid gap-2 sm:grid-cols-2" data-testid="listings">
                {listings.map((l) => (
                    <li key={l.url}>
                        <a
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t("listingLink", {
                                name: l.name,
                                store: t(`store.${l.store}`),
                            })}
                            className="rounded-card surface flex min-h-11 items-center justify-between gap-3 px-4 py-2.5 text-sm text-fg hover:text-accent"
                        >
                            <span>{l.name}</span>
                            <span className="flex items-center gap-1.5 font-mono text-xs text-fg-muted">
                                {l.note ? pick(l.note, locale) : t(`store.${l.store}`)}
                                <ExternalLink className="size-3" aria-hidden />
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    );
}
