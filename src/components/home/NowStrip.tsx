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
            className="container-x scroll-mt-24 py-6 md:py-8"
        >
            <div className="surface rounded-card flex flex-col gap-5 p-5 shadow-elev-1 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                    <p className="flex shrink-0 items-center gap-2 font-mono text-xs tracking-[0.18em] text-accent uppercase">
                        <span aria-hidden="true" className="relative flex size-2">
                            <span className="absolute inset-0 rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
                            <span className="relative size-2 rounded-full bg-accent" />
                        </span>
                        {t("eyebrow")}
                    </p>
                    <h2 id="now-title" className="sr-only">
                        {t("title")}
                    </h2>
                    <p className="min-w-0 flex-1 text-base leading-relaxed text-pretty text-fg">
                        {t("focus")}
                    </p>
                    <Link
                        href="/now"
                        className="link-inline shrink-0 gap-1.5 self-start text-sm font-medium text-fg-muted transition-colors hover:text-accent md:self-center"
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
