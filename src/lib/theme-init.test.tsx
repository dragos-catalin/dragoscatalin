// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { THEME_INIT_SCRIPT, THEME_STORAGE_KEY, serializeTheme } from "./theme";

function run() {
    // The inline script is an IIFE string; evaluating it must not throw.
    new Function(THEME_INIT_SCRIPT)();
}

describe("THEME_INIT_SCRIPT", () => {
    afterEach(() => {
        localStorage.clear();
        document.cookie = `${THEME_STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        for (const a of ["data-mode", "data-accent", "data-surface"])
            document.documentElement.removeAttribute(a);
        vi.unstubAllGlobals();
    });

    it("parses as JavaScript and applies defaults resolved via matchMedia", () => {
        vi.stubGlobal("matchMedia", () => ({ matches: true }));
        expect(run).not.toThrow();
        const h = document.documentElement;
        expect(h.getAttribute("data-mode")).toBe("dark");
        expect(h.getAttribute("data-accent")).toBe("violet");
        expect(h.getAttribute("data-surface")).toBe("solid");
        expect(h.style.colorScheme).toBe("dark");
    });

    it("prefers localStorage over the cookie", () => {
        vi.stubGlobal("matchMedia", () => ({ matches: false }));
        localStorage.setItem(
            THEME_STORAGE_KEY,
            JSON.stringify({ mode: "light", accent: "amber", surface: "glass" }),
        );
        document.cookie = `${THEME_STORAGE_KEY}=${serializeTheme({ mode: "dark", accent: "rose", surface: "solid" })}`;
        run();
        const h = document.documentElement;
        expect(h.getAttribute("data-mode")).toBe("light");
        expect(h.getAttribute("data-accent")).toBe("amber");
        expect(h.getAttribute("data-surface")).toBe("glass");
    });

    it("reads the cookie when localStorage is empty", () => {
        vi.stubGlobal("matchMedia", () => ({ matches: false }));
        document.cookie = `${THEME_STORAGE_KEY}=${serializeTheme({ mode: "dark", accent: "cyan", surface: "contrast" })}`;
        run();
        const h = document.documentElement;
        expect(h.getAttribute("data-mode")).toBe("dark");
        expect(h.getAttribute("data-accent")).toBe("cyan");
        expect(h.getAttribute("data-surface")).toBe("contrast");
    });
});
