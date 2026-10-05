import { ArrowUpRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { ContactSection } from "@/components/contact/ContactSection";
import { ButtonLink } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { teaserProjects } from "@/skins/shared/projects";

/** Editorial home: a magazine cover headline and a numbered index of the work. */
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
                    <h1 id="ed-title" className="ed-headline font-display font-extrabold text-fg">
                        <span className="ed-line" style={{ "--i": 0 } as React.CSSProperties}>
                            {t("titleLine1")}
                        </span>
                        <span
                            className="ed-line text-accent"
                            style={{ "--i": 1 } as React.CSSProperties}
                        >
                            {t("titleLine2")}
                        </span>
                    </h1>
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
                <div className="container-x">
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
                    <ol className="ed-rule">
                        {items.map((p, i) => (
                            <li key={p.slug} className="ed-index-item">
                                <Link
                                    href={`/projects/${p.slug}`}
                                    className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-6 md:grid-cols-[5rem_minmax(0,22rem)_1fr_auto] md:gap-8"
                                >
                                    <span className="font-mono text-sm text-fg-subtle">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span className="ed-index-name font-display text-3xl font-extrabold tracking-[-0.03em] text-fg md:text-5xl">
                                        {p.name}
                                    </span>
                                    <span className="col-start-2 text-pretty text-fg-muted md:col-start-auto">
                                        {p.tagline[locale]}
                                    </span>
                                    <span className="row-start-1 flex items-center gap-2 font-mono text-xs text-fg-muted uppercase md:row-start-auto">
                                        <span className="max-md:sr-only">
                                            {tp(`status.${p.status}`)}
                                        </span>
                                        <ArrowUpRight className="size-5 text-accent" aria-hidden />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <ContactSection />
        </>
    );
}
