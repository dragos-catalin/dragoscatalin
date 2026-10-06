/**
 * Metadata for the `now.focus` sentence in messages/{en,ro}.json (V3-11), read by the home
 * NowStrip and the /now page. Source: docs/TRACKER.md + docs/portfolio/portfolio.csv rows in
 * `doing`; every slug must exist in the registry or the lab and be named in the sentence (tested).
 * Update `updated` when the focus changes.
 */
export interface NowFocus {
    updated: string;
    /** registry project slugs the sentence names */
    projects: string[];
    /** lab idea ids (src/data/lab.ts) the sentence names */
    lab: string[];
}

export const now: NowFocus = {
    updated: "2026-10-07",
    projects: ["brivio", "codai", "horae"],
    lab: ["D-01"],
};
