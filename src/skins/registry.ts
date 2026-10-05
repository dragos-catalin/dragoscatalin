/**
 * Skin registry (V3-03). A skin replaces the HOMEPAGE and its chrome; content pages are shared
 * and only pick up the skin's CSS tokens via `html[data-skin]`. Classic = the original design and
 * the default; it never rewrites. Add a skin with `.github/skills/add-skin/SKILL.md`.
 *
 * Plain module (no React, no zod): imported by the proxy, the theme init script and the client.
 */
export const SKINS = ["classic", "editorial", "constellation", "command", "devices"] as const;

export type Skin = (typeof SKINS)[number];

export interface SkinMeta {
    id: Skin;
    /** `messages/*.json` → `skins.<id>.name` */
    labelKey: `${Skin}.name`;
    /** `messages/*.json` → `skins.<id>.description` */
    descriptionKey: `${Skin}.description`;
    /**
     * May the skin home mount a <canvas>/WebGL scene? Classic, editorial and command never do
     * (docs/DESIGN.md § Skins). Constellation and devices may, once V3-05/V3-07 ship the scene
     * with its guardrails; until then they render a static poster.
     */
    hasCanvas: boolean;
}

export const SKIN_META: Record<Skin, SkinMeta> = {
    classic: {
        id: "classic",
        labelKey: "classic.name",
        descriptionKey: "classic.description",
        hasCanvas: false,
    },
    editorial: {
        id: "editorial",
        labelKey: "editorial.name",
        descriptionKey: "editorial.description",
        hasCanvas: false,
    },
    constellation: {
        id: "constellation",
        labelKey: "constellation.name",
        descriptionKey: "constellation.description",
        hasCanvas: true,
    },
    command: {
        id: "command",
        labelKey: "command.name",
        descriptionKey: "command.description",
        hasCanvas: false,
    },
    devices: {
        id: "devices",
        labelKey: "devices.name",
        descriptionKey: "devices.description",
        hasCanvas: true,
    },
};

/** Skins that own a home route at `src/app/[locale]/skin/<id>/`. */
export const SKIN_HOMES = SKINS.filter((s) => s !== "classic");
