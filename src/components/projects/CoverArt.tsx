import type { CSSProperties, ReactNode } from "react";
import type { Project } from "@/data/types";
import { DEFAULT_HUE, coverRandom, coverSeed } from "./cover";

const W = 800;
const H = 500;

type Family = "dots" | "hatch" | "rings" | "cubes";
const FAMILIES: readonly Family[] = ["dots", "hatch", "rings", "cubes"];

function monogram(name: string): string {
    const words = name
        .trim()
        .split(/[\s\-_.]+/)
        .filter(Boolean);
    const first = words[0]?.[0] ?? "?";
    const second = words[1]?.[0];
    return (second ? first + second : first).toUpperCase();
}

function round(n: number): number {
    return Math.round(n * 10) / 10;
}

function layoutChips(labels: string[]): { label: string; x: number; w: number }[] {
    const out: { label: string; x: number; w: number }[] = [];
    let x = 28;
    for (const label of labels) {
        const w = round(label.length * 11.5 + 28);
        out.push({ label, x, w });
        x += w + 10;
    }
    return out;
}

/**
 * Each family is ONE `<pattern>` tile the renderer repeats — 1–3 elements per
 * cover instead of hundreds. 18 covers on the home page used to add 321 KB of
 * HTML (Lighthouse mobile, 2026-09-15); now ~1 KB each.
 */
function pattern(family: Family, rnd: () => number, id: string): ReactNode {
    const stroke = "var(--fg)";
    const pid = `${id}-p`;
    const fill = <rect width={W} height={H} fill={`url(#${pid})`} />;
    switch (family) {
        case "dots": {
            const step = 28 + Math.floor(rnd() * 20);
            const r = round(1.5 + rnd() * 1.5);
            return (
                <g opacity={0.08}>
                    <pattern id={pid} width={step} height={step} patternUnits="userSpaceOnUse">
                        <circle cx={step / 2} cy={step / 2} r={r} fill={stroke} />
                    </pattern>
                    {fill}
                </g>
            );
        }
        case "hatch": {
            const gap = 18 + Math.floor(rnd() * 14);
            const angle = rnd() < 0.5 ? 45 : -45;
            return (
                <g opacity={0.07}>
                    <pattern
                        id={pid}
                        width={gap}
                        height={gap}
                        patternUnits="userSpaceOnUse"
                        patternTransform={`rotate(${angle})`}
                    >
                        <line x1={0} y1={0} x2={0} y2={gap} stroke={stroke} strokeWidth={1.2} />
                    </pattern>
                    {fill}
                </g>
            );
        }
        case "rings": {
            // Concentric rings can't tile; draw 6 rings around a seeded centre.
            const cx = round(W * (0.55 + rnd() * 0.35));
            const cy = round(H * (0.15 + rnd() * 0.4));
            const gap = 60 + Math.floor(rnd() * 40);
            return (
                <g opacity={0.08} fill="none" stroke={stroke} strokeWidth={1.4}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <circle key={i} cx={cx} cy={cy} r={gap * i} />
                    ))}
                </g>
            );
        }
        case "cubes": {
            const s = 30 + Math.floor(rnd() * 14);
            const h = round(s * 0.866);
            const w = round(s * 1.5);
            // One isometric cube per tile; the tile is offset by half a row via
            // a second copy so the hex lattice stays continuous.
            const cube = (px: number, py: number) => {
                const a = round(s * 0.75);
                const b = round(h / 2);
                return `M${px},${py - h} L${px + a},${py - b} L${px + a},${py + b} L${px},${py + h} L${px - a},${py + b} L${px - a},${py - b} Z M${px},${py} L${px},${py + h} M${px},${py} L${px + a},${py - b} M${px},${py} L${px - a},${py - b}`;
            };
            return (
                <g opacity={0.09}>
                    <pattern id={pid} width={w} height={h * 3} patternUnits="userSpaceOnUse">
                        <path
                            d={`${cube(round(w / 2), h)} ${cube(0, round(h * 2.5))} ${cube(w, round(h * 2.5))}`}
                            fill="none"
                            stroke={stroke}
                            strokeWidth={1.1}
                        />
                    </pattern>
                    {fill}
                </g>
            );
        }
    }
}

export function CoverArt({
    project,
    className,
}: {
    project: Project;
    className?: string;
}): ReactNode {
    const seed = coverSeed(project.slug);
    const rnd = coverRandom(seed);
    const hue = project.hue ?? DEFAULT_HUE;
    const family = FAMILIES[Math.floor(rnd() * FAMILIES.length)] ?? "dots";
    const gx = round(20 + rnd() * 40);
    const gy = round(10 + rnd() * 40);
    const letters = monogram(project.name);
    const fontSize = letters.length > 1 ? 300 : 360;
    const chips = project.stack.slice(0, 3);
    const id = `cover-${project.slug}`;
    const style = { "--cover-h": hue } as CSSProperties;

    const chipNodes = layoutChips(chips).map(({ label, x, w }) => {
        return (
            <g key={label}>
                <rect
                    x={x}
                    y={H - 72}
                    width={w}
                    height={40}
                    rx={20}
                    fill="var(--surface)"
                    opacity={0.6}
                />
                <text
                    x={x + w / 2}
                    y={H - 45}
                    textAnchor="middle"
                    fontFamily="var(--font-mono), ui-monospace, monospace"
                    fontSize={18}
                    fontWeight={600}
                    fill="var(--fg)"
                    opacity={0.7}
                >
                    {label}
                </text>
            </g>
        );
    });

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            focusable="false"
            className={className}
            style={style}
            data-cover-family={family}
        >
            <defs>
                <linearGradient id={`${id}-base`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" style={{ stopColor: "oklch(0.3 0.07 var(--cover-h))" }} />
                    <stop offset="1" style={{ stopColor: "oklch(0.18 0.04 var(--cover-h))" }} />
                </linearGradient>
                <radialGradient id={`${id}-glow`} cx={`${gx}%`} cy={`${gy}%`} r="70%">
                    <stop
                        offset="0"
                        style={{ stopColor: "oklch(0.65 0.2 var(--cover-h))", stopOpacity: 0.6 }}
                    />
                    <stop
                        offset="1"
                        style={{ stopColor: "oklch(0.65 0.2 var(--cover-h))", stopOpacity: 0 }}
                    />
                </radialGradient>
            </defs>
            <rect width={W} height={H} fill="var(--surface)" />
            <rect width={W} height={H} fill={`url(#${id}-base)`} opacity={0.92} />
            <rect width={W} height={H} fill={`url(#${id}-glow)`} />
            {pattern(family, rnd, id)}
            <text
                x={W - 40 + 10}
                y={H / 2 + fontSize * 0.36 + 10}
                textAnchor="end"
                fontFamily="var(--font-mono), ui-monospace, monospace"
                fontSize={fontSize}
                fontWeight={800}
                fill="var(--accent)"
                opacity={0.25}
            >
                {letters}
            </text>
            <text
                x={W - 40}
                y={H / 2 + fontSize * 0.36}
                textAnchor="end"
                fontFamily="var(--font-mono), ui-monospace, monospace"
                fontSize={fontSize}
                fontWeight={800}
                fill="var(--fg)"
                opacity={0.9}
                data-monogram
            >
                {letters}
            </text>
            {chipNodes}
        </svg>
    );
}
