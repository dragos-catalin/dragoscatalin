import { describe, expect, it } from "vitest";
import type { Project } from "@/data/types";
import {
    downloadUrl,
    installUrl,
    liveSurfaces,
    liveWebsite,
    operatingSystems,
    sortedPlatforms,
    storeUrlIsValid,
} from "./project-links";

const base: Project = {
    slug: "x",
    name: "X",
    tagline: { en: "t", ro: "t" },
    summary: { en: "s", ro: "s" },
    status: "live",
    category: "product",
    visibility: "public",
    years: { from: 2026 },
    stack: [],
};

describe("project-links", () => {
    it("hides the website and same-host surfaces of a paused project", () => {
        const p: Project = {
            ...base,
            status: "paused",
            website: "https://x.ro",
            surfaces: [
                { label: "Web", url: "https://x.ro/app" },
                { label: "Code", url: "https://github.com/a/b" },
            ],
        };
        expect(liveWebsite(p)).toBeUndefined();
        expect(liveSurfaces(p)).toEqual([
            { label: "Web" },
            { label: "Code", url: "https://github.com/a/b" },
        ]);
        expect(liveWebsite({ ...p, status: "live" })).toBe("https://x.ro");
    });

    it("validates store hosts and https", () => {
        expect(
            storeUrlIsValid({
                store: "play",
                url: "https://play.google.com/store/apps/details?id=a.b",
            }),
        ).toBe(true);
        expect(storeUrlIsValid({ store: "play", url: "http://play.google.com/x" })).toBe(false);
        expect(storeUrlIsValid({ store: "ms-store", url: "https://evil.com/detail/9N" })).toBe(
            false,
        );
        expect(storeUrlIsValid({ store: "npm", url: "not a url" })).toBe(false);
    });

    it("derives schema.org operatingSystem, installUrl and downloadUrl", () => {
        const p: Project = {
            ...base,
            platforms: ["sdk", "windows", "android", "web"],
            stores: [
                { store: "npm", url: "https://www.npmjs.com/package/x" },
                { store: "ms-store", url: "https://apps.microsoft.com/detail/9N" },
            ],
        };
        expect(sortedPlatforms(p)).toEqual(["web", "android", "windows", "sdk"]);
        expect(operatingSystems(p)).toBe("Web, Android, Windows");
        expect(installUrl(p)).toBe("https://apps.microsoft.com/detail/9N");
        expect(downloadUrl(p)).toBe("https://www.npmjs.com/package/x");
        expect(operatingSystems(base)).toBe("Web");
        expect(installUrl(base)).toBeUndefined();
    });
});
