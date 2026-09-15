import { z } from "zod";

/**
 * Zod schema for public/shots/manifest.json. SERVER/TOOLING ONLY — `shots.ts`
 * (imported by client cards) must stay zod-free so zod never enters the browser
 * bundle (Lighthouse mobile, 2026-09-15: 100 KB gz, ~1 s of LCP).
 */
export const ShotFileSchema = z.object({
    path: z.string().min(1),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
});

export const ShotEntrySchema = z.object({
    url: z.url(),
    capturedAt: z.iso.datetime(),
    files: z.record(z.string(), ShotFileSchema),
});

export const ShotsManifestSchema = z.object({
    generatedAt: z.iso.datetime().nullable(),
    shots: z.record(z.string(), ShotEntrySchema),
});

export type ShotsManifest = z.infer<typeof ShotsManifestSchema>;
export type ShotEntry = z.infer<typeof ShotEntrySchema>;
