/**
 * Pure command parser for the command-center skin terminal (V3-06). No React, no DOM, no i18n
 * runtime: every user-visible sentence arrives in `labels` (built server-side with
 * getTranslations); command names and syntax stay literal because they are code.
 */

export const COMMANDS = [
    "help",
    "whoami",
    "ls",
    "projects",
    "ps",
    "open",
    "cd",
    "theme",
    "skin",
    "clear",
    "history",
] as const;

export type CommandName = (typeof COMMANDS)[number];

/** Commands that take an argument; Tab completion appends a space after them. */
const WITH_ARGS: readonly CommandName[] = ["ls", "open", "cd", "theme", "skin"];

export const PAGES = [
    "projects",
    "services",
    "about",
    "now",
    "uses",
    "press",
    "lab",
    "open-source",
    "newsletter",
    "contact",
] as const;

export type Page = (typeof PAGES)[number];

export type HelpKey =
    "help" | "whoami" | "projects" | "open" | "cd" | "theme" | "clear" | "history";

export interface CommandLabels {
    /** One description per help row. */
    help: Record<HelpKey, string>;
    /** Lines printed by `whoami`. */
    whoami: readonly string[];
    /** Templates: `{cmd}`, `{slug}`, `{page}`, `{id}`, `{target}` are replaced here. */
    notFound: string;
    noProject: string;
    noPage: string;
    noSkin: string;
    opening: string;
    historyEmpty: string;
}

export interface TermProject {
    slug: string;
    name: string;
    statusLabel: string;
    tagline: string;
}

export interface CommandContext {
    labels: CommandLabels;
    projects: readonly TermProject[];
    skins: readonly string[];
    /** Previously entered commands, oldest first (not including the current one). */
    history: readonly string[];
    /** Locale home path (`/` or `/ro`) used to build `?skin=` URLs. */
    homePath: string;
}

export type Tone = "default" | "muted" | "accent" | "error";

export interface OutLine {
    text: string;
    tone?: Tone;
}

export type Effect =
    | { kind: "clear" }
    | { kind: "navigate"; href: string }
    | { kind: "scroll"; id: string }
    | { kind: "reload"; href: string };

export interface CommandResult {
    lines: OutLine[];
    effect?: Effect;
}

export function format(template: string, vars: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}

function isCommand(word: string): word is CommandName {
    return (COMMANDS as readonly string[]).includes(word);
}

function isPage(word: string): word is Page {
    return (PAGES as readonly string[]).includes(word);
}

function table(rows: readonly (readonly string[])[], tone: Tone = "default"): OutLine[] {
    const widths: number[] = [];
    for (const row of rows) {
        row.forEach((cell, i) => {
            widths[i] = Math.max(widths[i] ?? 0, cell.length);
        });
    }
    return rows.map((row) => ({
        text: row
            .map((cell, i) => (i === row.length - 1 ? cell : cell.padEnd(widths[i] ?? 0)))
            .join("  "),
        tone,
    }));
}

function help(labels: CommandLabels): OutLine[] {
    const h = labels.help;
    return table([
        ["help", h.help],
        ["whoami", h.whoami],
        ["ls projects", h.projects],
        ["open <slug>", h.open],
        ["cd <page>", h.cd],
        ["skin <id>", h.theme],
        ["clear", h.clear],
        ["history", h.history],
    ]);
}

function listProjects(projects: readonly TermProject[]): OutLine[] {
    return table(projects.map((p) => [p.slug, p.statusLabel, p.tagline]));
}

function pageHref(page: Exclude<Page, "contact">): string {
    return `/${page}`;
}

