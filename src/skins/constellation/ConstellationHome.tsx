import { getLocale, getTranslations } from "next-intl/server";
import { ContactSection } from "@/components/contact/ContactSection";
import { ButtonLink } from "@/components/ui";
import { featuredProjects } from "@/data/projects";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { teaserProjects } from "@/skins/shared/projects";
import { cn } from "@/lib/utils";
import { SkyCanvasIsland } from "./SkyCanvasIsland";
import { Starfield } from "./Starfield";

/**
 * Constellation home: headline over a static starfield poster (LCP-safe first paint and the
 * low-end / reduced-motion fallback), with the R3F sky lazily mounted on top after load + idle.
 */
export async function ConstellationHome() {
    const locale = (await getLocale()) as Locale;
    const t = await getTranslations("hero");
    const ts = await getTranslations("skins");
    const items = teaserProjects(6);
    const flagships = new Set(featuredProjects.map((p) => p.slug));
    const flags = Math.min(flagships.size, 3);

    return (
        <>
            <section
                aria-labelledby="cs-title"
                className="relative isolate flex min-h-[80dvh] items-center overflow-hidden"
            >
                <Starfield flags={flags} />
                <SkyCanvasIsland flags={flags} />
                <div className="container-x relative z-10 py-20 text-center">
                    <p className="mb-6 font-mono text-xs tracking-[0.2em] text-accent uppercase">
                        {t("eyebrow")}
                    </p>
                    <h1
                        id="cs-title"
                        className="mx-auto max-w-5xl font-display text-5xl leading-[0.95] font-extrabold tracking-tighter text-balance text-fg sm:text-6xl md:text-7xl lg:text-8xl"
                    >
                        <span className="block">{t("titleLine1")}</span>
                        <span className="block text-accent">{t("titleLine2")}</span>
                    </h1>
                    <p className="mx-auto mt-8 max-w-xl text-lg text-pretty text-fg-muted">
                        {t("subtitle")}
                    </p>
                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        <ButtonLink href="/projects" variant="primary" size="lg">
                            {t("ctaProjects")}
                        </ButtonLink>
                        <ButtonLink href="#contact" variant="secondary" size="lg">
                            {t("ctaContact")}
                        </ButtonLink>
                    </div>
                </div>
            </section>

            <section aria-labelledby="cs-map" className="relative py-16 md:py-24">
                <div className="container-x">
                    <h2
                        id="cs-map"
                        className="font-display text-3xl font-bold tracking-[-0.03em] text-fg md:text-5xl"
                    >
                        {ts("projectsTitle")}
                    </h2>
                    <p className="mt-3 max-w-2xl text-fg-muted">{ts("constellation.legend")}</p>
                    <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((p) => {
                            const flag = flagships.has(p.slug);
                            return (
                                <li key={p.slug}>
                                    <Link
                                        href={`/projects/${p.slug}`}
                                        className="cs-node flex h-full flex-col gap-3 rounded-card p-5"
                                    >
                                        <span className="flex items-center gap-3">
                                            <span
                                                aria-hidden="true"
                                                className={cn("cs-dot", flag && "cs-dot-flag")}
                                            />
                                            <span className="font-display text-xl font-bold text-fg">
                                                {p.name}
                                            </span>
                                        </span>
                                        <span className="text-sm text-pretty text-fg-muted">
                                            {p.tagline[locale]}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <p className="mt-8">
                        <Link
                            href="/projects"
                            className="link-inline text-sm font-medium text-accent hover:underline"
                        >
                            {ts("allProjects")}
                        </Link>
                    </p>
                </div>
            </section>

            <ContactSection />
        </>
    );
}
