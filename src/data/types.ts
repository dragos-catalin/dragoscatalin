export type ProjectStatus =
    | "live" // shipped and used
    | "launching" // public launch imminent
    | "active" // in active development (alpha/beta)
    | "research" // experimental / research
    | "maintenance" // shipped, low activity
    | "paused" // site offline (hosting not paid); no live link is shown
    | "case-study" // finished / private engagement
    | "archived"; // no longer developed

export type ProjectCategory =
    "product" | "platform" | "tool" | "library" | "research" | "hobby" | "client";

export type Visibility = "public" | "private";

export interface RepoRef {
    owner: string;
    name: string;
    /** override display label */
    label?: string;
}

export interface PackageRef {
    registry: "npm" | "pypi" | "crates" | "vscode";
    name: string;
}

export interface SurfaceRef {
    /** e.g. "Web", "Desktop (Tauri)", "Android", "VS Code extension", "MCP server", "SDK (TS)" */
    label: string;
    url?: string;
}

export interface LocalizedText {
    en: string;
    ro: string;
}

/** Where a project actually runs. Only shipped or in-repo targets, never wishes. */
export type Platform =
    | "web"
    | "android"
    | "wear-os"
    | "google-tv"
    | "ios"
    | "windows"
    | "macos"
    | "linux"
    | "browser-extension"
    | "vscode-extension"
    | "cli"
    | "api"
    | "sdk"
    | "mcp";

/** Public store / marketplace a project is listed in. Host is enforced by the registry test. */
export type StoreId =
    | "play"
    | "ms-store"
    | "app-store"
    | "vscode-marketplace"
    | "open-vsx"
    | "chrome-web-store"
    | "npm"
    | "pypi";

export interface StoreLink {
    store: StoreId;
    /** https listing URL on the store's own host */
    url: string;
}

/** A small, sourced number. `value` is pre-formatted; never invent it. */
export interface ProjectMetric {
    label: LocalizedText;
    value: string;
    /** https page that shows the number */
    source?: string;
    /** ISO date the number was read */
    asOf?: string;
}

/** One published item inside a project (e.g. a single watch face on Google Play). */
export interface ProjectListing {
    name: string;
    store: StoreId;
    url: string;
    /** e.g. "Free" / "Paid" */
    note?: LocalizedText;
}

export interface Project {
    slug: string;
    name: string;
    /** short one-liner, both locales */
    tagline: LocalizedText;
    /** 1–3 paragraphs, both locales, markdown-lite (plain text with \n\n) */
    summary: LocalizedText;
    /** optional longer story: problem / approach / outcome */
    story?: { problem: LocalizedText; approach: LocalizedText; outcome: LocalizedText };
    status: ProjectStatus;
    category: ProjectCategory;
    visibility: Visibility;
    featured?: boolean;
    /** sort weight inside featured; lower = first */
    order?: number;
    /** first year of work → last year (or "now") */
    years: { from: number; to?: number };
    stack: string[];
    surfaces?: SurfaceRef[];
    platforms?: Platform[];
    stores?: StoreLink[];
    metrics?: ProjectMetric[];
    /** short live-count line, e.g. "206 faces built · 14 live on Google Play" */
    teaser?: LocalizedText;
    /** published items, e.g. the watch faces that are live */
    listings?: ProjectListing[];
    repos?: RepoRef[];
    packages?: PackageRef[];
    /** project site; hidden as a link while `status` is "paused" */
    website?: string;
    /** brand hue override in OKLCH degrees, used for cover gradient */
    hue?: number;
    /** public/projects/<file> */
    cover?: string;
    /** related project slugs (successor/predecessor/part-of) */
    related?: { slug: string; relation: "successor" | "predecessor" | "part-of" | "sibling" }[];
    /** shown as a badge, e.g. "experimental, unaudited" */
    disclaimer?: LocalizedText;
}

/** Live data fetched from GitHub at build time (revalidated daily). */
export interface RepoStats {
    owner: string;
    name: string;
    stars: number;
    forks: number;
    pushedAt: string; // ISO
    description: string | null;
    homepage: string | null;
    license: string | null;
    languages: { name: string; color: string | null; percent: number }[];
    latestRelease: { tag: string; name: string | null; publishedAt: string; url: string } | null;
    releaseCount: number;
    isArchived: boolean;
    url: string;
}

export interface PackageStats {
    registry: PackageRef["registry"];
    name: string;
    version: string | null;
    weeklyDownloads: number | null;
    url: string;
}
