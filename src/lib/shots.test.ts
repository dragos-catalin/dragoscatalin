import { describe, expect, it, vi } from "vitest";

vi.mock("../../public/shots/manifest.json", () => ({
    default: {
        generatedAt: "2026-09-15T05:00:00.000Z",
        shots: {
            brivio: {
                url: "https://brivio.ro",
                capturedAt: "2026-09-15T05:00:00.000Z",
                files: {
                    "desktop-dark": {
                        path: "shots/brivio/desktop-dark.jpg",
                        width: 1440,
                        height: 900,
                    },
                    "full-dark": { path: "shots/brivio/full-dark.jpg", width: 1440, height: 3200 },
                },
            },
            empty: {
                url: "https://example.com",
                capturedAt: "2026-09-15T05:00:00.000Z",
                files: {},
            },
        },
    },
}));

import { getShots, hasShots, ShotsManifestSchema, shotSrc } from "./shots";

describe("ShotsManifestSchema", () => {
    it("accepts the initial empty manifest", () => {
        expect(ShotsManifestSchema.safeParse({ generatedAt: null, shots: {} }).success).toBe(true);
    });

    it("accepts a populated manifest", () => {
        const ok = ShotsManifestSchema.safeParse({
            generatedAt: "2026-09-15T05:00:00.000Z",
            shots: {
                x: {
                    url: "https://x.dev",
                    capturedAt: "2026-09-15T05:00:00.000Z",
                    files: {
                        "mobile-light": {
                            path: "shots/x/mobile-light.jpg",
                            width: 390,
                            height: 844,
                        },
                    },
                },
            },
        });
        expect(ok.success).toBe(true);
    });

    it("rejects malformed entries", () => {
        expect(ShotsManifestSchema.safeParse({ shots: {} }).success).toBe(false);
        expect(
            ShotsManifestSchema.safeParse({
                generatedAt: null,
                shots: { x: { url: "not-a-url", capturedAt: "yesterday", files: {} } },
            }).success,
        ).toBe(false);
        expect(
            ShotsManifestSchema.safeParse({
                generatedAt: null,
                shots: {
                    x: {
                        url: "https://x.dev",
                        capturedAt: "2026-09-15T05:00:00.000Z",
                        files: { "desktop-dark": { path: "", width: 0, height: 900 } },
                    },
                },
            }).success,
        ).toBe(false);
    });
});

describe("shotSrc / getShots / hasShots", () => {
    it("returns public paths with a leading slash", () => {
        expect(shotSrc("brivio", "desktop-dark")).toBe("/shots/brivio/desktop-dark.jpg");
        expect(shotSrc("brivio", "full-dark")).toBe("/shots/brivio/full-dark.jpg");
    });

    it("returns undefined for missing keys and slugs", () => {
        expect(shotSrc("brivio", "mobile-light")).toBeUndefined();
        expect(shotSrc("nope", "desktop-dark")).toBeUndefined();
        expect(getShots("nope")).toBeUndefined();
    });

    it("exposes url and capturedAt", () => {
        const s = getShots("brivio");
        expect(s?.url).toBe("https://brivio.ro");
        expect(s?.capturedAt).toBe("2026-09-15T05:00:00.000Z");
        expect(Object.keys(s!.files)).toEqual(["desktop-dark", "full-dark"]);
    });

    it("hasShots is false for empty or unknown entries", () => {
        expect(hasShots("brivio")).toBe(true);
        expect(hasShots("empty")).toBe(false);
        expect(hasShots("nope")).toBe(false);
    });
});
