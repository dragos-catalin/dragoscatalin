import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_SKIN, isSkin, parseSkin } from "@/lib/theme";
import { SKINS, SKIN_HOMES, SKIN_META } from "./registry";

const root = process.cwd();
const messages = (l: string) =>
    JSON.parse(readFileSync(join(root, "messages", `${l}.json`), "utf8")) as {
        skins: Record<string, { name?: string; description?: string }>;
    };

describe("skin registry", () => {
    it("has classic as the default and first skin", () => {
        expect(DEFAULT_SKIN).toBe("classic");
        expect(SKINS[0]).toBe("classic");
        expect(SKIN_HOMES).not.toContain("classic");
    });

    it("validates skin ids", () => {
        for (const s of SKINS) expect(isSkin(s)).toBe(true);
        expect(isSkin("Classic")).toBe(false);
        expect(isSkin(undefined)).toBe(false);
        expect(parseSkin("nope")).toBe("classic");
        expect(parseSkin(null)).toBe("classic");
        expect(parseSkin("devices")).toBe("devices");
    });

    it("has metadata, labels in both locales and a home route per non-classic skin", () => {
        for (const s of SKINS) {
            expect(SKIN_META[s].id).toBe(s);
            for (const l of ["en", "ro"]) {
                expect(messages(l).skins[s]?.name, `${l} skins.${s}.name`).toBeTruthy();
                expect(messages(l).skins[s]?.description).toBeTruthy();
            }
        }
        for (const s of SKIN_HOMES) {
            const dir = join(root, "src", "app", "[locale]", "skin", s);
            expect(existsSync(join(dir, "page.tsx")), `${s}/page.tsx`).toBe(true);
            expect(existsSync(join(dir, "layout.tsx")), `${s}/layout.tsx`).toBe(true);
        }
    });

    it("only allows a canvas on constellation and devices (docs/DESIGN.md § Skins)", () => {
        const canvas = SKINS.filter((s) => SKIN_META[s].hasCanvas);
        expect(canvas).toEqual(["constellation", "devices"]);
    });
});
