import { Suspense } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge, ButtonLink, Section } from "@/components/ui";
import { allPackages } from "@/data/projects";
import type { PackageRef } from "@/data/types";
import { fetchPackageStats } from "@/lib/github";

function fallbackUrl(p: PackageRef) {
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

/** Streams in behind the static list so the registry round-trip never blocks paint. */
async function PackageLive({ pkg, locale }: { pkg: PackageRef; locale: string }) {
    const t = await getTranslations("openSource");
    const stats = await fetchPackageStats([pkg]);
    const s = stats[`${pkg.registry}:${pkg.name}`];
    if (!s) return null;
    return (
        <>
            {s.weeklyDownloads != null ? (
                <span className="inline-flex items-center gap-1 font-mono text-xs text-fg-muted">
                    <Download className="size-3.5" aria-hidden="true" />
                    {t("weekly", { count: s.weeklyDownloads.toLocaleString(locale) })}
                </span>
            ) : null}
            {s.version ? (
                <Badge variant="outline">{t("version", { version: s.version })}</Badge>
            ) : null}
        </>
    );
}

export async function OpenSourceStrip() {
    const locale = await getLocale();
    const t = await getTranslations("openSource");
    const tc = await getTranslations("common");

    return (
        <Section
            id="open-source"
            eyebrow={t("eyebrow")}
            title={t("title")}
            subtitle={t("subtitle")}
            action={
                <ButtonLink href="/open-source" variant="secondary">
                    {t("viewAll")}
                </ButtonLink>
            }
        >
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2" aria-label={t("packages")}>
                {allPackages.map((p) => {
                    const key = `${p.registry}:${p.name}`;
                    const url = fallbackUrl(p);
                    return (
                        <li
                            key={key}
                            className="surface rounded-card flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 shadow-elev-1 transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-elev-2"
                        >
                            <span className="w-14 shrink-0 font-mono text-[11px] tracking-[0.16em] text-fg-subtle uppercase">
                                {p.registry}
                            </span>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-inline gap-1 font-mono text-sm font-medium text-fg no-underline hover:text-accent"
                            >
                                {p.name}
                                <ArrowUpRight
                                    className="size-3.5 text-fg-subtle"
                                    aria-hidden="true"
                                />
                                <span className="sr-only">{tc("external")}</span>
                            </a>
                            <span className="ml-auto flex items-center gap-3">
                                <Suspense fallback={null}>
                                    <PackageLive pkg={p} locale={locale} />
                                </Suspense>
                            </span>
                        </li>
                    );
                })}
            </ul>
        </Section>
    );
}
