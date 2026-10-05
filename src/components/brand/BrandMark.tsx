import { MARK } from "./geometry";
import { cn } from "@/lib/utils";

/**
 * Keystone mark: a solid D with the C carved out of it. The D takes the live accent
 * (--accent-mark), the tile and the carved C take --mark-tile. The C is a stroke with
 * pathLength 1 so the CSS intro can "carve" it (globals.css § Keystone logo motion).
 * Decorative by default; the surrounding link/wordmark carries the accessible name.
 */
export function BrandMark({ className, tile = true }: { className?: string; tile?: boolean }) {
    return (
        <svg
            viewBox="0 0 48 48"
            aria-hidden="true"
            focusable="false"
            className={cn("shrink-0", className)}
        >
            {tile ? <rect width="48" height="48" rx="11" fill="var(--mark-tile)" /> : null}
            <path className="brand-d" d={MARK.d} fill="var(--accent-mark)" />
            <g className="brand-c">
                <path
                    d={MARK.cStroke}
                    fill="none"
                    stroke={tile ? "var(--mark-tile)" : "var(--bg)"}
                    strokeWidth="5"
                    pathLength={1}
                    strokeDasharray="1 2"
                />
            </g>
        </svg>
    );
}
