import { describe, expect, it } from "vitest";
import { featuredProjects, getProject, projects } from "./projects";
import { liveSurfaces, liveWebsite, PLATFORMS, storeUrlIsValid } from "@/lib/project-links";

/** Public mirrors that a private (case-study) project is allowed to link to. */
const PRIVATE_REPO_ALLOWLIST = [
    "dragoscv/brivio-releases",
    "brivio-ro/brivio-sdk-php",
    "brivio-ro/brivio-sdk-go",
];

/** Sites that answered 402 (hosting not paid) on 2026-10-06 — must stay paused until they return. */
const PAUSED = ["vsrchat", "notai", "metu"];

describe("project registry", () => {
    it("has unique slugs", () => {
        const slugs = projects.map((p) => p.slug);
        const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
        expect(dupes, `duplicate slugs: ${dupes.join(", ")}`).toEqual([]);
    });

    it("uses kebab-case slugs", () => {
        const bad = projects
            .map((p) => p.slug)
            .filter((s) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s));
        expect(bad, `non-kebab slugs: ${bad.join(", ")}`).toEqual([]);
    });

    it("has non-empty tagline and summary in both locales", () => {
        const missing: string[] = [];
        for (const p of projects) {
            for (const field of ["tagline", "summary"] as const) {
                for (const loc of ["en", "ro"] as const) {
                    if (!p[field][loc]?.trim()) missing.push(`${p.slug}.${field}.${loc}`);
                }
            }
        }
        expect(missing, `missing localized text: ${missing.join(", ")}`).toEqual([]);
    });

    it("private projects only link public mirror repos", () => {
        const offenders: string[] = [];
        for (const p of projects.filter((p) => p.visibility === "private")) {
            for (const r of p.repos ?? []) {
                const full = `${r.owner}/${r.name}`;
                if (!PRIVATE_REPO_ALLOWLIST.includes(full)) offenders.push(`${p.slug} → ${full}`);
            }
        }
        expect(
            offenders,
            `private project links a non-allowlisted repo: ${offenders.join(", ")}`,
        ).toEqual([]);
    });

    it("every related slug points at an existing project", () => {
        const slugs = new Set(projects.map((p) => p.slug));
        const dangling = projects.flatMap((p) =>
            (p.related ?? []).filter((r) => !slugs.has(r.slug)).map((r) => `${p.slug} → ${r.slug}`),
        );
        expect(dangling, `dangling related slugs: ${dangling.join(", ")}`).toEqual([]);
    });

    it("featured projects define an order", () => {
        const featured = projects.filter((p) => p.featured);
        expect(featured.length).toBeGreaterThan(0);
        const noOrder = featured.filter((p) => typeof p.order !== "number").map((p) => p.slug);
        expect(noOrder, `featured without order: ${noOrder.join(", ")}`).toEqual([]);
        expect(featuredProjects.map((p) => p.order)).toEqual(
            [...featuredProjects].map((p) => p.order).sort((a, b) => (a ?? 99) - (b ?? 99)),
        );
    });

    it("getProject resolves known slugs and rejects unknown ones", () => {
        expect(getProject("codai")?.slug).toBe("codai");
        expect(getProject("nope")).toBeUndefined();
    });

    it("paused projects never expose their site as a live link", () => {
        for (const slug of PAUSED) expect(getProject(slug)?.status, slug).toBe("paused");
        for (const p of projects.filter((p) => p.status === "paused")) {
            expect(liveWebsite(p), p.slug).toBeUndefined();
            const siteHost = p.website ? new URL(p.website).hostname : null;
            for (const s of liveSurfaces(p))
                if (s.url && siteHost) expect(new URL(s.url).hostname, p.slug).not.toBe(siteHost);
        }
    });

    it("store URLs are https and on their store's host", () => {
        const bad = projects.flatMap((p) =>
            [...(p.stores ?? []), ...(p.listings ?? [])]
                .filter((s) => !storeUrlIsValid(s))
                .map((s) => `${p.slug} → ${s.store} ${s.url}`),
        );
        expect(bad, `invalid store URLs: ${bad.join(", ")}`).toEqual([]);
    });

    it("platforms are known and unique", () => {
        for (const p of projects) {
            const list = p.platforms ?? [];
            expect(new Set(list).size, p.slug).toBe(list.length);
            for (const x of list) expect(PLATFORMS, `${p.slug}: ${x}`).toContain(x);
        }
    });

    it("metrics have localized labels, a value and an https source when given", () => {
        for (const p of projects)
            for (const m of p.metrics ?? []) {
                expect(m.label.en.trim() && m.label.ro.trim(), p.slug).toBeTruthy();
                expect(m.value.trim(), p.slug).not.toBe("");
                if (m.source) expect(m.source, p.slug).toMatch(/^https:\/\//);
                if (m.asOf) expect(m.asOf, p.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            }
    });

    it("websites and surface URLs are https", () => {
        const bad = projects.flatMap((p) =>
            [p.website, ...(p.surfaces ?? []).map((s) => s.url)]
                .filter((u): u is string => typeof u === "string" && !u.startsWith("https://"))
                .map((u) => `${p.slug} → ${u}`),
        );
        expect(bad).toEqual([]);
    });

    it("lists the projects added in V3-13", () => {
        for (const slug of [
            "horae",
            "scrin",
            "marcai",
            "alegeri2025",
            "unscroll",
            "just-black-2",
            "prakter",
        ])
            expect(getProject(slug), slug).toBeDefined();
        expect(getProject("codai")?.stores?.some((s) => s.store === "ms-store")).toBe(true);
        expect(getProject("codai")?.platforms).toContain("wear-os");
    });
});
