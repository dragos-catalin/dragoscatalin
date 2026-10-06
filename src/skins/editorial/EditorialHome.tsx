import { ArrowUpRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { ContactSection } from "@/components/contact/ContactSection";
import { ButtonLink } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { teaserProjects } from "@/skins/shared/projects";
import { ChaptersPin } from "./ChaptersPin";
import { KineticHeadline } from "./KineticHeadline";

/**
 * Editorial home: a kinetic magazine cover headline, then the work as numbered chapters.
 * Server-rendered and complete without JS; the two client children only enhance it
 * (SplitText on the h1, a pinned horizontal track on desktop with a fine pointer).
 */
export async function EditorialHome() {
    const locale = (await getLocale()) as Locale;
    const t = await getTranslations("hero");
    const ts = await getTranslations("skins");
    const tp = await getTranslations("projects");
    const items = teaserProjects(6);

    return (
        <>
            <section aria-labelledby="ed-title" className="py-16 md:py-24">
                <div className="container-x">
                    <p className="mb-8 font-mono text-xs tracking-[0.2em] text-accent uppercase">
                        {t("eyebrow")}
                    </p>
                    <KineticHeadline
                        id="ed-title"
                        line1={t("titleLine1")}
                        line2={t("titleLine2")}
                    />
                    <div className="ed-fade ed-rule mt-12 grid gap-8 pt-8 md:grid-cols-[1fr_auto] md:items-end">
                        <p className="max-w-2xl text-lg leading-relaxed text-pretty text-fg-muted md:text-xl">
                            {t("subtitle")}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <ButtonLink href="/projects" variant="primary" size="lg">
                                {t("ctaProjects")}
                            </ButtonLink>
                            <ButtonLink href="#contact" variant="secondary" size="lg">
                                {t("ctaContact")}
                            </ButtonLink>
                        </div>
                    </div>
                </div>
            </section>

            <section aria-labelledby="ed-index" className="py-16 md:py-24">
                <ChaptersPin>
                    <div className="ed-chapters-head container-x">
                        <div className="mb-8 flex items-end justify-between gap-4">
                            <h2
                                id="ed-index"
                                className="font-display text-3xl font-bold tracking-[-0.03em] text-fg md:text-5xl"
                            >
                                {ts("editorial.index")}
                            </h2>
                            <Link
                                href="/projects"
                                className="link-inline text-sm font-medium text-accent hover:underline"
                            >
                                {ts("allProjects")}
                            </Link>
                        </div>
                        <div className="ed-progress-rail" aria-hidden>
                            <div className="ed-progress" data-ed-progress />
                        </div>
                    </div>
                    <ol className="ed-track" data-ed-track>
                        {items.map((p, i) => (
                            <li key={p.slug} className="ed-chapter" data-ed-chapter>
                                <Link href={`/projects/${p.slug}`} className="ed-chapter-link">
                                    <span
                                        className="ed-chapter-num font-display font-extrabold text-accent"
                                        data-ed-num
                                        aria-hidden
                                    >
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span className="ed-chapter-name font-display font-extrabold text-fg">
                                        {p.name}
                                    </span>
                                    <span className="ed-chapter-tagline text-pretty text-fg-muted">
                                        {p.tagline[locale]}
                                    </span>
                                    <span className="ed-chapter-meta flex items-center justify-between gap-2 font-mono text-xs text-fg-muted uppercase">
                                        <span>{tp(`status.${p.status}`)}</span>
                                        <ArrowUpRight className="size-5 text-accent" aria-hidden />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                </ChaptersPin>
            </section>

            <ContactSection />
        </>
    );
}
