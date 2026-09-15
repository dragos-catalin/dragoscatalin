import { describe, expect, it } from "vitest";
import { bioLong, bioShort, pressFacts, pressProducts } from "./press";
import { getProject } from "./projects";
import { usesSections } from "./uses";

describe("press kit data", () => {
    it("bios exist in both locales and the long one is longer", () => {
        for (const b of [bioShort, bioLong]) {
            expect(b.en.trim().length).toBeGreaterThan(50);
            expect(b.ro.trim().length).toBeGreaterThan(50);
        }
        expect(bioLong.en.length).toBeGreaterThan(bioShort.en.length);
    });

    it("facts are localized and non-empty", () => {
        expect(pressFacts.length).toBeGreaterThan(3);
        for (const f of pressFacts)
            for (const loc of ["en", "ro"] as const) {
                expect(f.label[loc]).not.toBe("");
                expect(f.value[loc]).not.toBe("");
            }
    });

    it("products are featured/live registry projects with a website, sorted by order", () => {
        expect(pressProducts.map((p) => p.slug)).toContain("codai");
        for (const p of pressProducts) {
            const src = getProject(p.slug)!;
            expect(src.website).toBe(p.website);
            expect(src.featured === true || src.status === "live").toBe(true);
        }
        const orders = pressProducts.map((p) => getProject(p.slug)!.order ?? 99);
        expect(orders).toEqual([...orders].sort((a, b) => a - b));
    });
});

describe("uses data", () => {
    it("has unique section ids and localized notes", () => {
        const ids = usesSections.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const s of usesSections) {
            expect(s.items.length).toBeGreaterThan(0);
            for (const i of s.items) {
                expect(i.name).not.toBe("");
                expect(i.note.en).not.toBe("");
                expect(i.note.ro).not.toBe("");
            }
        }
    });
});
