import { Skeleton } from "@/components/ui";

export default function Loading() {
    return (
        <div className="container-x py-20">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
                <Skeleton className="size-40 shrink-0 rounded-full" />
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-6 w-2/3" />
                </div>
            </div>
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                    <Skeleton key={i} className="h-44 w-full rounded-card" />
                ))}
            </div>
        </div>
    );
}
