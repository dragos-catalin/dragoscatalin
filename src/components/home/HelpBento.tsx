import { ArrowUpRight, Building2, Code2, Rocket, Store } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { ButtonLink, Section } from "@/components/ui";
import { getProject } from "@/data/projects";
import { audiences, type AudienceId } from "@/data/services";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const ICONS: Record<AudienceId, typeof Rocket> = {
    startups: Rocket,
    smes: Store,
    enterprise: Building2,
    developers: Code2,
};

/** Bento rhythm: wide · narrow / narrow · wide — never four identical cards. */
const SPAN: Record<AudienceId, string> = {
    startups: "lg:col-span-3",
    smes: "lg:col-span-2",
    enterprise: "lg:col-span-2",
    developers: "lg:col-span-3",
};

export async function HelpBento() {
    const locale = (await getLocale()) === "ro" ? "ro" : "en";
    const t = await getTranslations("help");

    return (
        <Section
            id="help"
            eyebrow={t("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle")}
            action={
                <ButtonLink href="/services" variant="secondary">
                    {t("cta")}
                </ButtonLink>
            }
        >
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                {audiences.map((a, i) => {
                    const Icon = ICONS[a.id];
                    const wide = SPAN[a.id] === "lg:col-span-3";
                    return (
                        <li
                            key={a.id}
                            className={cn(
                                "surface rounded-card group relative flex min-w-0 flex-col gap-4 overflow-hidden p-6 shadow-elev-1 transition-shadow duration-300 hover:shadow-elev-2 md:p-7",
                                SPAN[a.id],
                            )}
                        >
                            {wide ? (
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-accent-soft blur-3xl"
                                />
                            ) : null}
                            <div className="relative flex items-center justify-between gap-3">
                                <span className="grid size-11 place-items-center rounded-xl border border-line bg-surface-raised text-accent">
                                    <Icon className="size-5" aria-hidden="true" />
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="font-mono text-xs text-fg-subtle"
                                >
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                            </div>
                            <h3 className="relative font-display text-2xl font-bold tracking-[-0.02em] text-fg">
                                <Link
                                    href={`/services#${a.id}`}
                                    className="no-underline after:absolute after:inset-0 after:content-['']"
                                >
                                    {a.title[locale]}
                                </Link>
                            </h3>
                            <p className="relative max-w-prose text-pretty text-fg-muted">
                                {a.lead[locale]}
                            </p>
                            <div className="relative mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                                <ul className="flex flex-wrap gap-1.5" aria-label={t("proof")}>
                                    {a.proof.map((slug) => {
                                        const p = getProject(slug);
                                        return p ? (
                                            <li
                                                key={slug}
                                                className="rounded-pill border border-line bg-surface-raised px-2.5 py-0.5 font-mono text-[11px] text-fg-muted"
                                            >
                                                {p.name}
                                            </li>
                                        ) : null;
                                    })}
                                </ul>
                                <span className="inline-flex items-center gap-1 text-sm font-medium text-fg-muted transition-colors group-hover:text-accent">
                                    {t("more")}
                                    <ArrowUpRight
                                        className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                                        aria-hidden="true"
                                    />
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </Section>
    );
}
