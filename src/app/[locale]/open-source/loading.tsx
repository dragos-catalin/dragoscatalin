import { Skeleton } from "@/components/ui";

export default function Loading() {
    return (
        <div className="container-x space-y-16 py-20">
            <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-72" />
            </div>
            <Skeleton className="h-64 w-full rounded-card" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                    <Skeleton key={i} className="h-52 w-full rounded-card" />
                ))}
            </div>
        </div>
    );
}
