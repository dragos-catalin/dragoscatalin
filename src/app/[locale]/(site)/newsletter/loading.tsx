import { Skeleton } from "@/components/ui";

export default function Loading() {
    return (
        <div className="container-x space-y-8 py-20">
            <Skeleton className="h-12 w-60" />
            <Skeleton className="h-24 w-full max-w-prose rounded-card" />
            <Skeleton className="h-40 w-full max-w-xl rounded-card" />
        </div>
    );
}
