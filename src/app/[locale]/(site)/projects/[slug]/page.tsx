import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { BreadcrumbList, SoftwareApplication, WithContext } from "schema-dts";
import { Badge, Skeleton } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { RepoStatsPanel } from "@/components/projects/RepoStatsPanel";
import { coverGradient, coverTransitionName } from "@/components/projects/cover";
import { CoverArt } from "@/components/projects/CoverArt";
import { DeviceShowcase } from "@/components/projects/DeviceShowcase";
import {
    ListingsList,
    MetricsList,
    PlatformChips,
    StoreBadges,
} from "@/components/projects/ProjectMeta";
import { getShots, shotSrc } from "@/lib/shots";
import { statusVariant } from "@/components/projects/status";
import { getProject, projects } from "@/data/projects";
import type { LocalizedText, PackageRef, Project } from "@/data/types";
import {
    downloadUrl,
    installUrl,
    liveSurfaceUrl,
    liveWebsite,
    operatingSystems,
} from "@/lib/project-links";
import { localeAlternates, localeUrl } from "@/lib/seo";
import { site } from "@/lib/site";

type Params = Promise<{ locale: string; slug: string }>;

export function generateStaticParams() {
    return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

function pick(text: LocalizedText, locale: string): string {
    return locale === "ro" ? text.ro : text.en;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale, slug } = await params;
    const project = getProject(slug);
    if (!project) return {};
    const description = pick(project.tagline, locale);
    return {
        title: project.name,
        description,
        alternates: localeAlternates(locale, `/projects/${slug}`),
        openGraph: {
            title: project.name,
            description,
            url: localeUrl(locale, `/projects/${slug}`),
            images: [{ url: `/projects/${slug}/opengraph-image` }],
        },
    };
}

function packageUrl(p: PackageRef): string {
    switch (p.registry) {
        case "npm":
            return `https://www.npmjs.com/package/${p.name}`;
        case "pypi":
            return `https://pypi.org/project/${p.name}/`;
        case "crates":
            return `https://crates.io/crates/${p.name}`;
        case "vscode":
            return `https://marketplace.visualstudio.com/items?itemName=${p.name}`;
    }
}

function jsonLd(data: WithContext<SoftwareApplication> | WithContext<BreadcrumbList>): string {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}

function categoryToApplication(category: Project["category"]): string {
    switch (category) {
        case "library":
        case "tool":
            return "DeveloperApplication";
        default:
            return "WebApplication";
    }
}

