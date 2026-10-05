import { SKINS, type Skin } from "@/skins/registry";

export const MODES = ["system", "light", "dark"] as const;
export const ACCENTS = [
    "ember",
    "orange",
    "amber",
    "rose",
    "violet",
    "indigo",
    "cyan",
    "emerald",
] as const;
export const SURFACES = ["solid", "glass", "contrast"] as const;

export type Mode = (typeof MODES)[number];
export type Accent = (typeof ACCENTS)[number];
export type Surface = (typeof SURFACES)[number];
export type ResolvedMode = "light" | "dark";

export interface ThemePrefs {
    mode: Mode;
    accent: Accent;
    surface: Surface;
}

// Ember = brand Keystone default (owner, gate A 2026-10-05).
export const DEFAULT_THEME: ThemePrefs = { mode: "system", accent: "ember", surface: "solid" };

export const THEME_COOKIE = "dc-theme";
export const THEME_STORAGE_KEY = "dc-theme";

export function isMode(v: unknown): v is Mode {
    return typeof v === "string" && (MODES as readonly string[]).includes(v);
}
export function isAccent(v: unknown): v is Accent {
    return typeof v === "string" && (ACCENTS as readonly string[]).includes(v);
}
export function isSurface(v: unknown): v is Surface {
    return typeof v === "string" && (SURFACES as readonly string[]).includes(v);
}

export function parseThemePrefs(raw: unknown): ThemePrefs {
    if (!raw || typeof raw !== "object") return DEFAULT_THEME;
    const o = raw as Record<string, unknown>;
    return {
        mode: isMode(o.mode) ? o.mode : DEFAULT_THEME.mode,
        accent: isAccent(o.accent) ? o.accent : DEFAULT_THEME.accent,
        surface: isSurface(o.surface) ? o.surface : DEFAULT_THEME.surface,
    };
}

export function parseThemeCookie(value: string | undefined): ThemePrefs {
    if (!value) return DEFAULT_THEME;
    try {
        return parseThemePrefs(JSON.parse(decodeURIComponent(value)));
    } catch {
        return DEFAULT_THEME;
    }
}

export function serializeTheme(prefs: ThemePrefs): string {
    return encodeURIComponent(JSON.stringify(prefs));
}

/** Skin cookie (V3-03): read by src/proxy.ts (home rewrite) and THEME_INIT_SCRIPT (data-skin). */
export const SKIN_COOKIE = "dc-skin";
export const DEFAULT_SKIN: Skin = "classic";
/** One year, like the theme cookie. */
export const SKIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isSkin(v: unknown): v is Skin {
    return typeof v === "string" && (SKINS as readonly string[]).includes(v);
}

export function parseSkin(v: string | undefined | null): Skin {
    return isSkin(v) ? v : DEFAULT_SKIN;
}

export { SKINS, type Skin };

/** sessionStorage flag: the Keystone logo intro has played in this tab. */
export const INTRO_STORAGE_KEY = "dc-intro";

/**
 * Inline, dependency-free script run before first paint to avoid a flash.
 * Reads localStorage (fresher) then cookie, resolves "system" via matchMedia,
 * and stamps data-* attributes on <html>. Also stamps data-intro on the first
 * page load of a session so the CSS logo intro plays exactly once, and
 * data-skin from the `dc-skin` cookie (unknown/missing → classic).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var d=${JSON.stringify(DEFAULT_THEME)};var p=null;try{p=JSON.parse(localStorage.getItem(k)||"null")}catch(e){}if(!p){var m=document.cookie.match(new RegExp("(?:^|; )"+k+"=([^;]*)"));if(m){try{p=JSON.parse(decodeURIComponent(m[1]))}catch(e){}}}p=Object.assign({},d,p||{});var mode=p.mode==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p.mode;var h=document.documentElement;h.setAttribute("data-mode",mode);h.setAttribute("data-accent",p.accent);h.setAttribute("data-surface",p.surface);h.style.colorScheme=mode;var sk=${JSON.stringify(DEFAULT_SKIN)};var sm=document.cookie.match(new RegExp("(?:^|; )"+${JSON.stringify(SKIN_COOKIE)}+"=([^;]*)"));if(sm&&${JSON.stringify(SKINS)}.indexOf(sm[1])>=0)sk=sm[1];h.setAttribute("data-skin",sk);try{var ik=${JSON.stringify(INTRO_STORAGE_KEY)};if(!sessionStorage.getItem(ik)){sessionStorage.setItem(ik,"1");h.setAttribute("data-intro","")}}catch(e){}}catch(e){}})();`;
