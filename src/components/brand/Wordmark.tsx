import { COMMA } from "./geometry";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * "Dragoș Cătălin" in Bricolage Grotesque (wght 720, wdth 88) with the comma of ș redrawn
 * as a round accent drop — the brand's one Romanian cue. Live text (selectable, crisp at any
 * size); the screen-reader name is the real spelling. Geometry: brand/src/build.mjs.
 *
 * The comma sits under the s: baseline = 0.83em from the top of a line-height-1 box
 * (Bricolage ascent 930 / descent 270 per 1000), comma box starts 7 units (cap = 0.66em) below.
 */
export function Wordmark({ className }: { className?: string }) {
    return (
        <span
            className={cn("font-display leading-none tracking-[-0.025em] [font-weight:720]", className)}
        >
            <span className="sr-only">{site.name}</span>
            <span aria-hidden="true" className="inline-block whitespace-nowrap">
                Drago
                <span className="relative inline-block leading-none">
                    s
                    <svg
                        viewBox={COMMA.viewBox}
                        focusable="false"
                        className="brand-comma absolute top-[0.876em] left-[calc(50%-0.0815em)] h-[0.273em] w-[0.144em] overflow-visible"
                    >
                        <path d={COMMA.d} fill="var(--accent)" />
                    </svg>
                </span>{" "}
                Cătălin
            </span>
        </span>
    );
}
