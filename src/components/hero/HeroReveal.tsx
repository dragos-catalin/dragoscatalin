import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pure-CSS entrance (see `.hero-item` in globals.css). Server components, no
 * hydration dependency: the headline is the LCP element and must paint on the
 * first frame — a motion `initial="hidden"` kept it invisible for ~1.7 s until
 * the client bundle ran (measured with Lighthouse, 2026-09-15).
 *
 * Items receive `--i` for their stagger index; reduced motion disables it.
 */
export function HeroReveal({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("hero-reveal", className)}>{children}</div>;
}

export function HeroItem({
    children,
    className,
    index = 0,
    lcp = false,
}: {
    children: ReactNode;
    className?: string;
    index?: number;
    /** Mark the LCP element: transform-only entrance, never hidden. */
    lcp?: boolean;
}) {
    return (
        <div
            className={cn("hero-item", className)}
            data-lcp={lcp ? "" : undefined}
            style={{ "--i": index } as CSSProperties}
        >
            {children}
        </div>
    );
}
