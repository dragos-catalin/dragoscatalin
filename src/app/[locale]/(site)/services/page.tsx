import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Building2, Code2, Rocket, Store } from "lucide-react";
import type { WithContext, ProfessionalService } from "schema-dts";
import { ButtonLink, Section } from "@/components/ui";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Link } from "@/i18n/navigation";
import { getProject } from "@/data/projects";
import { audiences, processSteps, type AudienceId } from "@/data/services";
import { localeAlternates, localeUrl } from "@/lib/seo";
import { site } from "@/lib/site";

type Params = Promise<{ locale: string }>;

const ICONS: Record<AudienceId, typeof Rocket> = {
    startups: Rocket,
    smes: Store,
    enterprise: Building2,
    developers: Code2,
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "services" });
    return {
        title: t("title"),
        description: t("intro"),
        alternates: localeAlternates(locale, "/services"),
        openGraph: { url: localeUrl(locale, "/services") },
    };
}

function serviceJsonLd(locale: "en" | "ro", description: string): WithContext<ProfessionalService> {
    return {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: `${site.name} — ${locale === "ro" ? "servicii" : "services"}`,
        url: localeUrl(locale, "/services"),
        description,
        areaServed: [
            { "@type": "Country", name: "Romania" },
            { "@type": "Place", name: "European Union" },
        ],
        founder: { "@id": `${site.url}/#person` },
        hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: description,
            itemListElement: audiences.map((a) => ({
                "@type": "OfferCatalog",
                name: a.title[locale],
                description: a.lead[locale],
                itemListElement: a.offers.map((o) => ({
                    "@type": "Offer",
                    itemOffered: { "@type": "Service", name: o[locale] },
                })),
            })),
        },
    };
}

export default async function ServicesPage({ params }: { params: Params }) {
    const { locale } = await params;
    const lang = locale === "ro" ? "ro" : "en";
    const t = await getTranslations({ locale, namespace: "services" });
    const nav = await getTranslations({ locale, namespace: "nav" });

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: nav("home"), url: localeUrl(locale, "/") },
                    { name: t("title"), url: localeUrl(locale, "/services") },
                ])}
            />
            <JsonLd data={serviceJsonLd(lang, t("intro"))} />
            <Section eyebrow={t("eyebrow")} title={t("title")} subtitle={t("intro")} as="h1">
                <nav aria-label={t("title")}>
                    <ul className="flex flex-wrap gap-2">
                        {audiences.map((a) => (
                            <li key={a.id}>
                                <a
                                    href={`#${a.id}`}
                                    className="inline-flex min-h-11 items-center rounded-pill border border-line bg-surface px-4 text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                                >
                                    {a.title[lang]}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </Section>

            {audiences.map((a, i) => {
                const Icon = ICONS[a.id];
                const proof = a.proof
                    .map((slug) => getProject(slug))
                    .filter((p): p is NonNullable<typeof p> => Boolean(p));
                return (
                    <Section
                        key={a.id}
                        id={a.id}
                        className="scroll-mt-24 border-t border-line"
                        eyebrow={String(i + 1).padStart(2, "0")}
                        title={a.title[lang]}
                        subtitle={a.lead[lang]}
                        action={
                            <span className="inline-flex rounded-pill bg-accent-soft p-3 text-accent">
                                <Icon className="size-6" aria-hidden />
                            </span>
                        }
                    >
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="surface rounded-card p-6 lg:col-span-2">
                                <h3 className="mb-4 font-mono text-xs tracking-[0.18em] text-fg-subtle uppercase">
                                    {t("offersLabel")}
                                </h3>
                                <ul className="flex flex-col gap-3">
                                    {a.offers.map((o) => (
                                        <li key={o.en} className="flex gap-3 text-fg">
                                            <span
                                                aria-hidden
                                                className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                                            />
                                            <span>{o[lang]}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="surface rounded-card p-6">
                                    <h3 className="mb-3 font-mono text-xs tracking-[0.18em] text-fg-subtle uppercase">
                                        {t("proofLabel")}
                                    </h3>
                                    <ul className="flex flex-wrap gap-2">
                                        {proof.map((p) => (
                                            <li key={p.slug}>
                                                <Link
                                                    href={`/projects/${p.slug}`}
                                                    className="inline-flex min-h-9 items-center rounded-pill border border-line px-3 text-sm text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                                                >
                                                    {p.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="surface rounded-card p-6">
                                    <h3 className="mb-3 font-mono text-xs tracking-[0.18em] text-fg-subtle uppercase">
                                        {t("engagementLabel")}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-fg-muted">
                                        {a.engagement[lang]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Section>
                );
            })}

            <Section title={t("processTitle")} className="border-t border-line">
                <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {processSteps.map((s, i) => (
                        <li
                            key={s.title.en}
                            className="surface flex flex-col gap-3 rounded-card p-6"
                        >
                            <span className="font-mono text-sm text-fg-subtle">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <h3 className="text-lg font-semibold text-fg">{s.title[lang]}</h3>
                            <p className="text-sm leading-relaxed text-fg-muted">{s.body[lang]}</p>
                        </li>
                    ))}
                </ol>
                <p className="mt-10 max-w-prose text-fg-muted">{t("availability")}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <ButtonLink href="/#contact" variant="primary" size="lg">
                        {t("cta")}
                    </ButtonLink>
                    <ButtonLink href="/projects" variant="secondary" size="lg">
                        {t("ctaSecondary")}
                    </ButtonLink>
                </div>
            </Section>
        </>
    );
}
