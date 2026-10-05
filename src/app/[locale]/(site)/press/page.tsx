import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Download, Mail } from "lucide-react";
import { CopyButton } from "@/components/press/CopyButton";
import { ButtonLink, Section } from "@/components/ui";
import { bioLong, bioShort, pressFacts, pressProducts } from "@/data/press";
import type { LocalizedText } from "@/data/types";
import { localeAlternates } from "@/lib/seo";
import { site } from "@/lib/site";

type Params = Promise<{ locale: string }>;

function pick(text: LocalizedText, locale: string): string {
    return locale === "ro" ? text.ro : text.en;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "press" });
    return {
        title: t("title"),
        description: t("intro"),
        alternates: localeAlternates(locale, "/press"),
    };
}

export default async function PressPage({ params }: { params: Params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "press" });
    const short = pick(bioShort, locale);
    const long = pick(bioLong, locale);

    return (
        <>
            <Section eyebrow={t("eyebrow")} title={t("title")} subtitle={t("intro")} as="h1" />

            <Section
                title={t("bioShort")}
                id="bio-short"
                action={<CopyButton text={short} label={t("bioShort")} />}
            >
                <p className="surface rounded-card max-w-3xl p-6 text-lg leading-relaxed text-fg">
                    {short}
                </p>
            </Section>

            <Section
                title={t("bioLong")}
                id="bio-long"
                action={<CopyButton text={long} label={t("bioLong")} />}
            >
                <div className="surface rounded-card max-w-3xl space-y-4 p-6 leading-relaxed text-fg-muted">
                    {long.split("\n\n").map((para, i) => (
                        <p key={i}>{para}</p>
                    ))}
                </div>
            </Section>

            <Section title={t("facts")} id="facts">
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {pressFacts.map((f) => (
                        <div key={f.label.en} className="surface rounded-card p-5">
                            <dt className="font-mono text-xs uppercase tracking-wide text-fg-subtle">
                                {pick(f.label, locale)}
                            </dt>
                            <dd className="mt-2 font-medium text-fg">{pick(f.value, locale)}</dd>
                        </div>
                    ))}
                </dl>
            </Section>

            <Section title={t("products")} id="products">
                <ul className="surface rounded-card divide-y divide-line overflow-hidden">
                    {pressProducts.map((p) => (
                        <li
                            key={p.slug}
                            className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-6"
                        >
                            <span className="font-semibold text-fg">{p.name}</span>
                            <span className="text-sm text-fg-muted">{pick(p.tagline, locale)}</span>
                            <a
                                href={p.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-inline gap-1 font-mono text-sm text-accent hover:underline"
                            >
                                {p.website.replace(/^https?:\/\//, "")}
                                <ArrowUpRight className="size-3.5" aria-hidden />
                            </a>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section title={t("assets")} id="assets">
                <ul className="grid gap-4 sm:grid-cols-2">
                    <li className="surface rounded-card flex items-center gap-5 p-5">
                        <Image
                            src="/logo.png"
                            alt={t("logo")}
                            width={64}
                            height={64}
                            className="size-16 rounded-xl object-contain"
                        />
                        <div className="flex-1">
                            <p className="font-medium text-fg">{t("logo")}</p>
                            <p className="font-mono text-xs text-fg-subtle">logo.png</p>
                        </div>
                        <a
                            href="/logo.png"
                            download
                            className="link-inline gap-1 text-sm text-accent hover:underline"
                        >
                            <Download className="size-4" aria-hidden />
                            {t("download")}
                        </a>
                    </li>
                    <li className="surface rounded-card flex items-center gap-5 p-5">
                        <Image
                            src={site.avatar}
                            alt={t("avatar")}
                            width={64}
                            height={64}
                            className="size-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <p className="font-medium text-fg">{t("avatar")}</p>
                            <p className="font-mono text-xs text-fg-subtle">avatar.png</p>
                        </div>
                        <a
                            href={site.avatar}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-inline gap-1 text-sm text-accent hover:underline"
                        >
                            <Download className="size-4" aria-hidden />
                            {t("download")}
                        </a>
                    </li>
                </ul>
            </Section>

            <Section title={t("contactPress")} id="contact">
                <ButtonLink href={`mailto:${site.email}`} variant="primary" size="lg">
                    <Mail className="size-4" aria-hidden />
                    {site.email}
                </ButtonLink>
            </Section>
        </>
    );
}
