import { describe, expect, it } from "vitest";
import { horae, horaeListings, horaeTeaser } from "./horae";
import { getProject } from "./projects";

describe("horae.json (scripts/sync-horae.mjs)", () => {
    it("has the synced shape", () => {
        expect(horae.source).toBe("watch-faces/docs/store/play-apps.csv");
        expect(Number.isInteger(horae.built)).toBe(true);
        expect(horae.live).toBe(horae.faces.length);
        expect(horae.live).toBeGreaterThan(0);
        expect(horae.built).toBeGreaterThanOrEqual(horae.live);
    });

    it("lists unique faces with Play URLs that match their package", () => {
        const ids = horae.faces.map((f) => f.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const f of horae.faces) {
            expect(f.name.trim()).not.toBe("");
            expect(["free", "paid"]).toContain(f.tier);
            expect(f.package).toMatch(/^ro\.horae\.watchface\.[a-z0-9]+$/);
            expect(f.url).toBe(`https://play.google.com/store/apps/details?id=${f.package}`);
        }
    });

    it("feeds the Horae registry entry (teaser + listings)", () => {
        const p = getProject("horae");
        expect(p?.teaser).toEqual(horaeTeaser);
        expect(p?.listings).toEqual(horaeListings);
        expect(horaeTeaser.en).toContain(`${horae.live} live`);
        expect(horaeTeaser.ro).toContain(`${horae.live} publicate`);
    });
});
