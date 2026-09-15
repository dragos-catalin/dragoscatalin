import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { ActivityHeatmap } from "./ActivityHeatmap";

export async function NowStrip() {
    const t = await getTranslations("now");
    return (
        <section
            id="now"
            aria-labelledby="now-title"
            className="container-x scroll-mt-24 py-12 md:py-16"
        >
            <div className="surface rounded-card grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:p-8">
                <div className="flex flex-col gap-3">
                    <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
                        {t("eyebrow")}
                    </p>
                    <h2 id="now-title" className="sr-only">
                        {t("title")}
                    </h2>
                    <p className="text-base leading-relaxed text-fg md:text-lg">
                        <span aria-hidden="true" className="mr-2 font-mono text-accent">
                            ›
                        </span>
                        {t("focus")}
                    </p>
                    <Link
                        href="/now"
                        className="mt-auto inline-flex items-center gap-1.5 self-start text-sm font-medium text-fg-muted transition-colors hover:text-accent"
                    >
                        {t("seeAll")}
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>
                <Suspense fallback={<Skeleton className="h-24 w-full" />}>
                    <ActivityHeatmap />
                </Suspense>
            </div>
        </section>
    );
}
