import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/ui";
import { localeAlternates, localeUrl } from "@/lib/seo";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "newsletter" });
    return {
        title: t("title"),
        description: t("intro"),
        alternates: localeAlternates(locale, "/newsletter"),
        openGraph: { url: localeUrl(locale, "/newsletter") },
    };
}

export default async function NewsletterPage({ params }: { params: Params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "newsletter" });
    const nav = await getTranslations({ locale, namespace: "nav" });
    const points = ["what", "cadence", "leave"] as const;

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: nav("home"), url: localeUrl(locale, "/") },
                    { name: t("title"), url: localeUrl(locale, "/newsletter") },
                ])}
            />
            <Section eyebrow={t("eyebrow")} title={t("title")} subtitle={t("intro")} as="h1">
                <ul className="mb-10 flex max-w-prose list-disc flex-col gap-2 pl-5 text-fg-muted">
                    {points.map((p) => (
                        <li key={p}>{t(`points.${p}`)}</li>
                    ))}
                </ul>
                <NewsletterForm />
            </Section>
        </>
    );
}
