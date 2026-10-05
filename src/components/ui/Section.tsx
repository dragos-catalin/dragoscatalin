import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeadingTag = "h1" | "h2" | "h3";

export interface SectionProps {
    id?: string;
    className?: string;
    /** Inner wrapper class (inside `container-x`). */
    innerClassName?: string;
    eyebrow?: ReactNode;
    title?: ReactNode;
    subtitle?: ReactNode;
    action?: ReactNode;
    as?: HeadingTag;
    children?: ReactNode;
}

export function Section({
    id,
    className,
    innerClassName,
    eyebrow,
    title,
    subtitle,
    action,
    as: Heading = "h2",
    children,
}: SectionProps) {
    const hasHeader = Boolean(eyebrow || title || subtitle || action);
    return (
        <section id={id} className={cn("relative py-20 md:py-28", className)}>
            <div className={cn("container-x", innerClassName)}>
                {hasHeader ? (
                    <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl">
                            {eyebrow ? (
                                <p className="mb-3 font-mono text-xs tracking-[0.18em] text-accent uppercase">
                                    {eyebrow}
                                </p>
                            ) : null}
                            {title ? (
                                <Heading className="font-display text-3xl font-bold tracking-[-0.03em] text-balance text-fg md:text-4xl lg:text-5xl">
                                    {title}
                                </Heading>
                            ) : null}
                            {subtitle ? (
                                <p className="mt-4 text-base text-pretty text-fg-muted md:text-lg">
                                    {subtitle}
                                </p>
                            ) : null}
                        </div>
                        {action ? <div className="shrink-0">{action}</div> : null}
                    </div>
                ) : null}
                {children}
            </div>
        </section>
    );
}
