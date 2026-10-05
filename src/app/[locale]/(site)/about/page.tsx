import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpCircle, Bot, Globe, Layers, Scale, ShieldCheck } from "lucide-react";
import { ButtonLink, Section } from "@/components/ui";
import { allPackages, projects } from "@/data/projects";
import { localeAlternates } from "@/lib/seo";
import { site } from "@/lib/site";

type Params = Promise<{ locale: string }>;
type ValueItem = { title: string; body: string };

const VALUE_ICONS = [ShieldCheck, Scale, Layers, ArrowUpCircle, Bot, Globe] as const;
const GITHUB_SINCE = 2015;
// Build-time constant so the page stays statically prerenderable.
const BUILD_YEAR = new Date().getFullYear();

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
    const values = t.raw("values.items") as ValueItem[];
    const chips = t("stack.body")
        .split(" · ")
        .map((s) => s.trim())
        .filter(Boolean);

    const publicRepos = new Set(
        projects
            .filter((p) => p.visibility === "public")
            .flatMap((p) => (p.repos ?? []).map((r) => `${r.owner}/${r.name}`)),
    ).size;
    const stats = [
        { key: "projects", value: projects.length },
        { key: "repos", value: publicRepos },
        { key: "packages", value: allPackages.length },
        { key: "years", value: BUILD_YEAR - GITHUB_SINCE },
    ] as const;

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
                    <p className="max-w-2xl text-balance text-xl leading-relaxed text-fg-muted md:text-2xl">
                        {t("intro")}
                    </p>
                </div>
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

            <Section title={t("stats.title")}>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((s) => (
                        <div key={s.key} className="surface rounded-card p-6">
                            <dd className="font-mono text-4xl font-bold tracking-tight text-fg">
                                {s.value}
                            </dd>
                            <dt className="mt-2 text-sm text-fg-muted">{t(`stats.${s.key}`)}</dt>
                        </div>
                    ))}
                </dl>
                <div className="mt-10">
                    <ButtonLink href="/#contact" variant="primary" size="lg">
                        {t("cta")}
                    </ButtonLink>
                </div>
            </Section>
        </>
    );
}
