import { coverRandom, coverSeed } from "@/components/projects/cover";

const STARS = 140;

function round(n: number) {
    return Math.round(n * 100) / 100;
}

/**
 * Static, deterministic starfield poster (one SVG, ~140 circles, no animation). It is the
 * reduced-motion / low-end fallback that V3-05's lazily-mounted R3F scene will sit on top of.
 * Flagship "stars" are joined by faint constellation lines.
 */
export function Starfield({ flags }: { flags: number }) {
    const rnd = coverRandom(coverSeed("constellation"));
    const stars = Array.from({ length: STARS }, () => ({
        x: round(rnd() * 100),
        y: round(rnd() * 60),
        r: round(0.04 + rnd() * rnd() * 0.22),
        o: round(0.35 + rnd() * 0.65),
    }));
    const bright = Array.from({ length: Math.max(flags, 2) + 3 }, (_, i) => ({
        x: round(12 + i * 15 + rnd() * 6),
        y: round(14 + rnd() * 30),
    }));
    const path = bright.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");

    return (
        <svg
            aria-hidden="true"
            focusable="false"
            className="cs-stars"
            viewBox="0 0 100 60"
            preserveAspectRatio="xMidYMid slice"
        >
            {stars.map((s, i) => (
                <circle key={i} className="cs-star" cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
            ))}
            <path d={path} className="cs-link" fill="none" />
            {bright.map((p, i) => (
                <circle
                    key={`b${i}`}
                    className={i < flags ? "cs-star-flag" : "cs-star"}
                    cx={p.x}
                    cy={p.y}
                    r={i < flags ? 0.55 : 0.35}
                />
            ))}
        </svg>
    );
}
