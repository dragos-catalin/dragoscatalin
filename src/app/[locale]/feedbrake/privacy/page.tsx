import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ButtonLink, Section } from "@/components/ui";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { FEEDBRAKE } from "@/data/feedbrake";
import { localeAlternates, localeUrl } from "@/lib/seo";
import { site } from "@/lib/site";

type Params = Promise<{ locale: string }>;

const PATH = "/feedbrake/privacy";
const RULES_HOST = "raw.githubusercontent.com/dragoscv/unscroll-rules";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "feedbrakePrivacy" });
    return {
        title: t("title"),
        description: t("meta"),
        alternates: localeAlternates(locale, PATH),
        openGraph: { url: localeUrl(locale, PATH) },
    };
}

export default async function FeedbrakePrivacyPage({ params }: { params: Params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "feedbrakePrivacy" });
    const nav = await getTranslations({ locale, namespace: "nav" });
    const stored = t.raw("stored") as string[];

    const blocks = [
        ["backupTitle", "backup"],
        ["notTitle", "not"],
        ["changesTitle", "changes"],
    ] as const;

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: nav("home"), url: localeUrl(locale, "/") },
                    { name: FEEDBRAKE.name, url: localeUrl(locale, "/feedbrake") },
                    { name: t("title"), url: localeUrl(locale, PATH) },
                ])}
            />
            <Section eyebrow={t("eyebrow")} title={t("title")} subtitle={t("intro")} as="h1">
                <p className="max-w-prose text-sm text-fg-subtle">
                    {t("byline", { date: FEEDBRAKE.policyEffective, email: site.email })}
                </p>
            </Section>
            <Section title={t("accessTitle")}>
                <h3 className="text-xl font-semibold text-fg">{t("a11yTitle")}</h3>
                <p className="mt-3 max-w-prose text-fg-muted">{t("a11y")}</p>
                <h3 className="mt-10 text-xl font-semibold text-fg">{t("storedTitle")}</h3>
                <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5 text-fg-muted">
                    {stored.map((line) => (
                        <li key={line}>{line}</li>
                    ))}
                </ul>
                <p className="mt-3 max-w-prose text-fg-muted">{t("storedNote")}</p>
            </Section>
            <Section title={t("networkTitle")}>
                <p className="max-w-prose text-fg-muted">{t("network", { host: RULES_HOST })}</p>
                <a
                    href={FEEDBRAKE.rulesUrl}
                    target="_blank"
                    rel="noopener"
                    className="link-inline mt-4 inline-block font-mono text-sm text-fg"
                >
                    {FEEDBRAKE.rulesUrl.replace("https://", "")}
                </a>
            </Section>
            {blocks.map(([title, body]) => (
                <Section key={title} title={t(title)}>
                    <p className="max-w-prose text-fg-muted">{t(body)}</p>
                </Section>
            ))}
            <Section>
                <ButtonLink href="/feedbrake" variant="secondary" size="md">
                    {FEEDBRAKE.name}
                </ButtonLink>
            </Section>
        </>
    );
}
