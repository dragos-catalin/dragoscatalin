import { Skeleton } from "@/components/ui";

export default function Loading() {
    return (
        <div className="container-x space-y-12 py-20">
            <Skeleton className="h-12 w-60" />
            {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-card" />
            ))}
        </div>
    );
}
