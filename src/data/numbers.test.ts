import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import ro from "../../messages/ro.json";
import { horae } from "./horae";
import {
    CAREER,
    headlineNumbers,
    measured,
    platformsCovered,
    shippedProjects,
    storeListingCount,
} from "./numbers";
import { now } from "./now";
import { labIdeas } from "./lab";
import { allPackages, getProject, projects } from "./projects";
import type { Project } from "./types";
import { STORE_HOSTS } from "@/lib/project-links";
import { site } from "@/lib/site";

const base: Project = {
    slug: "x",
    name: "X",
    tagline: { en: "x", ro: "x" },
    summary: { en: "x", ro: "x" },
    status: "live",
    category: "product",
    visibility: "public",
    years: { from: 2020 },
    stack: [],
};

describe("registry-derived numbers", () => {
    it("count shipped projects by status (live, maintenance, launching)", () => {
        const list: Project[] = [
            { ...base, slug: "a", status: "live" },
            { ...base, slug: "b", status: "maintenance" },
            { ...base, slug: "c", status: "launching" },
            { ...base, slug: "d", status: "active" },
            { ...base, slug: "e", status: "paused" },
        ];
        expect(shippedProjects(list).map((p) => p.slug)).toEqual(["a", "b", "c"]);
    });

    it("count distinct platforms", () => {
        const list: Project[] = [
            { ...base, platforms: ["web", "android"] },
            { ...base, platforms: ["android", "wear-os"] },
        ];
        expect(platformsCovered(list)).toEqual(["web", "android", "wear-os"]);
    });

    it("count app-store links and listed items, not package registries or developer pages", () => {
        const list: Project[] = [
            {
                ...base,
                stores: [
                    { store: "ms-store", url: "https://apps.microsoft.com/detail/1" },
                    { store: "npm", url: "https://www.npmjs.com/package/x" },
                    {
                        store: "play",
                        url: "https://play.google.com/store/apps/developer?id=Me",
                    },
                ],
                listings: [
                    { name: "a", store: "play", url: "https://play.google.com/a" },
                    { name: "b", store: "play", url: "https://play.google.com/b" },
                ],
            },
        ];
        expect(storeListingCount(list)).toBe(3);
    });

    it("the real registry includes every live Horae face in the store count", () => {
        expect(storeListingCount()).toBeGreaterThanOrEqual(horae.live);
        const values = Object.fromEntries(headlineNumbers().map((n) => [n.key, n.value]));
        expect(values.projects).toBe(projects.length);
        expect(values.packages).toBe(allPackages.length);
        expect(values.commits).toBe(measured.commits.total);
        for (const v of Object.values(values)) expect(v).toBeGreaterThan(0);
    });

    it("career floors match the owner profile (V3-34)", () => {
        expect(CAREER).toEqual({ codeYears: 20, paidYears: 15 });
    });
});

describe("measured.json (pnpm measure:repos)", () => {
    it("is dated, explains its method and has sane totals", () => {
        expect(measured.measuredAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(measured.method.length).toBeGreaterThan(40);
        expect(measured.repos).toBeGreaterThan(0);
        expect(measured.commits.reposWithCommits).toBeLessThanOrEqual(measured.repos);
    });

    it("languages are sorted by share, unique, and shares add up to ~100 %", () => {
        const names = measured.languages.map((l) => l.name);
        expect(new Set(names).size).toBe(names.length);
        const shares = measured.languages.map((l) => l.share);
        expect(shares).toEqual([...shares].sort((a, b) => b - a));
        const sum = shares.reduce((s, x) => s + x, 0);
        expect(sum).toBeGreaterThan(99);
        expect(sum).toBeLessThan(101);
    });

    it("also-worked-with entries are evidenced and not already a measured language", () => {
        for (const a of measured.alsoWorkedWith) {
            expect(a.repos).toBeGreaterThan(0);
            expect(measured.languages.map((l) => l.name)).not.toContain(a.name);
        }
    });
});

describe("now focus", () => {
    it("now.focus exists in both locales, is dated and names only known projects and lab ideas", () => {
        expect(en.now.focus.length).toBeGreaterThan(20);
        expect(ro.now.focus.length).toBeGreaterThan(20);
        expect(ro.now.focus).toMatch(/[șțăîâ]/);
        for (const slug of now.projects) {
            const name = getProject(slug)?.name ?? slug;
            expect(en.now.focus, slug).toContain(name);
            expect(ro.now.focus, slug).toContain(name);
        }
        expect(now.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        for (const slug of now.projects) expect(getProject(slug), slug).toBeDefined();
        for (const id of now.lab)
            expect(
                labIdeas.some((i) => i.id === id),
                id,
            ).toBe(true);
    });
});

describe("site brands and store profiles", () => {
    it("brands are registry products that are not paused and use the project website", () => {
        for (const b of site.brands) {
            const p = getProject(b.slug);
            expect(p, b.slug).toBeDefined();
            expect(p?.status).not.toBe("paused");
            expect(p?.website).toBe(b.url);
        }
    });

    it("store profiles are https URLs on each store's own host", () => {
        for (const s of site.storeProfiles) {
            const u = new URL(s.url);
            expect(u.protocol).toBe("https:");
            expect(STORE_HOSTS[s.store]).toContain(u.hostname);
        }
        expect(site.storeProfiles.some((s) => s.store === "play")).toBe(true);
        expect(site.storeProfiles.some((s) => s.store === "ms-store")).toBe(true);
        expect(site.storeProfiles.some((s) => s.store === "vscode-marketplace")).toBe(true);
    });

    it("the Microsoft Store app pages are the ones the registry lists", () => {
        const registry = projects.flatMap((p) => p.stores ?? []).map((s) => s.url);
        for (const s of site.storeProfiles.filter((x) => x.store === "ms-store"))
            expect(registry).toContain(s.url);
    });
});
