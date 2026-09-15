export type ProjectStatus =
    | "live" // shipped and used
    | "launching" // public launch imminent
    | "active" // in active development (alpha/beta)
    | "research" // experimental / research
    | "maintenance" // shipped, low activity
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
    repos?: RepoRef[];
    packages?: PackageRef[];
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
