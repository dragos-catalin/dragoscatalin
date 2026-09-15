import { describe, expect, it } from "vitest";
import { featuredProjects, getProject, projects } from "./projects";

/** Public mirrors that a private (case-study) project is allowed to link to. */
const PRIVATE_REPO_ALLOWLIST = [
    "dragoscv/brivio-releases",
    "brivio-ro/brivio-sdk-php",
    "brivio-ro/brivio-sdk-go",
];

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
});
