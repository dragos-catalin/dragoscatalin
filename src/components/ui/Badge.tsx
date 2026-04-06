import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "warning" | "error" | "info";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "default", size = "md", children, ...props }, ref) => {
        const variants = {
            default: "bg-surface-raised text-muted border border-border",
            success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
            warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
            error: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
            info: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20",
        };

        const sizes = {
            sm: "px-2 py-0.5 text-xs",
            md: "px-2.5 py-0.5 text-xs",
            lg: "px-3 py-1 text-sm",
        };

        return (
            <span
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full font-medium",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = "Badge";

export default Badge;
