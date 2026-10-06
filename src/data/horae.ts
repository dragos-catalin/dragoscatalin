import data from "./horae.json";
import type { LocalizedText, ProjectListing } from "./types";

/** Committed snapshot written by `node scripts/sync-horae.mjs` from watch-faces/docs/store/play-apps.csv. */
export interface HoraeSnapshot {
    source: string;
    built: number;
    live: number;
    faces: { id: string; name: string; tier: "free" | "paid"; package: string; url: string }[];
}

export const horae: HoraeSnapshot = data as HoraeSnapshot;

export const horaeTeaser: LocalizedText = {
    en: `${horae.built} faces built · ${horae.live} live on Google Play`,
    ro: `${horae.built} de cadrane construite · ${horae.live} publicate pe Google Play`,
};

export const horaeListings: ProjectListing[] = horae.faces.map((f) => ({
    name: f.name,
    store: "play",
    url: f.url,
    note: f.tier === "free" ? { en: "Free", ro: "Gratuit" } : { en: "Paid", ro: "Plătit" },
}));
