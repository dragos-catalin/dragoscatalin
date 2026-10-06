import { describe, expect, it } from "vitest";
import { buildTimeline, timelineRange, timelineSpan } from "./timeline";
import { archiveTimeline, projects } from "./projects";
import type { Project } from "./types";

const p = (slug: string, from: number, to?: number): Project => ({
    slug,
    name: slug.toUpperCase(),
    tagline: { en: `${slug} en`, ro: `${slug} ro` },
    summary: { en: "x", ro: "x" },
    status: "live",
    category: "product",
    visibility: "public",
    years: to === undefined ? { from } : { from, to },
    stack: [],
});

describe("timeline from registry years", () => {
    it("range comes from project years (incl. `to`) and the archive, nothing hardcoded", () => {
        expect(timelineRange([p("a", 2019, 2031), p("b", 2012)], [])).toEqual({
            first: 2012,
            last: 2031,
        });
        expect(
            timelineRange([p("a", 2020)], [{ year: 2008, name: "old", note: { en: "", ro: "" } }]),
        ).toEqual({ first: 2008, last: 2020 });
    });

    it("lists years newest first, skips empty years, puts projects on their start year", () => {
        const out = buildTimeline("ro", [p("a", 2018), p("b", 2020), p("c", 2020)], []);
        expect(out.map((y) => y.year)).toEqual([2020, 2018]);
        expect(out[0]?.entries.map((e) => e.slug)).toEqual(["b", "c"]);
        expect(out[0]?.entries[0]?.note).toBe("b ro");
    });

    it("the real registry: every project appears exactly once, span matches the data", () => {
        const out = buildTimeline("en");
        const slugs = out.flatMap((y) => y.entries.flatMap((e) => (e.slug ? [e.slug] : [])));
        expect(slugs.sort()).toEqual(projects.map((x) => x.slug).sort());
        const { first, last } = timelineRange();
        expect(out[0]?.year).toBe(last);
        expect(out.at(-1)?.year).toBe(first);
        expect(timelineSpan()).toBe(last - first);
        expect(first).toBe(
            Math.min(...projects.map((x) => x.years.from), ...archiveTimeline.map((a) => a.year)),
        );
    });
});
