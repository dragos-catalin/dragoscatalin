import { describe, expect, it } from "vitest";
import {
    DEFAULT_THEME,
    parseThemeCookie,
    parseThemePrefs,
    serializeTheme,
    type ThemePrefs,
} from "./theme";

describe("theme prefs", () => {
    it("roundtrips through serializeTheme → parseThemeCookie", () => {
        const prefs: ThemePrefs = { mode: "dark", accent: "emerald", surface: "glass" };
        expect(parseThemeCookie(serializeTheme(prefs))).toEqual(prefs);
    });

    it("serializes to a cookie-safe string", () => {
        const s = serializeTheme({ mode: "light", accent: "rose", surface: "contrast" });
        expect(s).not.toMatch(/[{}",;\s]/);
    });

    it("falls back to DEFAULT_THEME for undefined, empty and garbage", () => {
        expect(parseThemeCookie(undefined)).toEqual(DEFAULT_THEME);
        expect(parseThemeCookie("")).toEqual(DEFAULT_THEME);
        expect(parseThemeCookie("%7Bnot-json")).toEqual(DEFAULT_THEME);
        expect(parseThemeCookie(encodeURIComponent("[1,2]"))).toEqual(DEFAULT_THEME);
    });

    it("repairs individual invalid fields while keeping valid ones", () => {
        expect(parseThemePrefs({ mode: "dark", accent: "neon", surface: 42 })).toEqual({
            mode: "dark",
            accent: DEFAULT_THEME.accent,
            surface: DEFAULT_THEME.surface,
        });
    });
});
