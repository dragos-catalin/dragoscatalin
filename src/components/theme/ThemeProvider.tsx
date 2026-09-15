"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";
import {
    THEME_COOKIE,
    THEME_STORAGE_KEY,
    parseThemePrefs,
    serializeTheme,
    type Accent,
    type Mode,
    type ResolvedMode,
    type Surface,
    type ThemePrefs,
} from "@/lib/theme";

interface ThemeContextValue extends ThemePrefs {
    resolvedMode: ResolvedMode;
    setMode: (m: Mode) => void;
    setAccent: (a: Accent) => void;
    setSurface: (s: Surface) => void;
    toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DARK_MQ = "(prefers-color-scheme: dark)";
function subscribeSystem(cb: () => void) {
    const mq = window.matchMedia(DARK_MQ);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
}
function getSystemSnapshot(): ResolvedMode {
    return window.matchMedia(DARK_MQ).matches ? "dark" : "light";
}
function getSystemServerSnapshot(): ResolvedMode {
    return "dark";
}

/** Stored prefs are only authoritative after hydration (localStorage may be fresher than the cookie). */
function subscribeStorage(cb: () => void) {
    window.addEventListener("storage", cb);
    return () => window.removeEventListener("storage", cb);
}
function getStorageSnapshot(): string | null {
    try {
        return window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
        return null;
    }
}
function getStorageServerSnapshot(): string | null {
    return null;
}

function apply(prefs: ThemePrefs, resolved: ResolvedMode) {
    const h = document.documentElement;
    h.setAttribute("data-mode", resolved);
    h.setAttribute("data-accent", prefs.accent);
    h.setAttribute("data-surface", prefs.surface);
    h.style.colorScheme = resolved;
}

export function ThemeProvider({ children, initial }: { children: ReactNode; initial: ThemePrefs }) {
    const [override, setOverride] = useState<ThemePrefs | null>(null);
    const sys = useSyncExternalStore(subscribeSystem, getSystemSnapshot, getSystemServerSnapshot);
    const storedRaw = useSyncExternalStore(
        subscribeStorage,
        getStorageSnapshot,
        getStorageServerSnapshot,
    );

    const prefs = useMemo<ThemePrefs>(() => {
        if (override) return override;
        if (storedRaw) {
            try {
                return parseThemePrefs(JSON.parse(storedRaw));
            } catch {
                /* fall through */
            }
        }
        return initial;
    }, [override, storedRaw, initial]);

    const resolvedMode: ResolvedMode = prefs.mode === "system" ? sys : prefs.mode;

    useEffect(() => {
        apply(prefs, resolvedMode);
    }, [prefs, resolvedMode]);

    const persist = useCallback((next: ThemePrefs) => {
        setOverride(next);
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
            document.cookie = `${THEME_COOKIE}=${serializeTheme(next)}; path=/; max-age=31536000; samesite=lax`;
        } catch {
            /* ignore */
        }
    }, []);

    const value = useMemo<ThemeContextValue>(
        () => ({
            ...prefs,
            resolvedMode,
            setMode: (mode) => persist({ ...prefs, mode }),
            setAccent: (accent) => persist({ ...prefs, accent }),
            setSurface: (surface) => persist({ ...prefs, surface }),
            toggleMode: () =>
                persist({ ...prefs, mode: resolvedMode === "dark" ? "light" : "dark" }),
        }),
        [prefs, resolvedMode, persist],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}
