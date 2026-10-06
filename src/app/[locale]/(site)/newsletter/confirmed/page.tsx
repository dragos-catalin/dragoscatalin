import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ButtonLink, Section } from "@/components/ui";
import { localeAlternates } from "@/lib/seo";

type Params = Promise<{ locale: string }>;

/** Landing page Brivio 303s to after the confirmation click (`redirect_url`). */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "newsletter" });
    return {
        title: t("confirmedTitle"),
        description: t("confirmedBody"),
        alternates: localeAlternates(locale, "/newsletter/confirmed"),
        robots: { index: false, follow: true },
    };
}

export default async function NewsletterConfirmedPage({ params }: { params: Params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "newsletter" });
    return (
        <Section
            eyebrow={t("eyebrow")}
            title={t("confirmedTitle")}
            subtitle={t("confirmedBody")}
            as="h1"
        >
            <ButtonLink href="/projects">{t("confirmedCta")}</ButtonLink>
        </Section>
    );
}