export default async function ProjectPage({ params }: { params: Params }) {
    const { locale: paramLocale, slug } = await params;
    setRequestLocale(paramLocale);
    const project = getProject(slug);
    if (!project) notFound();

    const [locale, t] = await Promise.all([getLocale(), getTranslations("projects")]);
    const tagline = pick(project.tagline, locale);
    const paragraphs = pick(project.summary, locale).split(/\n\n+/);
    const years = project.years.to
        ? t("years", { from: project.years.from, to: project.years.to })
        : t("yearsNow", { from: project.years.from });
    const showRepos = project.visibility === "public" && (project.repos?.length ?? 0) > 0;
    const repos = showRepos ? (project.repos ?? []) : [];
    const related = (project.related ?? [])
        .map((r) => ({ ...r, project: getProject(r.slug) }))
        .filter((r): r is typeof r & { project: Project } => r.project !== undefined);

    const pageUrl = localeUrl(locale, `/projects/${slug}`);
    const website = liveWebsite(project);
    const install = installUrl(project);
    const download = downloadUrl(project);
    const shots = getShots(project.slug);
    const heroSrc = project.cover ?? shotSrc(project.slug, "desktop-dark");
    const software: WithContext<SoftwareApplication> = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: project.name,
        description: tagline,
        url: website ?? pageUrl,
        applicationCategory: categoryToApplication(project.category),
        operatingSystem: operatingSystems(project),
        author: { "@type": "Person", name: site.fullName, url: site.url },
        ...(install ? { installUrl: install } : {}),
        ...(download ? { downloadUrl: download } : {}),
        ...(showRepos
            ? { codeRepository: `https://github.com/${repos[0]?.owner}/${repos[0]?.name}` }
            : {}),
    };
    const breadcrumbs: WithContext<BreadcrumbList> = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: site.name, item: localeUrl(locale, "/") },
            {
                "@type": "ListItem",
                position: 2,
                name: t("title"),
                item: localeUrl(locale, "/projects"),
            },
            { "@type": "ListItem", position: 3, name: project.name, item: pageUrl },
        ],
    };

    return (
        <article className="container-x flex flex-col gap-10 py-12 md:py-16">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd(software) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
            />

            <Link
                href="/projects"
                className="link-inline w-fit gap-1.5 text-sm text-fg-muted hover:text-accent"
            >
                <ArrowLeft className="size-4" aria-hidden />
                {t("back")}
            </Link>

            <header className="grid gap-8 lg:grid-cols-[3fr_2fr] lg:items-end">
                <ViewTransition name={coverTransitionName(project.slug)}>
                    <div
                        className="rounded-card relative aspect-[16/10] overflow-hidden shadow-card lg:order-2"
                        style={{ background: coverGradient(project.hue) }}
                    >
                        {heroSrc ? (
                            <Image
                                src={heroSrc}
                                alt=""
                                fill
                                priority
                                sizes="(min-width: 1024px) 40vw, 100vw"
                                className="object-cover"
                            />
                        ) : (
                            <CoverArt project={project} className="absolute inset-0 size-full" />
                        )}
                        {heroSrc ? (
                            <span
                                aria-hidden
                                className="pointer-events-none absolute -right-3 bottom-2 select-none font-mono text-[clamp(3rem,10vw,7rem)] font-bold leading-none tracking-tight text-fg opacity-[0.08]"
                            >
                                {project.name}
                            </span>
                        ) : null}
                    </div>
                </ViewTransition>

                <div className="flex flex-col gap-5 lg:order-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant={statusVariant[project.status]}
                            dot={project.status === "live"}
                        >
                            {t(`status.${project.status}`)}
                        </Badge>
                        <Badge variant="neutral">{t(`category.${project.category}`)}</Badge>
                        {project.visibility === "private" ? (
                            <Badge variant="outline">{t("private")}</Badge>
                        ) : null}
                        {project.disclaimer ? (
                            <Badge variant="warning">{pick(project.disclaimer, locale)}</Badge>
                        ) : null}
                    </div>
                    <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-fg">
                        {project.name}
                    </h1>
                    <p className="text-lg text-fg-muted md:text-xl">{tagline}</p>
                    {project.teaser ? (
                        <p className="font-mono text-sm text-accent" data-testid="teaser">
                            {pick(project.teaser, locale)}
                        </p>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-fg-subtle">
                        <span>{years}</span>
                        {website ? (
                            <a
                                href={website}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-testid="visit-site"
                                className="link-inline gap-1 text-accent hover:underline"
                            >
                                {t("visitSite")}
                                <ExternalLink className="size-3.5" aria-hidden />
                            </a>
                        ) : null}
                        {repos.map((r) => (
                            <a
                                key={`${r.owner}/${r.name}`}
                                href={`https://github.com/${r.owner}/${r.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-inline gap-1 hover:text-fg"
                            >
                                {t("viewRepo")}: {r.label ?? r.name}
                                <ExternalLink className="size-3" aria-hidden />
                            </a>
                        ))}
                    </div>
                    {project.status === "paused" ? (
                        <p className="text-sm text-fg-muted" data-testid="paused-note">
                            {t("pausedNote")}
                        </p>
                    ) : null}
                    <StoreBadges project={project} />
                </div>
            </header>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-5 text-base leading-relaxed text-fg-muted md:text-lg">
                        {paragraphs.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>

                    <MetricsList project={project} locale={locale} />

                    {shots ? (
                        <DeviceShowcase
                            files={shots.files}
                            name={project.name}
                            capturedAt={shots.capturedAt}
                        />
                    ) : null}

                    {project.story ? (
                        <section
                            className="grid gap-4 md:grid-cols-3"
                            aria-label={`${t("story.problem")} · ${t("story.approach")} · ${t("story.outcome")}`}
                        >
                            {(["problem", "approach", "outcome"] as const).map((k) => (
                                <div
                                    key={k}
                                    className="rounded-card surface flex flex-col gap-2 p-5"
                                >
                                    <h2 className="font-mono text-[11px] uppercase tracking-wider text-accent">
                                        {t(`story.${k}`)}
                                    </h2>
                                    <p className="text-sm leading-relaxed text-fg-muted">
                                        {pick(project.story![k], locale)}
                                    </p>
                                </div>
                            ))}
                        </section>
                    ) : null}

                    <ListingsList project={project} locale={locale} />

                    {project.surfaces && project.surfaces.length > 0 ? (
                        <section className="flex flex-col gap-3">
                            <h2 className="font-mono text-[11px] uppercase tracking-wider text-fg-subtle">
                                {t("surfaces")}
                            </h2>
                            <ul className="grid gap-2 sm:grid-cols-2">
                                {project.surfaces.map((s) => {
                                    const url = liveSurfaceUrl(project, s);
                                    return (
                                        <li
                                            key={s.label}
                                            className="rounded-card surface flex items-center justify-between gap-3 px-4 py-3 text-sm"
                                        >
                                            <span className="text-fg">{s.label}</span>
                                            {url ? (
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="link-inline gap-1 font-mono text-xs text-accent hover:underline"
                                                >
                                                    {new URL(url).hostname}
                                                    <ExternalLink className="size-3" aria-hidden />
                                                </a>
                                            ) : null}
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ) : null}
                </div>

                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <div className="rounded-card surface flex flex-col gap-6 p-5">
                        {repos.length > 0 ? (
                            <section className="flex flex-col gap-3">
                                <h2 className="font-mono text-[11px] uppercase tracking-wider text-fg-subtle">
                                    {t("viewRepo")}
                                </h2>
                                <Suspense
                                    fallback={
                                        <div className="flex flex-col gap-3">
                                            <Skeleton className="h-4 w-2/3" />
                                            <Skeleton className="h-3 w-1/2" />
                                            <Skeleton className="h-1.5 w-full rounded-pill" />
                                        </div>
                                    }
                                >
                                    <RepoStatsPanel repos={repos} />
                                </Suspense>
                            </section>
                        ) : project.visibility === "private" ? (
                            <p className="text-xs text-fg-subtle">{t("privateNote")}</p>
                        ) : null}

                        <PlatformChips project={project} />

                        <section className="flex flex-col gap-3">
                            <h2 className="font-mono text-[11px] uppercase tracking-wider text-fg-subtle">
                                {t("stack")}
                            </h2>
                            <ul className="flex flex-wrap gap-1.5">
                                {project.stack.map((s) => (
                                    <li
                                        key={s}
                                        className="rounded-pill border border-line bg-surface-raised px-2 py-0.5 font-mono text-[11px] text-fg-muted"
                                    >
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {project.packages && project.packages.length > 0 ? (
                            <section className="flex flex-col gap-3">
                                <h2 className="font-mono text-[11px] uppercase tracking-wider text-fg-subtle">
                                    {t("packages")}
                                </h2>
                                <ul className="flex flex-col">
                                    {project.packages.map((p) => (
                                        <li key={`${p.registry}:${p.name}`}>
                                            <a
                                                href={packageUrl(p)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex min-h-7 items-center gap-1.5 font-mono text-xs text-fg hover:text-accent"
                                            >
                                                <span className="text-fg-subtle">{p.registry}</span>
                                                {p.name}
                                                <ExternalLink className="size-3" aria-hidden />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ) : null}

                        {related.length > 0 ? (
                            <section className="flex flex-col gap-3">
                                <h2 className="font-mono text-[11px] uppercase tracking-wider text-fg-subtle">
                                    {t("related")}
                                </h2>
                                <ul className="flex flex-col gap-1.5">
                                    {related.map((r) => (
                                        <li key={r.slug} className="text-sm">
                                            <span className="text-fg-subtle">
                                                {t(`relation.${r.relation}`)}:{" "}
                                            </span>
                                            <Link
                                                href={`/projects/${r.slug}`}
                                                className="link-inline text-fg hover:text-accent"
                                            >
                                                {r.project.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ) : null}
                    </div>
                </aside>
            </div>
        </article>
    );
}
