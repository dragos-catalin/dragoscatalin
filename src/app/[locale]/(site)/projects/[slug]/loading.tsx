import { Skeleton } from "@/components/ui";

export default function Loading() {
    return (
        <div className="container-x flex flex-col gap-10 py-12 md:py-16" aria-busy>
            <Skeleton className="h-4 w-28" />
            <div className="grid gap-8 lg:grid-cols-[3fr_2fr] lg:items-end">
                <Skeleton className="aspect-[16/10] w-full rounded-card lg:order-2" />
                <div className="flex flex-col gap-5 lg:order-1">
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-pill" />
                        <Skeleton className="h-6 w-20 rounded-pill" />
                    </div>
                    <Skeleton className="h-14 w-2/3" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-11/12" />
                    <Skeleton className="h-5 w-4/5" />
                </div>
                <Skeleton className="h-64 w-full rounded-card" />
            </div>
        </div>
    );
}
