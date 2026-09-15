import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {} }));

import { getProject, projects } from "@/data/projects";
import type { RepoStats } from "@/data/types";
import { API_HEADERS, json, toApiProject } from "./projects-api";
import { site } from "./site";

const stats = (owner: string, name: string): RepoStats => ({
    owner,
    name,
    url: `https://github.com/${owner}/${name}`,
    stars: 1,
    forks: 0,
    pushedAt: "2026-01-01T00:00:00Z",
    description: null,
    homepage: null,
    license: null,
    languages: [],
    latestRelease: null,
    releaseCount: 0,
    isArchived: false,
});

describe("toApiProject", () => {
    it("exposes GitHub URLs and stats only for public projects", () => {
        const pub = projects.find((p) => p.visibility === "public" && p.repos?.length)!;
        const r = pub.repos![0]!;
        const out = toApiProject(pub, { [`${r.owner}/${r.name}`]: stats(r.owner, r.name) });
        expect(out.url).toBe(`${site.url}/projects/${pub.slug}`);
        expect(out.repos[0]).toMatchObject({
            owner: r.owner,
            name: r.name,
            url: `https://github.com/${r.owner}/${r.name}`,
        });
        expect(out.repos[0]?.stats?.stars).toBe(1);
    });

    it("omits repo urls for private projects but keeps owner/name", () => {
        const brivio = getProject("brivio")!;
        expect(brivio.visibility).toBe("private");
        const out = toApiProject(brivio, {});
        expect(out.repos.length).toBeGreaterThan(0);
        for (const r of out.repos) {
            expect(r).not.toHaveProperty("url");
            expect(r).not.toHaveProperty("stats");
        }
    });

    it("omits optional keys instead of emitting undefined", () => {
        const noSite = projects.find((p) => !p.website && !p.disclaimer)!;
        const out = toApiProject(noSite, {});
        expect(out).not.toHaveProperty("website");
        expect(out).not.toHaveProperty("disclaimer");
        expect(out.surfaces).toEqual(noSite.surfaces ?? []);
    });
});

describe("json", () => {
    it("returns a JSON response with CORS + cache headers", async () => {
        const res = json({ ok: true }, 201);
        expect(res.status).toBe(201);
        for (const [k, v] of Object.entries(API_HEADERS)) expect(res.headers.get(k)).toBe(v);
        await expect(res.json()).resolves.toEqual({ ok: true });
    });
});
