import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Badge, ButtonLink, Section, buttonClasses } from "@/components/ui";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { FEEDBRAKE, PLAY_URL } from "@/data/feedbrake";
import { localeAlternates, localeUrl } from "@/lib/seo";
import { site } from "@/lib/site";

type Params = Promise<{ locale: string }>;
type Feature = { title: string; body: string };

const PATH = "/feedbrake";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "feedbrake" });
    return {
        title: `${t("title")} — ${t("tagline")}`,
        description: t("intro"),
        alternates: localeAlternates(locale, PATH),
        openGraph: { url: localeUrl(locale, PATH) },
    };
}

export default async function FeedbrakePage({ params }: { params: Params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "feedbrake" });
    const nav = await getTranslations({ locale, namespace: "nav" });
    const features = t.raw("features") as Feature[];
    const privacy = t.raw("privacy") as string[];

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: nav("home"), url: localeUrl(locale, "/") },
                    { name: FEEDBRAKE.name, url: localeUrl(locale, PATH) },
                ])}
            />
            <Section eyebrow={t("eyebrow")} title={t("title")} subtitle={t("tagline")} as="h1">
                <p className="max-w-prose text-lg text-pretty text-fg-muted">{t("intro")}</p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                    {PLAY_URL ? (
                        <a
                            href={PLAY_URL}
                            target="_blank"
                            rel="noopener"
                            className={buttonClasses("primary", "lg")}
                        >
                            {t("playBadge")}
                        </a>
                    ) : (
                        <Badge variant="accent" dot>
                            {t("comingSoon")}
                        </Badge>
                    )}
                    <ButtonLink href="/feedbrake/privacy" variant="secondary" size="md">
                        {t("privacyLink")}
                    </ButtonLink>
                </div>
            </Section>

            <Section title={t("featuresTitle")}>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((f) => (
                        <li key={f.title} className="surface rounded-card p-6">
                            <h3 className="text-lg font-semibold text-fg">{f.title}</h3>
                            <p className="mt-2 text-sm text-pretty text-fg-muted">{f.body}</p>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section title={t("privacyTitle")}>
                <ul className="max-w-prose list-disc space-y-2 pl-5 text-fg-muted">
                    {privacy.map((line) => (
                        <li key={line}>{line}</li>
                    ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                    <a
                        href={FEEDBRAKE.rulesUrl}
                        target="_blank"
                        rel="noopener"
                        className="link-inline text-fg"
                    >
                        {t("rulesLink")}
                    </a>
                    <ButtonLink href="/feedbrake/privacy" variant="link">
                        {t("privacyLink")}
                    </ButtonLink>
                </div>
            </Section>

            <Section title={t("contactTitle")}>
                <p className="max-w-prose text-fg-muted">{t("contact", { email: site.email })}</p>
                <a
                    href={`mailto:${site.email}`}
                    className={buttonClasses("secondary", "md", "mt-6")}
                >
                    {site.email}
                </a>
            </Section>
        </>
    );
}
