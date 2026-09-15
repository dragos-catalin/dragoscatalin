import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** `muted` is an alias of `neutral`. */
export type BadgeVariant =
    "neutral" | "muted" | "accent" | "success" | "warning" | "danger" | "outline";

const variants: Record<BadgeVariant, string> = {
    neutral: "bg-surface-raised text-fg-muted border-line",
    muted: "bg-surface-raised text-fg-muted border-line",
    accent: "bg-accent-soft text-accent border-transparent",
    success: "bg-success/12 text-success border-transparent",
    warning: "bg-warning/14 text-warning border-transparent",
    danger: "bg-danger/12 text-danger border-transparent",
    outline: "bg-transparent text-fg-muted border-line-strong",
};

const dotColor: Record<BadgeVariant, string> = {
    neutral: "bg-fg-subtle",
    muted: "bg-fg-subtle",
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    outline: "bg-fg-muted",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    /** Show a status dot. `"live"` pulses (disabled under prefers-reduced-motion). */
    dot?: boolean | "live";
}

export function Badge({
    variant = "neutral",
    dot = false,
    className,
    children,
    ...rest
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5 text-xs font-medium leading-5 whitespace-nowrap shadow-[var(--elev-inset)]",
                variants[variant],
                className,
            )}
            {...rest}
        >
            {dot ? (
                <span className="relative flex size-2" aria-hidden>
                    {dot === "live" ? (
                        <span
                            className={cn(
                                "absolute inline-flex size-full rounded-full opacity-75 motion-safe:animate-ping",
                                dotColor[variant],
                            )}
                        />
                    ) : null}
                    <span
                        className={cn(
                            "relative inline-flex size-2 rounded-full",
                            dotColor[variant],
                        )}
                    />
                </span>
            ) : null}
            {children}
        </span>
    );
}
