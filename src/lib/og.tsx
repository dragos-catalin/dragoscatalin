import type { CSSProperties, ReactNode } from "react";

/** Satori (ImageResponse) has no oklch support — hex approximations of the dark theme. */
export const OG = {
    size: { width: 1200, height: 630 },
    bg: "#12111c",
    fg: "#f5f2ea",
    muted: "#a9a5b8",
    accent: "#a78bfa",
    counter: "#67d3c9",
    line: "rgba(245,242,234,0.12)",
} as const;

const STARS: { x: number; y: number; r: number; c: string }[] = [
    { x: 860, y: 120, r: 6, c: OG.accent },
    { x: 980, y: 210, r: 4, c: OG.counter },
    { x: 1080, y: 130, r: 3, c: OG.fg },
    { x: 920, y: 320, r: 5, c: OG.fg },
    { x: 1040, y: 400, r: 7, c: OG.accent },
    { x: 1130, y: 300, r: 3, c: OG.counter },
    { x: 800, y: 440, r: 3, c: OG.muted },
    { x: 960, y: 520, r: 4, c: OG.fg },
];

export function Constellation() {
    return (
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
            <svg
                width={OG.size.width}
                height={OG.size.height}
                style={{ position: "absolute", inset: 0 }}
            >
                <g stroke={OG.line} strokeWidth={1.5}>
                    <line x1={860} y1={120} x2={980} y2={210} />
                    <line x1={980} y1={210} x2={920} y2={320} />
                    <line x1={920} y1={320} x2={1040} y2={400} />
                    <line x1={1040} y1={400} x2={1130} y2={300} />
                    <line x1={1130} y1={300} x2={1080} y2={130} />
                    <line x1={920} y1={320} x2={800} y2={440} />
                    <line x1={1040} y1={400} x2={960} y2={520} />
                </g>
            </svg>
            {STARS.map((s, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        left: s.x - s.r,
                        top: s.y - s.r,
                        width: s.r * 2,
                        height: s.r * 2,
                        borderRadius: 9999,
                        background: s.c,
                        boxShadow: `0 0 ${s.r * 4}px ${s.c}`,
                    }}
                />
            ))}
        </div>
    );
}

export function OgFrame({ children, blob }: { children: ReactNode; blob?: CSSProperties }) {
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
                color: OG.fg,
                fontFamily: "sans-serif",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {blob ? (
                <div
                    style={{
                        position: "absolute",
                        borderRadius: 9999,
                        filter: "blur(80px)",
                        opacity: 0.55,
                        ...blob,
                    }}
                />
            ) : null}
            <Constellation />
            {children}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 26,
                    color: OG.muted,
                }}
            >
                <span>dragoscatalin.ro</span>
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: 9999,
                            background: OG.counter,
                            display: "flex",
                        }}
                    />
                    Full-stack developer · Romania
                </span>
            </div>
        </div>
    );
}
