import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CSSProperties, ReactNode } from "react";
import { COMMA, MARK } from "@/components/brand/geometry";

/**
 * Keystone OG palette. Satori (ImageResponse) has no oklch support, so these are the hex
 * fallbacks from brand/tokens.json (dark theme, Ember accent).
 */
export const OG = {
    size: { width: 1200, height: 630 },
    bg: "#090c13",
    tile: "#0f1219",
    fg: "#ebeef5",
    muted: "#999ea9",
    accent: "#f46622",
    accentText: "#ff824f",
    line: "rgba(235,238,245,0.10)",
} as const;

/** Bricolage Grotesque static cuts (brand/scripts/subset-fonts.py); satori needs TTF/OTF. */
export async function ogFonts() {
    const dir = join(process.cwd(), "src/assets/og");
    const [display, body] = await Promise.all([
        readFile(join(dir, "bricolage-720.ttf")),
        readFile(join(dir, "bricolage-500.ttf")),
    ]);
    return [
        { name: "Bricolage", data: display, weight: 700 as const, style: "normal" as const },
        { name: "Bricolage", data: body, weight: 500 as const, style: "normal" as const },
    ];
}

export function OgMark({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48">
            <rect width="48" height="48" rx="11" fill={OG.tile} />
            <path d={MARK.knockout} fill={OG.accent} fillRule="evenodd" />
        </svg>
    );
}

/** Lockup: mark + "Dragoș Cătălin" with the accent comma drawn under the s. */
function OgLockup() {
    const fs = 34;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <OgMark size={64} />
            <div
                style={{
                    display: "flex",
                    fontSize: fs,
                    fontWeight: 700,
                    letterSpacing: -0.8,
                    color: OG.fg,
                }}
            >
                <span>Drago</span>
                <span style={{ display: "flex", position: "relative" }}>
                    s
                    <svg
                        width={fs * 0.144}
                        height={fs * 0.273}
                        viewBox={COMMA.viewBox}
                        style={{
                            position: "absolute",
                            left: "50%",
                            marginLeft: -fs * 0.0815,
                            top: fs * 0.876,
                        }}
                    >
                        <path d={COMMA.d} fill={OG.accent} />
                    </svg>
                </span>
                <span style={{ marginLeft: fs * 0.25 }}>Cătălin</span>
            </div>
        </div>
    );
}

export function OgFrame({
    children,
    blob,
}: {
    children: ReactNode;
    /** Glow position; `background` is the glow colour. Satori clips filter: blur and draws a
     *  CSS radial-gradient as a hard ring, so the glow is an inline SVG radialGradient. */
    blob?: CSSProperties & { background: string };
}) {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: 72,
                background: OG.bg,
                backgroundImage: `linear-gradient(${OG.line} 1px, transparent 1px), linear-gradient(90deg, ${OG.line} 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
                color: OG.fg,
                fontFamily: "Bricolage",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {blob ? (
                <svg
                    width={760}
                    height={760}
                    viewBox="0 0 100 100"
                    style={{
                        position: "absolute",
                        ...blob,
                        background: "transparent",
                        margin: -260,
                    }}
                >
                    <defs>
                        <radialGradient id="glow">
                            <stop offset="0%" stopColor={blob.background} stopOpacity={0.42} />
                            <stop offset="45%" stopColor={blob.background} stopOpacity={0.16} />
                            <stop offset="100%" stopColor={blob.background} stopOpacity={0} />
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="50" fill="url(#glow)" />
                </svg>
            ) : null}
            <OgLockup />
            {children}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 26,
                    fontWeight: 500,
                    color: OG.muted,
                }}
            >
                <span>dragoscatalin.ro</span>
                <span>Product engineer · founder · România</span>
            </div>
        </div>
    );
}
