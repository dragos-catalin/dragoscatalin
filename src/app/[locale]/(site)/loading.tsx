import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui";

export default async function Loading() {
    const t = await getTranslations("common");
    return (
        <div role="status" aria-live="polite" aria-busy="true" className="min-h-[100dvh]">
            <span className="sr-only">{t("loading")}</span>
            <div className="container-x flex min-h-[100dvh] items-center pt-28 pb-24">
                <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,45%)_1fr]">
                    <div className="flex max-w-2xl flex-col gap-6">
                        <Skeleton className="h-5 w-56" />
                        <Skeleton className="h-[clamp(2.5rem,6vw,6rem)] w-full" />
                        <Skeleton className="h-[clamp(2.5rem,6vw,6rem)] w-4/5" />
                        <Skeleton className="h-6 w-full max-w-xl" />
                        <Skeleton className="h-6 w-3/4 max-w-xl" />
                        <div className="flex gap-3 pt-2">
                            <Skeleton className="h-12 w-36 rounded-pill" />
                            <Skeleton className="h-12 w-36 rounded-pill" />
                        </div>
                    </div>
                    <div className="hidden items-center justify-center lg:flex">
                        <Skeleton className="size-72 rounded-full opacity-60" />
                    </div>
                </div>
            </div>
        </div>
    );
}
