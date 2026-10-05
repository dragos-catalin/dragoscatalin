/** Feedbrake (Android, package `ro.dragoscatalin.unscroll`). Facts shared by its two pages. */

/** Google Play listing. `null` until the app is published; the badge renders only when set. */
export const PLAY_URL: string | null = null;

export const FEEDBRAKE = {
    name: "Feedbrake",
    packageId: "ro.dragoscatalin.unscroll",
    rulesUrl: "https://github.com/dragoscv/unscroll-rules",
    policyEffective: "2026-10-05",
} as const;