/** Runs one input line. Empty input yields no lines and no effect. */
export function runCommand(raw: string, ctx: CommandContext): CommandResult {
    const [word = "", ...rest] = raw.trim().split(/\s+/);
    const cmd = word.toLowerCase();
    const arg = rest.join(" ");
    const { labels } = ctx;
    if (!cmd) return { lines: [] };
    if (!isCommand(cmd)) {
        return { lines: [{ text: format(labels.notFound, { cmd: word }), tone: "error" }] };
    }
    switch (cmd) {
        case "help":
            return { lines: help(labels) };
        case "whoami":
            return { lines: labels.whoami.map((text) => ({ text })) };
        case "projects":
        case "ps":
            return { lines: listProjects(ctx.projects) };
        case "ls":
            if (!arg) return { lines: [{ text: PAGES.join("  ") }] };
            if (arg.toLowerCase() === "projects") return { lines: listProjects(ctx.projects) };
            return { lines: [{ text: format(labels.noPage, { page: arg }), tone: "error" }] };
        case "open": {
            if (!arg) return { lines: [{ text: "usage: open <slug>", tone: "muted" }] };
            const project = ctx.projects.find((p) => p.slug === arg.toLowerCase());
            if (!project) {
                return {
                    lines: [{ text: format(labels.noProject, { slug: arg }), tone: "error" }],
                };
            }
            return {
                lines: [{ text: format(labels.opening, { target: project.name }), tone: "accent" }],
                effect: { kind: "navigate", href: `/projects/${project.slug}` },
            };
        }
        case "cd": {
            const page = arg.toLowerCase().replace(/^\/+/, "");
            if (!page) {
                return {
                    lines: [
                        { text: "usage: cd <page>", tone: "muted" },
                        { text: PAGES.join("  "), tone: "muted" },
                    ],
                };
            }
            if (!isPage(page)) {
                return { lines: [{ text: format(labels.noPage, { page: arg }), tone: "error" }] };
            }
            const opening: OutLine = {
                text: format(labels.opening, { target: page }),
                tone: "accent",
            };
            if (page === "contact")
                return { lines: [opening], effect: { kind: "scroll", id: "contact" } };
            return { lines: [opening], effect: { kind: "navigate", href: pageHref(page) } };
        }
        case "theme":
        case "skin": {
            const id = arg.toLowerCase();
            if (!id) {
                return {
                    lines: [
                        { text: `usage: ${cmd} <id>`, tone: "muted" },
                        { text: ctx.skins.join("  "), tone: "muted" },
                    ],
                };
            }
            if (!ctx.skins.includes(id)) {
                return { lines: [{ text: format(labels.noSkin, { id: arg }), tone: "error" }] };
            }
            return {
                lines: [{ text: format(labels.opening, { target: id }), tone: "accent" }],
                effect: { kind: "reload", href: `${ctx.homePath}?skin=${id}` },
            };
        }
        case "clear":
            return { lines: [], effect: { kind: "clear" } };
        case "history":
            if (ctx.history.length === 0) {
                return { lines: [{ text: labels.historyEmpty, tone: "muted" }] };
            }
            return {
                lines: ctx.history.map((entry, i) => ({
                    text: `${String(i + 1).padStart(4)}  ${entry}`,
                    tone: "muted",
                })),
            };
    }
}

function commonPrefix(words: readonly string[]): string {
    const [first = "", ...others] = words;
    let prefix = first;
    for (const w of others) {
        while (!w.startsWith(prefix)) prefix = prefix.slice(0, -1);
    }
    return prefix;
}

export interface Completion {
    /** The new input value. */
    value: string;
    /** All candidates when the completion is ambiguous (empty when unique or none). */
    options: string[];
}

function argPool(cmd: string, ctx: Pick<CommandContext, "projects" | "skins">): readonly string[] {
    switch (cmd) {
        case "open":
            return ctx.projects.map((p) => p.slug);
        case "cd":
            return PAGES;
        case "theme":
        case "skin":
            return ctx.skins;
        case "ls":
            return ["projects"];
        default:
            return [];
    }
}

/** Tab completion for command names and for the first argument (slugs, pages, skins). */
export function complete(
    input: string,
    ctx: Pick<CommandContext, "projects" | "skins">,
): Completion {
    const lead = input.match(/^\s*/)?.[0] ?? "";
    const body = input.slice(lead.length);
    const space = body.indexOf(" ");
    let head: string;
    let partial: string;
    let pool: readonly string[];
    if (space === -1) {
        head = lead;
        partial = body.toLowerCase();
        pool = COMMANDS;
    } else {
        const cmd = body.slice(0, space).toLowerCase();
        const after = body.slice(space + 1).replace(/^\s+/, "");
        if (after.includes(" ")) return { value: input, options: [] };
        head = `${lead}${cmd} `;
        partial = after.toLowerCase();
        pool = argPool(cmd, ctx);
    }
    const matches = pool.filter((c) => c.startsWith(partial));
    const [only] = matches;
    if (only === undefined) return { value: input, options: [] };
    if (matches.length === 1) {
        const suffix = space === -1 && isCommand(only) && WITH_ARGS.includes(only) ? " " : "";
        return { value: `${head}${only}${suffix}`, options: [] };
    }
    return { value: `${head}${commonPrefix(matches)}`, options: matches };
}
