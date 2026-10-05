import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PackagesList } from "@/components/open-source/PackagesList";
import { ReposGrid } from "@/components/open-source/ReposGrid";
import { Section, Skeleton } from "@/components/ui";
import { localeAlternates } from "@/lib/seo";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "openSource" });
    return {
        title: t("title"),
        description: t("subtitle"),
        alternates: localeAlternates(locale, "/open-source"),
    };
}

export default async function OpenSourcePage({ params }: { params: Params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "openSource" });

    return (
        <>
            <Section eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} as="h1" />
            <Section title={t("packages")} id="packages">
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <PackagesList locale={locale} />
                </Suspense>
            </Section>
            <Section title={t("repos")} id="repos">
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                    <ReposGrid locale={locale} />
                </Suspense>
            </Section>
        </>
    );
}
