import { Skeleton } from "@/components/ui";

export default function Loading() {
    return (
        <div className="container-x space-y-16 py-20">
            <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-64" />
            </div>
            <Skeleton className="h-32 w-full max-w-3xl rounded-card" />
            <Skeleton className="h-64 w-full max-w-3xl rounded-card" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }, (_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-card" />
                ))}
            </div>
        </div>
    );
}
