import { getLocale, getTranslations } from "next-intl/server";
import { getProject } from "@/data/projects";
import { stackLayers } from "@/data/stack";
import { Link } from "@/i18n/navigation";

/**
 * "From cloud to your pocket", drawn: the layers the owner ships, pocket on top, network at the
 * bottom, each with the registry projects that prove it. Static markup, server-rendered.
 */
export async function StackLayers() {
    const locale = (await getLocale()) === "ro" ? "ro" : "en";
    const t = await getTranslations("hero");
    const last = stackLayers.length - 1;

    return (
        <figure className="surface rounded-card relative overflow-hidden p-5 shadow-elev-2 sm:p-6">
            <figcaption className="mb-5 flex items-center justify-between gap-3 font-mono text-xs text-fg-subtle">
                <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="flex gap-1.5">
                        <span className="size-2.5 rounded-full bg-line-strong" />
                        <span className="size-2.5 rounded-full bg-line-strong" />
                        <span className="size-2.5 rounded-full bg-accent" />
                    </span>
                    <span className="tracking-[0.14em] uppercase">{t("stackLabel")}</span>
                </span>
                <span aria-hidden="true">{t("stackRange")}</span>
            </figcaption>
            <ol className="relative flex flex-col">
                <span
                    aria-hidden="true"
                    className="absolute top-3 bottom-3 left-[11px] w-px bg-gradient-to-b from-accent via-line-strong to-counter"
                />
                {stackLayers.map((layer, i) => (
                    <li
                        key={layer.id}
                        className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] items-start gap-x-4 border-b border-line py-3 last:border-b-0"
                    >
                        <span
                            aria-hidden="true"
                            className={`relative z-10 mt-1 grid size-[23px] place-items-center rounded-full border bg-surface font-mono text-[10px] ${
                                i === 0
                                    ? "border-accent text-accent"
                                    : i === last
                                      ? "border-counter text-fg-muted"
                                      : "border-line-strong text-fg-subtle"
                            }`}
                        >
                            {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
                            <span className="text-sm font-semibold text-fg sm:text-base">
                                {layer.label[locale]}
                            </span>
                            <ul className="flex flex-wrap gap-1.5" aria-label={t("stackProof")}>
                                {layer.proof.map((slug) => {
                                    const p = getProject(slug);
                                    if (!p) return null;
                                    return (
                                        <li key={slug}>
                                            <Link
                                                href={`/projects/${slug}`}
                                                className="inline-flex min-h-6 items-center rounded-pill border border-line bg-surface-raised px-2.5 font-mono text-[11px] text-fg-muted no-underline transition-colors hover:border-accent hover:text-fg"
                                            >
                                                {p.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </li>
                ))}
            </ol>
        </figure>
    );
}
