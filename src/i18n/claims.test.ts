import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import ro from "../../messages/ro.json";

/** V3-11: the classic site has no WebGL/shader/3D (owner policy, e2e asserts 0 canvases). */
describe("copy makes no false technology claims", () => {
    it("footer, about and meta never claim WebGL, shaders or three.js", () => {
        for (const m of [en, ro]) {
            const text = JSON.stringify([m.footer, m.about, m.meta, m.hero]);
            expect(text).not.toMatch(/webgl|shader|three\.?js/i);
        }
    });

    it("the public name never carries the family name (privacy controller byline excepted)", () => {
        for (const m of [en, ro]) {
            const text = JSON.stringify([m.meta, m.hero, m.about, m.footer, m.press]);
            expect(text).not.toMatch(/Vl[aă]dulescu/);
        }
    });
});
