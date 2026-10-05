import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ItemList, WithContext } from "schema-dts";
import { Badge, ButtonLink, Section, type BadgeVariant } from "@/components/ui";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { LAB_STAGES, labIdeas, type LabStage } from "@/data/lab";
import { localeAlternates, localeUrl } from "@/lib/seo";

type Params = Promise<{ locale: string }>;

const STAGE_VARIANT: Record<LabStage, BadgeVariant> = {
    building: "accent",
    exploring: "neutral",
    shipped: "success",
    paused: "outline",
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "lab" });
    return {
        title: t("title"),
        description: t("intro"),
        alternates: localeAlternates(locale, "/lab"),
        openGraph: { url: localeUrl(locale, "/lab") },
    };
}

export default async function LabPage({ params }: { params: Params }) {
    const { locale } = await params;
    const lang = locale === "ro" ? "ro" : "en";
    const t = await getTranslations({ locale, namespace: "lab" });
    const nav = await getTranslations({ locale, namespace: "nav" });
    const date = new Intl.DateTimeFormat(locale === "ro" ? "ro-RO" : "en-GB", {
        dateStyle: "medium",
        timeZone: "UTC",
    });
    const ideas = [...labIdeas].sort(
        (a, b) => LAB_STAGES.indexOf(a.stage) - LAB_STAGES.indexOf(b.stage),
    );

    const list: WithContext<ItemList> = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: t("title"),
        url: localeUrl(locale, "/lab"),
        itemListElement: ideas.map((i, n) => ({
            "@type": "ListItem",
            position: n + 1,
            name: i.name,
            description: i.problem[lang],
            url: `${localeUrl(locale, "/lab")}#${i.id.toLowerCase()}`,
        })),
    };

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: nav("home"), url: localeUrl(locale, "/") },
                    { name: t("title"), url: localeUrl(locale, "/lab") },
                ])}
            />
            <JsonLd data={list} />
            <Section eyebrow={t("eyebrow")} title={t("title")} subtitle={t("intro")} as="h1">
                {ideas.length === 0 ? (
                    <p className="text-fg-muted">{t("empty")}</p>
                ) : (
                    <ul className="grid gap-4 md:grid-cols-2">
                        {ideas.map((i) => (
                            <li
                                key={i.id}
                                id={i.id.toLowerCase()}
                                className="surface flex scroll-mt-24 flex-col gap-4 rounded-card p-6"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="font-mono text-lg font-semibold text-fg">
                                        {i.name}
                                    </h2>
                                    <Badge variant={STAGE_VARIANT[i.stage]} dot>
                                        {t(`stages.${i.stage}`)}
                                    </Badge>
                                </div>
                                <div>
                                    <h3 className="mb-1 font-mono text-xs tracking-[0.18em] text-fg-subtle uppercase">
                                        {t("problemLabel")}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-fg-muted">
                                        {i.problem[lang]}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="mb-1 font-mono text-xs tracking-[0.18em] text-fg-subtle uppercase">
                                        {t("approachLabel")}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-fg-muted">
                                        {i.approach[lang]}
                                    </p>
                                </div>
                                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-fg-subtle">
                                    {i.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-pill border border-line px-2.5 py-1 font-mono"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    <time dateTime={i.updated} className="ms-auto">
                                        {t("updated", {
                                            date: date.format(new Date(`${i.updated}T00:00:00Z`)),
                                        })}
                                    </time>
                                </div>
                                {i.repo ? (
                                    <a
                                        href={i.repo}
                                        target="_blank"
                                        rel="noopener"
                                        className="link-inline text-sm text-fg"
                                    >
                                        {t("repo")}
                                    </a>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                )}
                <p className="mt-10 max-w-prose text-fg-muted">{t("cta")}</p>
                <div className="mt-6">
                    <ButtonLink href="/#contact" variant="primary" size="lg">
                        {nav("contact")}
                    </ButtonLink>
                </div>
            </Section>
        </>
    );
}
