import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {} }));

import { fetchActivity, fetchRepoStats } from "./github";

const repos = [
    { owner: "dragoscv", name: "notai" },
    { owner: "codai-ro", name: "codai-sdk" },
];

function gqlResponse(data: unknown, ok = true, status = 200) {
    return { ok, status, json: async () => ({ data }) } as unknown as Response;
}

describe("fetchRepoStats", () => {
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it("returns {} without calling fetch when no token is configured", async () => {
        vi.stubEnv("GITHUB_TOKEN", "");
        vi.stubEnv("GH_TOKEN", "");
        await expect(fetchRepoStats(repos)).resolves.toEqual({});
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("returns {} for an empty repo list even with a token", async () => {
        vi.stubEnv("GITHUB_TOKEN", "ghp_test");
        await expect(fetchRepoStats([])).resolves.toEqual({});
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("maps a GraphQL response to RepoStats", async () => {
        vi.stubEnv("GITHUB_TOKEN", "ghp_test");
        fetchMock.mockResolvedValue(
            gqlResponse({
                r0: {
                    nameWithOwner: "dragoscv/notai",
                    url: "https://github.com/dragoscv/notai",
                    description: "Notes",
                    homepageUrl: "https://notai.ro",
                    stargazerCount: 42,
                    forkCount: 3,
                    pushedAt: "2026-09-01T00:00:00Z",
                    isArchived: false,
                    licenseInfo: { spdxId: "MIT" },
                    languages: {
                        totalSize: 1000,
                        edges: [
                            { size: 750, node: { name: "TypeScript", color: "#3178c6" } },
                            { size: 250, node: { name: "CSS", color: null } },
                        ],
                    },
                    releases: {
                        totalCount: 7,
                        nodes: [
                            {
                                tagName: "v1.2.0",
                                name: "1.2.0",
                                publishedAt: "2026-08-30T00:00:00Z",
                                url: "https://github.com/dragoscv/notai/releases/tag/v1.2.0",
                            },
                        ],
                    },
                },
                r1: null,
            }),
        );

        const out = await fetchRepoStats(repos);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0]!;
        expect(url).toBe("https://api.github.com/graphql");
        expect((init?.headers as Record<string, string>).authorization).toBe("bearer ghp_test");
        expect(JSON.parse(init?.body as string).query).toContain(
            'repository(owner: "codai-ro", name: "codai-sdk")',
        );

        expect(Object.keys(out)).toEqual(["dragoscv/notai"]);
        const s = out["dragoscv/notai"]!;
        expect(s.stars).toBe(42);
        expect(s.forks).toBe(3);
        expect(s.license).toBe("MIT");
        expect(s.languages).toEqual([
            { name: "TypeScript", color: "#3178c6", percent: 75 },
            { name: "CSS", color: null, percent: 25 },
        ]);
        expect(s.latestRelease).toEqual({
            tag: "v1.2.0",
            name: "1.2.0",
            publishedAt: "2026-08-30T00:00:00Z",
            url: "https://github.com/dragoscv/notai/releases/tag/v1.2.0",
        });
        expect(s.releaseCount).toBe(7);
    });

    it("returns {} on a non-OK HTTP status", async () => {
        vi.stubEnv("GITHUB_TOKEN", "ghp_test");
        vi.spyOn(console, "warn").mockImplementation(() => {});
        fetchMock.mockResolvedValue(gqlResponse(null, false, 401));
        await expect(fetchRepoStats(repos)).resolves.toEqual({});
    });

    it("returns {} when fetch throws", async () => {
        vi.stubEnv("GITHUB_TOKEN", "ghp_test");
        vi.spyOn(console, "warn").mockImplementation(() => {});
        fetchMock.mockRejectedValue(new Error("offline"));
        await expect(fetchRepoStats(repos)).resolves.toEqual({});
    });
});

describe("fetchActivity", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it("returns null without a token and maps contribution levels with one", async () => {
        const fetchMock = vi.fn<typeof fetch>();
        vi.stubGlobal("fetch", fetchMock);
        vi.stubEnv("GITHUB_TOKEN", "");
        vi.stubEnv("GH_TOKEN", "");
        await expect(fetchActivity("dragoscv")).resolves.toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();

        vi.stubEnv("GITHUB_TOKEN", "ghp_test");
        fetchMock.mockResolvedValue(
            gqlResponse({
                user: {
                    contributionsCollection: {
                        contributionCalendar: {
                            totalContributions: 5,
                            weeks: [
                                {
                                    contributionDays: [
                                        {
                                            date: "2026-09-01",
                                            contributionCount: 5,
                                            contributionLevel: "FOURTH_QUARTILE",
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
            }),
        );
        const act = await fetchActivity("dragoscv");
        expect(act?.totalContributions).toBe(5);
        expect(act?.weeks[0]?.days[0]).toEqual({ date: "2026-09-01", count: 5, level: 4 });
    });
});
