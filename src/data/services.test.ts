import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LAB_STAGES, labIdeas } from "./lab";
import { getProject } from "./projects";
import { audiences, processSteps } from "./services";

const LOCALES = ["en", "ro"] as const;

describe("services data", () => {
    it("covers the four audiences from the owner profile, once each", () => {
        expect(audiences.map((a) => a.id).sort()).toEqual(
            ["developers", "enterprise", "smes", "startups"].sort(),
        );
    });

    it("every text is localized and every proof slug exists in the registry", () => {
        for (const a of audiences) {
            for (const loc of LOCALES) {
                expect(a.title[loc]).not.toBe("");
                expect(a.lead[loc]).not.toBe("");
                expect(a.engagement[loc]).not.toBe("");
                for (const o of a.offers) expect(o[loc]).not.toBe("");
            }
            expect(a.offers.length).toBeGreaterThanOrEqual(3);
            for (const slug of a.proof) expect(getProject(slug), slug).toBeDefined();
        }
        for (const s of processSteps)
            for (const loc of LOCALES) {
                expect(s.title[loc]).not.toBe("");
                expect(s.body[loc]).not.toBe("");
            }
    });
});

describe("lab data", () => {
    const csv = readFileSync("docs/portfolio/portfolio.csv", "utf8");

    it("ids are unique and match a row in the portfolio tracker", () => {
        const ids = labIdeas.map((i) => i.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const id of ids) expect(csv, id).toMatch(new RegExp(`^${id},`, "m"));
    });

    it("entries are localized, dated and use a known stage", () => {
        for (const i of labIdeas) {
            expect(LAB_STAGES).toContain(i.stage);
            expect(i.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            for (const loc of LOCALES) {
                expect(i.problem[loc]).not.toBe("");
                expect(i.approach[loc]).not.toBe("");
            }
            if (i.repo) expect(i.repo).toMatch(/^https:\/\/github\.com\//);
        }
    });
});
