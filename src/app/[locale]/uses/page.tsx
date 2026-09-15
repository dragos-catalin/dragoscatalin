import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { Section } from "@/components/ui";
import type { LocalizedText } from "@/data/types";
import { usesSections } from "@/data/uses";
import { localeAlternates } from "@/lib/seo";

type Params = Promise<{ locale: string }>;

function pick(text: LocalizedText, locale: string): string {
    return locale === "ro" ? text.ro : text.en;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "uses" });
    return {
        title: t("title"),
        description: t("intro"),
        alternates: localeAlternates(locale, "/uses"),
    };
}

export default async function UsesPage({ params }: { params: Params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "uses" });

    return (
        <>
            <Section eyebrow={t("eyebrow")} title={t("title")} subtitle={t("intro")} as="h1" />
            {usesSections.map((section) => (
                <Section key={section.id} title={t(`sections.${section.id}`)} id={section.id}>
                    <ul className="surface rounded-card divide-y divide-line overflow-hidden">
                        {section.items.map((item) => (
                            <li
                                key={item.name}
                                className="grid gap-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6"
                            >
                                <div className="font-medium text-fg">
                                    {item.url ? (
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 hover:text-accent"
                                        >
                                            {item.name}
                                            <ExternalLink
                                                className="size-3.5 text-fg-subtle"
                                                aria-hidden
                                            />
                                        </a>
                                    ) : (
                                        item.name
                                    )}
                                </div>
                                <p className="text-sm leading-relaxed text-fg-muted">
                                    {pick(item.note, locale)}
                                </p>
                            </li>
                        ))}
                    </ul>
                </Section>
            ))}
        </>
    );
}
