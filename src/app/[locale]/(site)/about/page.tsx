import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpCircle, Bot, ExternalLink, Globe, Layers, Scale, ShieldCheck } from "lucide-react";
import { ButtonLink, Section } from "@/components/ui";
import { CAREER, headlineNumbers, measured } from "@/data/numbers";
import { localeAlternates } from "@/lib/seo";
import { site } from "@/lib/site";

type Params = Promise<{ locale: string }>;
type ValueItem = { title: string; body: string };

const VALUE_ICONS = [ShieldCheck, Scale, Layers, ArrowUpCircle, Bot, Globe] as const;
const EXTERNAL =
    "inline-flex min-h-11 items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2 text-sm text-fg transition-colors hover:border-accent hover:text-accent";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "about" });
    return {
        title: t("title"),
        description: t("intro"),
        alternates: localeAlternates(locale, "/about"),
    };
}

export default async function AboutPage({ params }: { params: Params }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "about" });
    const tp = await getTranslations({ locale, namespace: "projects" });
    const tc = await getTranslations({ locale, namespace: "common" });
    const values = t.raw("values.items") as ValueItem[];
    const chips = t("stack.body")
        .split(" · ")
        .map((s) => s.trim())
        .filter(Boolean);
    const fmt = new Intl.NumberFormat(locale);
    const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" });
    const stats = [
        { key: "codeYears", value: `${CAREER.codeYears}+` },
        { key: "paidYears", value: `${CAREER.paidYears}+` },
        ...headlineNumbers().map((n) => ({ key: n.key, value: fmt.format(n.value) })),
    ];
    const maxShare = Math.max(...measured.languages.map((l) => l.share));

    return (
        <>
            <Section eyebrow={t("eyebrow")} title={t("title")} as="h1">
                <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-12">
                    <div className="relative shrink-0 rounded-full p-1 ring-2 ring-accent/60 ring-offset-4 ring-offset-bg glow-sm">
                        <Image
                            src={site.avatar}
                            alt={t("avatarAlt")}
                            width={160}
                            height={160}
                            className="size-40 rounded-full object-cover"
                        />
                    </div>
                    <div className="flex max-w-2xl flex-col gap-5">
                        <p className="text-xl leading-relaxed text-pretty text-fg md:text-2xl">
                            {t("intro")}
                        </p>
                        <p className="text-base leading-relaxed text-pretty text-fg-muted md:text-lg">
                            {t("body")}
                        </p>
                    </div>
                </div>
            </Section>

            <Section title={t("stats.title")}>
                <dl
                    data-testid="about-numbers"
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                >
                    {stats.map((s) => (
                        <div key={s.key} className="surface rounded-card flex flex-col p-6">
                            <dt className="order-2 mt-2 text-sm text-fg-muted">
                                {s.key === "commits"
                                    ? t("stats.commits", {
                                          year: String(measured.year),
                                          repos: measured.commits.reposWithCommits,
                                      })
                                    : t(`stats.${s.key}`)}
                            </dt>
                            <dd className="order-1 font-mono text-3xl font-bold tracking-tight text-fg md:text-4xl">
                                {s.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </Section>

            <Section title={t("languages.title")}>
                <ul data-testid="about-languages" className="grid gap-3 md:grid-cols-2">
                    {measured.languages.map((l) => (
                        <li key={l.name} className="surface rounded-card flex flex-col gap-2 p-4">
                            <div className="flex items-baseline justify-between gap-4">
                                <span className="font-medium text-fg">{l.name}</span>
                                <span className="font-mono text-xs text-fg-muted">
                                    {l.share >= 0.1
                                        ? `${fmt.format(l.share)} %`
                                        : t("languages.lines", { count: l.lines })}
                                </span>
                            </div>
                            <span
                                aria-hidden="true"
                                className="h-1.5 rounded-pill bg-accent"
                                style={{ width: `${Math.max(2, (l.share / maxShare) * 100)}%` }}
                            />
                        </li>
                    ))}
                </ul>
                <p className="mt-4 max-w-3xl text-sm text-fg-subtle">
                    {t("languages.note", {
                        date: dateFmt.format(new Date(`${measured.measuredAt}T00:00:00Z`)),
                        repos: measured.repos,
                    })}
                </p>
                <h3 className="mt-10 text-lg font-semibold text-fg">{t("languages.also")}</h3>
                <p className="mt-1 text-sm text-fg-muted">{t("languages.alsoNote")}</p>
                <ul data-testid="about-also" className="mt-4 flex flex-wrap gap-2">
                    {measured.alsoWorkedWith.map((a) => (
                        <li
                            key={a.name}
                            className="rounded-pill border border-dashed border-line px-3 py-1.5 font-mono text-sm text-fg-muted"
                        >
                            {a.name}
                        </li>
                    ))}
                </ul>
            </Section>

            <Section title={t("values.title")}>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {values.map((item, i) => {
                        const Icon = VALUE_ICONS[i % VALUE_ICONS.length] ?? ShieldCheck;
                        return (
                            <li
                                key={item.title}
                                className="surface rounded-card flex flex-col gap-4 p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-sm text-fg-subtle">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span className="rounded-pill bg-accent-soft p-2 text-accent">
                                        <Icon className="size-5" aria-hidden />
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-fg">{item.title}</h3>
                                <p className="text-sm leading-relaxed text-fg-muted">{item.body}</p>
                            </li>
                        );
                    })}
                </ul>
            </Section>

            <Section title={t("stack.title")}>
                <ul className="flex flex-wrap gap-2">
                    {chips.map((chip) => (
                        <li
                            key={chip}
                            className="rounded-pill border border-line bg-surface px-3 py-1.5 font-mono text-sm text-fg-muted"
                        >
                            {chip}
                        </li>
                    ))}
                </ul>
            </Section>

            <Section title={t("find.title")}>
                <div className="grid gap-10 md:grid-cols-2">
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-fg">{t("find.brands")}</h3>
                        <ul className="flex flex-wrap gap-2">
                            {site.brands.map((b) => (
                                <li key={b.slug}>
                                    <a
                                        href={b.url}
                                        target="_blank"
                                        rel="noopener"
                                        className={EXTERNAL}
                                        aria-label={`${b.name} ${tc("external")}`}
                                    >
                                        {b.name}
                                        <ExternalLink
                                            className="size-3.5 text-fg-subtle"
                                            aria-hidden
                                        />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-fg">{t("find.stores")}</h3>
                        <ul data-testid="about-stores" className="flex flex-wrap gap-2">
                            {site.storeProfiles.map((s) => {
                                const label =
                                    "app" in s
                                        ? t("find.msApp", { app: s.app })
                                        : tp(`store.${s.store}`);
                                return (
                                    <li key={s.url}>
                                        <a
                                            href={s.url}
                                            target="_blank"
                                            rel={s.profile ? "me noopener" : "noopener"}
                                            className={EXTERNAL}
                                            aria-label={`${label} ${tc("external")}`}
                                        >
                                            {label}
                                            <ExternalLink
                                                className="size-3.5 text-fg-subtle"
                                                aria-hidden
                                            />
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
                <div className="mt-10">
                    <ButtonLink href="/#contact" variant="primary" size="lg">
                        {t("cta")}
                    </ButtonLink>
                </div>
            </Section>
        </>
    );
}
