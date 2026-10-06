import type { Platform, Project, StoreId, StoreLink, SurfaceRef } from "@/data/types";

/** Display order for platform chips. */
export const PLATFORMS = [
    "web",
    "android",
    "wear-os",
    "google-tv",
    "ios",
    "windows",
    "macos",
    "linux",
    "browser-extension",
    "vscode-extension",
    "cli",
    "api",
    "sdk",
    "mcp",
] as const satisfies readonly Platform[];

/** Display order for store badges. */
export const STORES = [
    "play",
    "ms-store",
    "app-store",
    "vscode-marketplace",
    "open-vsx",
    "chrome-web-store",
    "npm",
    "pypi",
] as const satisfies readonly StoreId[];

/** The only hosts a store URL may point at (enforced by the registry test and the link checker). */
export const STORE_HOSTS: Record<StoreId, readonly string[]> = {
    play: ["play.google.com"],
    "ms-store": ["apps.microsoft.com"],
    "app-store": ["apps.apple.com"],
    "vscode-marketplace": ["marketplace.visualstudio.com"],
    "open-vsx": ["open-vsx.org"],
    "chrome-web-store": ["chromewebstore.google.com"],
    npm: ["www.npmjs.com"],
    pypi: ["pypi.org"],
};

/** schema.org `operatingSystem` value per platform; null = not an OS. */
const PLATFORM_OS: Record<Platform, string | null> = {
    web: "Web",
    android: "Android",
    "wear-os": "Wear OS",
    "google-tv": "Google TV",
    ios: "iOS",
    windows: "Windows",
    macos: "macOS",
    linux: "Linux",
    "browser-extension": "Chrome",
    "vscode-extension": "Visual Studio Code",
    cli: null,
    api: null,
    sdk: null,
    mcp: null,
};

export function storeUrlIsValid(link: StoreLink): boolean {
    try {
        const u = new URL(link.url);
        return u.protocol === "https:" && STORE_HOSTS[link.store].includes(u.hostname);
    } catch {
        return false;
    }
}

function host(url: string | undefined): string | null {
    if (!url) return null;
    try {
        return new URL(url).hostname;
    } catch {
        return null;
    }
}

/** The project site as a live link — never for a paused project. */
export function liveWebsite(p: Project): string | undefined {
    return p.status === "paused" ? undefined : p.website;
}

/** A surface URL is hidden when the project is paused and the URL lives on the (offline) site host. */
export function liveSurfaceUrl(p: Project, s: SurfaceRef): string | undefined {
    if (!s.url) return undefined;
    if (p.status !== "paused") return s.url;
    const site = host(p.website);
    return site !== null && host(s.url) === site ? undefined : s.url;
}

/** Surfaces with offline URLs stripped (label kept). */
export function liveSurfaces(p: Project): SurfaceRef[] {
    return (p.surfaces ?? []).map((s) => {
        const url = liveSurfaceUrl(p, s);
        return url ? { label: s.label, url } : { label: s.label };
    });
}

export function sortedPlatforms(p: Project): Platform[] {
    const set = new Set(p.platforms ?? []);
    return PLATFORMS.filter((x) => set.has(x));
}

export function sortedStores(p: Project): StoreLink[] {
    const order = new Map<StoreId, number>(STORES.map((s, i) => [s, i]));
    return [...(p.stores ?? [])].sort(
        (a, b) => (order.get(a.store) ?? 99) - (order.get(b.store) ?? 99),
    );
}

/** schema.org operatingSystem, e.g. "Android, Wear OS, Windows". */
export function operatingSystems(p: Project): string {
    const list = sortedPlatforms(p)
        .map((x) => PLATFORM_OS[x])
        .filter((x): x is string => x !== null);
    return list.length > 0 ? [...new Set(list)].join(", ") : "Web";
}

/** First app-store listing (not a package registry) — schema.org installUrl. */
export function installUrl(p: Project): string | undefined {
    const apps: readonly StoreId[] = [
        "play",
        "ms-store",
        "app-store",
        "vscode-marketplace",
        "open-vsx",
        "chrome-web-store",
    ];
    return sortedStores(p).find((s) => apps.includes(s.store))?.url;
}

/** Package registry listing — schema.org downloadUrl for libraries/SDKs. */
export function downloadUrl(p: Project): string | undefined {
    return sortedStores(p).find((s) => s.store === "npm" || s.store === "pypi")?.url;
}
