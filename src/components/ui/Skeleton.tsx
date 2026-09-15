import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
    return <div className={cn("skeleton", className)} aria-hidden />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <div className={cn("flex flex-col gap-2", className)} aria-hidden>
            {Array.from({ length: lines }, (_, i) => (
                <Skeleton
                    key={i}
                    className={cn("h-4", i === lines - 1 && lines > 1 ? "w-2/3" : "w-full")}
                />
            ))}
        </div>
    );
}
