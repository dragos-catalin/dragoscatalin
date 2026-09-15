import { Skeleton } from "@/components/ui";

export function ProjectGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="flex flex-col gap-8" aria-busy>
            <div className="flex flex-col gap-4">
                <Skeleton className="h-10 w-full max-w-md rounded-pill" />
                <Skeleton className="h-7 w-3/4 rounded-pill" />
                <Skeleton className="h-7 w-2/3 rounded-pill" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: count }, (_, i) => (
                    <div key={i} className="rounded-card surface flex flex-col overflow-hidden">
                        <Skeleton className="aspect-[16/10] w-full rounded-none" />
                        <div className="flex flex-col gap-3 p-5">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-6 w-2/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <div className="flex gap-1.5 pt-1">
                                <Skeleton className="h-5 w-14" />
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-12" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
