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

function pattern(family: Family, rnd: () => number): ReactNode {
    const stroke = "var(--fg)";
    switch (family) {
        case "dots": {
            const step = 28 + Math.floor(rnd() * 20);
            const r = 1.5 + rnd() * 1.5;
            const nodes: ReactNode[] = [];
            for (let y = step / 2; y < H; y += step)
                for (let x = step / 2; x < W; x += step)
                    nodes.push(
                        <circle key={`${x}-${y}`} cx={x} cy={y} r={round(r)} fill={stroke} />,
                    );
            return <g opacity={0.08}>{nodes}</g>;
        }
        case "hatch": {
            const gap = 18 + Math.floor(rnd() * 14);
            const dir = rnd() < 0.5 ? 1 : -1;
            const nodes: ReactNode[] = [];
            for (let i = -H; i < W + H; i += gap)
                nodes.push(
                    <line
                        key={i}
                        x1={i}
                        y1={dir > 0 ? 0 : H}
                        x2={i + dir * H}
                        y2={dir > 0 ? H : 0}
                        stroke={stroke}
                        strokeWidth={1.2}
                    />,
                );
            return <g opacity={0.07}>{nodes}</g>;
        }
        case "rings": {
            const cx = round(W * (0.55 + rnd() * 0.35));
            const cy = round(H * (0.15 + rnd() * 0.4));
            const gap = 22 + Math.floor(rnd() * 16);
            const nodes: ReactNode[] = [];
            for (let r = gap; r < W; r += gap)
                nodes.push(
                    <circle
                        key={r}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={1.4}
                    />,
                );
            return <g opacity={0.08}>{nodes}</g>;
        }
        case "cubes": {
            const s = 30 + Math.floor(rnd() * 14);
            const h = s * 0.866;
            const nodes: ReactNode[] = [];
            let row = 0;
            for (let y = -h; y < H + h; y += h * 1.5, row++) {
                const off = row % 2 ? s * 0.75 : 0;
                for (let x = -s; x < W + s; x += s * 1.5) {
                    const px = round(x + off);
                    const py = round(y);
                    const hex = [
                        [px, py - h],
                        [px + s * 0.75, py - h / 2],
                        [px + s * 0.75, py + h / 2],
                        [px, py + h],
                        [px - s * 0.75, py + h / 2],
                        [px - s * 0.75, py - h / 2],
                    ]
                        .map(([a, b]) => `${round(a ?? 0)},${round(b ?? 0)}`)
                        .join(" ");
                    nodes.push(
                        <g key={`${px}-${py}`}>
                            <polygon points={hex} fill="none" stroke={stroke} strokeWidth={1.1} />
                            <path
                                d={`M${px},${py} L${px},${round(py + h)} M${px},${py} L${round(px + s * 0.75)},${round(py - h / 2)} M${px},${py} L${round(px - s * 0.75)},${round(py - h / 2)}`}
                                stroke={stroke}
                                strokeWidth={1.1}
                                fill="none"
                            />
                        </g>,
                    );
                }
            }
            return <g opacity={0.09}>{nodes}</g>;
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
            {pattern(family, rnd)}
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
