import { describe, expect, it } from "vitest";
import { getProject } from "./projects";
import { stackLayers } from "./stack";

describe("stack layers (home hero)", () => {
    it("ids are unique and labels are localized", () => {
        const ids = stackLayers.map((l) => l.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const l of stackLayers) {
            expect(l.label.en).not.toBe("");
            expect(l.label.ro).not.toBe("");
        }
    });

    it("every proof slug exists in the registry", () => {
        for (const l of stackLayers) {
            expect(l.proof.length).toBeGreaterThan(0);
            for (const slug of l.proof) expect(getProject(slug), slug).toBeDefined();
        }
    });
});
