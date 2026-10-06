import { describe, expect, it } from "vitest";
import { type CommandContext, complete, format, runCommand } from "./commands";

const ctx: CommandContext = {
    labels: {
        help: {
            help: "show help",
            whoami: "who I am",
            projects: "list projects",
            open: "open a project",
            cd: "go to a page",
            theme: "switch skin",
            clear: "clear screen",
            history: "show history",
        },
        whoami: ["Product engineer", "Builds things"],
        notFound: "command not found: {cmd} — try help",
        noProject: "no such project: {slug}",
        noPage: "no such page: {page}",
        noSkin: "no such skin: {id}",
        opening: "opening {target}…",
        historyEmpty: "no history yet",
    },
    projects: [
        { slug: "codai", name: "Codai", statusLabel: "Live", tagline: "AI gateway" },
        { slug: "brivio", name: "Brivio", statusLabel: "Launching", tagline: "Invoicing" },
        { slug: "brivio-sdk", name: "Brivio SDK", statusLabel: "Live", tagline: "SDK" },
    ],
    skins: ["classic", "command", "editorial"],
    history: [],
    homePath: "/ro",
};

const texts = (raw: string, c: CommandContext = ctx) => runCommand(raw, c).lines.map((l) => l.text);

describe("runCommand", () => {
    it("help lists every command with its translated description", () => {
        const out = texts("help");
        expect(out).toHaveLength(8);
        expect(out.some((l) => l.startsWith("open <slug>") && l.endsWith("open a project"))).toBe(
            true,
        );
        expect(out.some((l) => l.includes("cd <page>"))).toBe(true);
    });

    it("unknown commands print the not-found template with the typed word", () => {
        const result = runCommand("sudo rm -rf", ctx);
        expect(result.lines).toEqual([
            { text: "command not found: sudo — try help", tone: "error" },
        ]);
        expect(result.effect).toBeUndefined();
    });

    it("empty input does nothing", () => {
        expect(runCommand("   ", ctx)).toEqual({ lines: [] });
    });

    it("whoami prints the bio lines", () => {
        expect(texts("whoami")).toEqual(["Product engineer", "Builds things"]);
    });

    it("ls projects / projects list slug, status and tagline", () => {
        expect(texts("ls projects")).toEqual(texts("projects"));
        expect(texts("projects")[0]).toMatch(/^codai\s+Live\s+AI gateway$/);
    });

    it("open <slug> navigates to the project page", () => {
        const result = runCommand("open Brivio", ctx);
        expect(result.effect).toEqual({ kind: "navigate", href: "/projects/brivio" });
        expect(result.lines[0]?.text).toBe("opening Brivio…");
    });

    it("open with an unknown slug is an error without navigation", () => {
        const result = runCommand("open nope", ctx);
        expect(result.effect).toBeUndefined();
        expect(result.lines[0]).toEqual({ text: "no such project: nope", tone: "error" });
    });

    it("cd navigates to pages and scrolls to contact", () => {
        expect(runCommand("cd services", ctx).effect).toEqual({
            kind: "navigate",
            href: "/services",
        });
        expect(runCommand("cd /open-source", ctx).effect).toEqual({
            kind: "navigate",
            href: "/open-source",
        });
        expect(runCommand("cd contact", ctx).effect).toEqual({ kind: "scroll", id: "contact" });
        expect(runCommand("cd moon", ctx).effect).toBeUndefined();
        expect(texts("cd moon")).toEqual(["no such page: moon"]);
    });

    it("skin/theme reload the locale home with ?skin=", () => {
        expect(runCommand("skin editorial", ctx).effect).toEqual({
            kind: "reload",
            href: "/ro?skin=editorial",
        });
        expect(runCommand("theme classic", ctx).effect?.kind).toBe("reload");
        expect(runCommand("skin neon", ctx).effect).toBeUndefined();
    });

    it("clear emits the clear effect", () => {
        expect(runCommand("clear", ctx)).toEqual({ lines: [], effect: { kind: "clear" } });
    });

    it("history numbers previous commands, or says it is empty", () => {
        expect(texts("history")).toEqual(["no history yet"]);
        const out = texts("history", { ...ctx, history: ["help", "ls projects"] });
        expect(out).toEqual(["   1  help", "   2  ls projects"]);
    });
});

describe("complete", () => {
    it("completes a unique command and adds a space when it takes an argument", () => {
        expect(complete("he", ctx)).toEqual({ value: "help", options: [] });
        expect(complete("op", ctx)).toEqual({ value: "open ", options: [] });
    });

    it("returns candidates and the common prefix when ambiguous", () => {
        expect(complete("h", ctx)).toEqual({ value: "h", options: ["help", "history"] });
        expect(complete("c", ctx)).toEqual({ value: "c", options: ["cd", "clear"] });
    });

    it("completes slugs after open, pages after cd and skins after skin", () => {
        expect(complete("open co", ctx)).toEqual({ value: "open codai", options: [] });
        expect(complete("open bri", ctx)).toEqual({
            value: "open brivio",
            options: ["brivio", "brivio-sdk"],
        });
        expect(complete("cd ser", ctx).value).toBe("cd services");
        expect(complete("skin ed", ctx).value).toBe("skin editorial");
    });

    it("leaves input untouched when nothing matches", () => {
        expect(complete("zzz", ctx)).toEqual({ value: "zzz", options: [] });
        expect(complete("open zzz", ctx)).toEqual({ value: "open zzz", options: [] });
    });
});

describe("format", () => {
    it("replaces known placeholders and keeps unknown ones", () => {
        expect(format("{a}-{b}", { a: "x" })).toBe("x-{b}");
    });
});
