import { z } from "zod";
import rawManifest from "../../public/shots/manifest.json";

export type ShotKey = `${"desktop" | "tablet" | "mobile"}-${"dark" | "light"}` | "full-dark";

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

export interface ProjectShots {
    url: string;
    capturedAt: string;
    files: Partial<Record<ShotKey, string>> & Record<string, string>;
}

export const manifest: ShotsManifest = ShotsManifestSchema.parse(rawManifest);

export function getShots(slug: string, m: ShotsManifest = manifest): ProjectShots | undefined {
    const entry = m.shots[slug];
    if (!entry) return undefined;
    const files: Record<string, string> = {};
    for (const [key, f] of Object.entries(entry.files)) files[key] = `/${f.path}`;
    return { url: entry.url, capturedAt: entry.capturedAt, files };
}

export function shotSrc(
    slug: string,
    key: ShotKey,
    m: ShotsManifest = manifest,
): string | undefined {
    return getShots(slug, m)?.files[key];
}

export function hasShots(slug: string, m: ShotsManifest = manifest): boolean {
    const entry = m.shots[slug];
    return !!entry && Object.keys(entry.files).length > 0;
}
