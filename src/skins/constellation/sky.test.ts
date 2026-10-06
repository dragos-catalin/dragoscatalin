import { describe, expect, it } from "vitest";
import { FALLBACK_ACCENT, parseCssColor } from "./accent";
import { canMountSky, type SkyEnv } from "./gate";

const capable: SkyEnv = {
    navigator: { hardwareConcurrency: 8, deviceMemory: 8, connection: { saveData: false } },
    prefersReducedMotion: false,
    hasWebGL2: () => true,
};

function env(patch: Partial<SkyEnv> & { nav?: SkyEnv["navigator"] }): SkyEnv {
    return {
        ...capable,
        ...patch,
        navigator: { ...capable.navigator, ...patch.nav },
    };
}

describe("canMountSky", () => {
    it("mounts on a capable device", () => {
        expect(canMountSky(capable)).toBe(true);
    });

    it.each([
        ["reduced motion", env({ prefersReducedMotion: true })],
        ["webdriver (Playwright / Lighthouse)", env({ nav: { webdriver: true } })],
        ["<= 4 cores", env({ nav: { hardwareConcurrency: 4 } })],
        ["< 4 GB memory", env({ nav: { deviceMemory: 2 } })],
        ["Save-Data", env({ nav: { connection: { saveData: true } } })],
        ["no WebGL2", env({ hasWebGL2: () => false })],
    ])("skips the canvas on %s", (_label, e) => {
        expect(canMountSky(e)).toBe(false);
    });

    it("does not probe WebGL2 when a cheap check already failed", () => {
        let probed = false;
        const e = env({
            prefersReducedMotion: true,
            hasWebGL2: () => {
                probed = true;
                return true;
            },
        });
        expect(canMountSky(e)).toBe(false);
        expect(probed).toBe(false);
    });

    it("treats missing deviceMemory / connection (Firefox, Safari) as capable", () => {
        expect(canMountSky({ ...capable, navigator: { hardwareConcurrency: 8 } })).toBe(true);
    });
});

describe("parseCssColor", () => {
    it("parses legacy and modern rgb()", () => {
        expect(parseCssColor("rgb(244, 102, 34)")).toBe("#f46622");
        expect(parseCssColor("rgb(244 102 34 / 0.5)")).toBe("#f46622");
    });

    it("parses color(srgb …)", () => {
        expect(parseCssColor("color(srgb 1 0 0)")).toBe("#ff0000");
    });

    it("converts oklch() to sRGB", () => {
        expect(parseCssColor("oklch(0.6279 0.2577 29.23)")).toBe("#ff0000");
        expect(parseCssColor("oklch(100% 0 0)")).toBe("#ffffff");
    });

    it("returns null for unknown syntax so the caller falls back", () => {
        expect(parseCssColor("")).toBeNull();
        expect(parseCssColor("lab(50 40 30)")).toBeNull();
        expect(FALLBACK_ACCENT).toBe("#f46622");
    });
});
