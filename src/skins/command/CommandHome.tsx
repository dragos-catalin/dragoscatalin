import { getLocale, getTranslations } from "next-intl/server";
import { ContactSection } from "@/components/contact/ContactSection";
import { ButtonLink } from "@/components/ui";
import { projects } from "@/data/projects";
import type { ProjectStatus } from "@/data/types";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { SKINS } from "@/skins/registry";
import { backToClassicHref } from "@/skins/shared/nav";
import { teaserProjects } from "@/skins/shared/projects";
import pkg from "../../../package.json";
import type { HelpKey } from "./commands";
import { Terminal, type TerminalLabels } from "./Terminal";
import { Uptime } from "./Uptime";

const HELP_KEYS: readonly HelpKey[] = [
    "help",
    "whoami",
    "projects",
    "open",
    "cd",
    "theme",
    "clear",
    "history",
];

/**
 * Command-center home: a `whoami` terminal with an interactive prompt (V3-06), a live system
 * monitor strip and a process table of projects. Everything but the prompt and the uptime is
 * server-rendered, so the page is complete without JS.
 */
export async function CommandHome() {
    const locale = (await getLocale()) as Locale;
    const t = await getTranslations("hero");
    const ts = await getTranslations("skins");
    const tp = await getTranslations("projects");
    const items = teaserProjects(8);
    const host = new URL(site.url).host;
    const homePath = backToClassicHref(locale).split("?")[0] ?? "/";

    const counts = new Map<ProjectStatus, number>();
    for (const p of projects) counts.set(p.status, (counts.get(p.status) ?? 0) + 1);

    const help = Object.fromEntries(HELP_KEYS.map((k) => [k, ts(`command.help.${k}`)])) as Record<
        HelpKey,
        string
    >;
    const labels: TerminalLabels = {
        help,
        whoami: [t("eyebrow"), t("subtitle")],
        notFound: ts.raw("command.notFound") as string,
        noProject: ts.raw("command.noProject") as string,
        noPage: ts.raw("command.noPage") as string,
        noSkin: ts.raw("command.noSkin") as string,
        opening: ts.raw("command.opening") as string,
        historyEmpty: ts("command.historyEmpty"),
        inputLabel: ts("command.inputLabel"),
        placeholder: ts("command.placeholder"),
        shortcut: ts("command.shortcut"),
    };
    const termProjects = projects.map((p) => ({
        slug: p.slug,
        name: p.name,
        statusLabel: tp(`status.${p.status}`),
        tagline: p.tagline[locale],
    }));

    return (
        <>
            <section aria-labelledby="cmd-title" className="py-12 md:py-20">
                <div className="container-x">
                    <div className="cmd-panel overflow-hidden shadow-elev-2">
                        <div className="cmd-bar flex items-center gap-2 px-4 py-2 text-xs text-fg-muted">
                            <span aria-hidden="true" className="size-2.5 rounded-full bg-danger" />
                            <span aria-hidden="true" className="size-2.5 rounded-full bg-warning" />
                            <span aria-hidden="true" className="size-2.5 rounded-full bg-success" />
                            <span className="ml-2">{host}</span>
                        </div>
                        <div className="flex flex-col gap-6 p-5 md:p-8">
                            <p className="text-sm text-fg-muted">
                                <span className="text-accent">~</span> ${" "}
                                <span className="text-fg">{ts("command.prompt")}</span>
                            </p>
                            <h1
                                id="cmd-title"
                                className="font-mono text-3xl leading-tight font-bold tracking-tight text-balance text-fg sm:text-4xl md:text-6xl"
                            >
                                <span className="block">{t("titleLine1")}</span>
                                <span className="block text-accent">
                                    {t("titleLine2")}
                                    <span aria-hidden="true" className="cmd-cursor" />
                                </span>
                            </h1>
                            <p className="max-w-3xl text-sm leading-relaxed text-pretty text-fg-muted md:text-base">
                                <span className="text-fg-subtle"># </span>
                                {t("subtitle")}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <ButtonLink href="/projects" variant="primary">
                                    {t("ctaProjects")}
                                </ButtonLink>
                                <ButtonLink href="#contact" variant="secondary">
                                    {t("ctaContact")}
                                </ButtonLink>
                            </div>
                            <p className="text-xs text-fg-muted">
                                <kbd className="cmd-kbd">Tab</kbd> /{" "}
                                <kbd className="cmd-kbd">Enter</kbd> — {ts("command.hint")}
                            </p>
                            <Terminal
                                labels={labels}
                                projects={termProjects}
                                skins={SKINS}
                                homePath={homePath}
                                user="~"
                            />
                        </div>
                        <div
                            role="group"
                            aria-label={ts("command.monitor.title")}
                            className="cmd-monitor flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 text-xs text-fg-muted"
                        >
                            <p>
                                {ts("command.monitor.uptime")} <Uptime />
                            </p>
                            <p>
                                {ts("command.monitor.build")}{" "}
                                <span className="text-fg">v{pkg.version}</span>
                            </p>
                            <p>
                                {ts("command.monitor.projects")}{" "}
                                <span className="text-fg">{projects.length}</span>
                            </p>
                            <ul className="flex flex-wrap gap-x-4 gap-y-1">
                                {[...counts].map(([status, n]) => (
                                    <li key={status}>
                                        <span
                                            className={cn(
                                                status === "live" ? "text-success" : "text-fg",
                                            )}
                                        >
                                            {n}
                                        </span>{" "}
                                        {tp(`status.${status}`)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section aria-labelledby="cmd-ps" className="pb-16 md:pb-24">
                <div className="container-x">
                    <div className="cmd-panel overflow-hidden">
                        <div className="cmd-bar flex items-center justify-between gap-4 px-4 py-3">
                            <h2 id="cmd-ps" className="text-sm font-bold text-fg">
                                <span className="text-accent">$</span> ps —{" "}
                                {ts("command.processes")}
                            </h2>
                            <Link
                                href="/projects"
                                className="link-inline text-xs font-medium text-accent hover:underline"
                            >
                                {ts("allProjects")}
                            </Link>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs text-fg-muted uppercase">
                                <tr>
                                    <th scope="col" className="px-4 py-2 font-medium">
                                        {ts("command.colName")}
                                    </th>
                                    <th scope="col" className="px-4 py-2 font-medium">
                                        {ts("command.colStatus")}
                                    </th>
                                    <th
                                        scope="col"
                                        className="hidden px-4 py-2 font-medium md:table-cell"
                                    >
                                        {ts("command.colStack")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((p) => (
                                    <tr key={p.slug} className="cmd-row">
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/projects/${p.slug}`}
                                                className="inline-flex min-h-11 flex-col justify-center"
                                            >
                                                <span className="font-bold text-fg">{p.name}</span>
                                                <span className="text-xs text-fg-muted">
                                                    {p.tagline[locale]}
                                                </span>
                                            </Link>
                                        </td>
                                        <td
                                            className={cn(
                                                "px-4 py-3 text-xs whitespace-nowrap",
                                                p.status === "live"
                                                    ? "text-success"
                                                    : "text-fg-muted",
                                            )}
                                        >
                                            {tp(`status.${p.status}`)}
                                        </td>
                                        <td className="hidden px-4 py-3 text-xs text-fg-muted md:table-cell">
                                            {p.stack.slice(0, 4).join(" · ")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <ContactSection />
        </>
    );
}
