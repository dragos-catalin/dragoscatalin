/** Vertical rail: a static line with an accent-to-transparent fade. No scroll-linked animation. */
export function TimelineRail({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`relative ${className ?? ""}`}>
            <div
                aria-hidden="true"
                className="absolute top-8 bottom-8 left-[7px] w-px bg-gradient-to-b from-accent via-line to-transparent"
            />
            {children}
        </div>
    );
}
