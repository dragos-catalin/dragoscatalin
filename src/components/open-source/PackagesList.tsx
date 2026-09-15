import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui";
import { allPackages, projects } from "@/data/projects";
import { fetchPackageStats } from "@/lib/github";

export async function PackagesList({ locale }: { locale: string }) {
    const t = await getTranslations({ locale, namespace: "openSource" });
    const stats = await fetchPackageStats(allPackages);
    const numberFmt = new Intl.NumberFormat(locale, { notation: "compact" });

    const rows = allPackages.map((pkg) => {
        const key = `${pkg.registry}:${pkg.name}`;
        const owner = projects.find((p) =>
            p.packages?.some((x) => x.registry === pkg.registry && x.name === pkg.name),
        );
        return { pkg, key, stat: stats[key], owner };
    });

    return (
        <div className="surface rounded-card overflow-hidden">
            <div className="hidden grid-cols-[6rem_1fr_7rem_8rem_10rem] gap-4 border-b border-line px-5 py-2 font-mono text-xs uppercase tracking-wide text-fg-subtle sm:grid">
                <span>{t("registry")}</span>
                <span>{t("package")}</span>
                <span>{t("latest")}</span>
                <span>{t("downloads")}</span>
                <span>{t("owner")}</span>
            </div>
            <ul className="divide-y divide-line">
                {rows.map(({ pkg, key, stat, owner }) => {
                    const url =
                        stat?.url ??
                        (pkg.registry === "npm"
                            ? `https://www.npmjs.com/package/${pkg.name}`
                            : `https://pypi.org/project/${pkg.name}/`);
                    return (
                        <li
                            key={key}
                            className="grid gap-2 px-5 py-3 text-sm sm:grid-cols-[6rem_1fr_7rem_8rem_10rem] sm:items-center sm:gap-4"
                        >
                            <Badge variant="outline">{pkg.registry}</Badge>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-fg hover:text-accent"
                            >
                                {pkg.name}
                                <ArrowUpRight className="size-3.5 text-fg-subtle" aria-hidden />
                            </a>
                            <span className="font-mono text-fg-muted">
                                {stat?.version ? t("version", { version: stat.version }) : "—"}
                            </span>
                            <span className="font-mono text-fg-muted">
                                {stat?.weeklyDownloads != null
                                    ? t("weekly", { count: numberFmt.format(stat.weeklyDownloads) })
                                    : "—"}
                            </span>
                            <span className="text-fg-muted">
                                {owner ? (
                                    <Link
                                        href={`/projects/${owner.slug}`}
                                        className="hover:text-accent"
                                    >
                                        {owner.name}
                                    </Link>
                                ) : (
                                    "—"
                                )}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
