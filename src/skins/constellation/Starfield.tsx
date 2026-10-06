import { SKY_H, SKY_W, skyLayout } from "./layout";

/**
 * Static, deterministic starfield poster (one SVG, ~140 circles, no animation). It is the LCP-safe
 * first paint and the reduced-motion / low-end fallback under the lazily mounted R3F sky (V3-05),
 * which reuses the same layout. Flagship "stars" are joined by faint constellation lines.
 */
export function Starfield({ flags }: { flags: number }) {
    const { stars, bright } = skyLayout(flags);
    const path = bright.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");

    return (
        <svg
            aria-hidden="true"
            focusable="false"
            className="cs-stars"
            viewBox={`0 0 ${SKY_W} ${SKY_H}`}
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
