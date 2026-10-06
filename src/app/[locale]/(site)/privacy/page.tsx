import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui";
import { ConsentSettingsButton } from "@/components/consent";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { CONSENT_COOKIE } from "@/lib/consent";
import { localeAlternates, localeUrl } from "@/lib/seo";
import { site } from "@/lib/site";
import { buttonClasses } from "@/components/ui/Button";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "privacy" });
    return {
        title: t("title"),
        description: t("intro"),
        alternates: localeAlternates(locale, "/privacy"),
        openGraph: { url: localeUrl(locale, "/privacy") },
    };
}

export default async function PrivacyPage({ params }: { params: Params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "privacy" });
    const nav = await getTranslations({ locale, namespace: "nav" });

    const rows = [
        {
            name: "dc-theme",
            purpose: t("rows.theme"),
            type: t("necessary"),
            duration: t("durYear"),
        },
        {
            name: "NEXT_LOCALE",
            purpose: t("rows.locale"),
            type: t("necessary"),
            duration: t("durYear"),
        },
        {
            name: CONSENT_COOKIE,
            purpose: t("rows.consent"),
            type: t("necessary"),
            duration: t("durConsent"),
        },
        {
            name: "Vercel Analytics / Speed Insights",
            purpose: t("rows.vercel"),
            type: t("analytics"),
            duration: t("durSession"),
        },
    ];

    const blocks = [
        ["contactTitle", "contact"],
        ["newsletterTitle", "newsletter"],
        ["hostingTitle", "hosting"],
        ["rightsTitle", "rights"],
    ] as const;

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: nav("home"), url: localeUrl(locale, "/") },
                    { name: t("title"), url: localeUrl(locale, "/privacy") },
                ])}
            />
            <Section eyebrow={t("eyebrow")} title={t("title")} subtitle={t("intro")} as="h1" />
            <Section title={t("controllerTitle")}>
                <p className="max-w-prose text-fg-muted">
                    {t("controller", { email: site.email })}
                </p>
            </Section>
            <Section title={t("storageTitle")} id="cookies">
                <div className="surface overflow-x-auto rounded-card">
                    <table className="w-full min-w-[40rem] text-left text-sm">
                        <thead className="border-b border-line text-fg">
                            <tr>
                                <th scope="col" className="px-5 py-3 font-medium">
                                    {t("colName")}
                                </th>
                                <th scope="col" className="px-5 py-3 font-medium">
                                    {t("colPurpose")}
                                </th>
                                <th scope="col" className="px-5 py-3 font-medium">
                                    {t("colType")}
                                </th>
                                <th scope="col" className="px-5 py-3 font-medium">
                                    {t("colDuration")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line text-fg-muted">
                            {rows.map((r) => (
                                <tr key={r.name}>
                                    <th
                                        scope="row"
                                        className="px-5 py-3 font-mono text-xs font-normal text-fg"
                                    >
                                        {r.name}
                                    </th>
                                    <td className="px-5 py-3">{r.purpose}</td>
                                    <td className="px-5 py-3">{r.type}</td>
                                    <td className="px-5 py-3 whitespace-nowrap">{r.duration}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>
            {blocks.map(([title, body]) => (
                <Section key={title} title={t(title)} id={body}>
                    <p className="max-w-prose text-fg-muted">{t(body)}</p>
                </Section>
            ))}
            <Section title={t("changeTitle")}>
                <p className="max-w-prose text-fg-muted">{t("change")}</p>
                <ConsentSettingsButton className={buttonClasses("secondary", "md", "mt-6")} />
            </Section>
        </>
    );
}
