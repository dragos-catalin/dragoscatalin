import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ContactSection } from "@/components/contact/ContactSection";
import { CoverArt } from "@/components/projects/CoverArt";
import { ButtonLink } from "@/components/ui";
import type { Project } from "@/data/types";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { shotSrc, type ShotKey } from "@/lib/shots";
import { cn } from "@/lib/utils";
import { teaserProjects } from "@/skins/shared/projects";

type Device = "watch" | "phone" | "desktop" | "tv";

/** Which frame each tile gets, in order; spans keep the wall balanced at lg (6 columns). */
const LAYOUT: { device: Device; shot: ShotKey; span: string; frameMax: string }[] = [
    { device: "desktop", shot: "desktop-dark", span: "lg:col-span-4", frameMax: "" },
    { device: "phone", shot: "mobile-dark", span: "lg:col-span-2", frameMax: "max-w-[11rem]" },
    { device: "tv", shot: "desktop-dark", span: "lg:col-span-3", frameMax: "" },
    { device: "watch", shot: "mobile-dark", span: "lg:col-span-1", frameMax: "max-w-[8rem]" },
    { device: "desktop", shot: "desktop-dark", span: "lg:col-span-2", frameMax: "" },
];

function Screen({ project, shot, alt }: { project: Project; shot: ShotKey; alt: string }) {
    const src = shotSrc(project.slug, shot);
    if (src)
        return (
            <Image
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-top"
            />
        );
    // No screenshot yet (public/shots/manifest.json): generated cover art, decorative.
    return <CoverArt project={project} className="absolute inset-0 size-full" />;
}

/** Device-wall home: each project shown inside the frame of a screen it runs on. */
export async function DevicesHome() {
    const locale = (await getLocale()) as Locale;
    const t = await getTranslations("hero");
    const ts = await getTranslations("skins");
    const items = teaserProjects(LAYOUT.length);

    return (
        <>
            <section aria-labelledby="dv-title" className="py-14 md:py-20">
                <div className="container-x flex flex-col items-center text-center">
                    <p className="mb-6 font-mono text-xs tracking-[0.2em] text-accent uppercase">
                        {t("eyebrow")}
                    </p>
                    <h1
                        id="dv-title"
                        className="max-w-5xl font-display text-5xl leading-[0.95] font-extrabold tracking-tighter text-balance text-fg sm:text-6xl md:text-7xl"
                    >
                        <span className="block">{t("titleLine1")}</span>
                        <span className="block text-accent">{t("titleLine2")}</span>
                    </h1>
                    <p className="mt-6 max-w-xl text-lg text-pretty text-fg-muted">
                        {t("subtitle")}
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <ButtonLink href="/projects" variant="primary" size="lg">
                            {t("ctaProjects")}
                        </ButtonLink>
                        <ButtonLink href="#contact" variant="secondary" size="lg">
                            {t("ctaContact")}
                        </ButtonLink>
                    </div>
                </div>
            </section>

            <section aria-labelledby="dv-wall" className="pb-16 md:pb-24">
                <div className="container-x">
                    <div className="mb-8 flex items-end justify-between gap-4">
                        <h2
                            id="dv-wall"
                            className="font-display text-3xl font-bold tracking-[-0.03em] text-fg md:text-5xl"
                        >
                            {ts("projectsTitle")}
                        </h2>
                        <Link
                            href="/projects"
                            className="link-inline text-sm font-medium text-accent hover:underline"
                        >
                            {ts("allProjects")}
                        </Link>
                    </div>
                    <ul className="grid grid-cols-1 items-end gap-8 sm:grid-cols-2 lg:grid-cols-6">
                        {items.map((p, i) => {
                            const slot = LAYOUT[i % LAYOUT.length]!;
                            const device = ts(`devices.${slot.device}`);
                            return (
                                <li key={p.slug} className={cn("dv-tile", slot.span)}>
                                    <Link
                                        href={`/projects/${p.slug}`}
                                        className="flex flex-col items-center gap-4 rounded-card p-2"
                                    >
                                        <figure className="w-full">
                                            <div
                                                className={cn(
                                                    "dv-frame mx-auto w-full",
                                                    `dv-${slot.device}`,
                                                    slot.frameMax,
                                                )}
                                            >
                                                <Screen
                                                    project={p}
                                                    shot={slot.shot}
                                                    alt={ts("devices.onDevice", {
                                                        name: p.name,
                                                        device,
                                                    })}
                                                />
                                            </div>
                                            {slot.device === "tv" ? (
                                                <div aria-hidden="true" className="dv-stand" />
                                            ) : null}
                                            <figcaption className="mt-4 text-center">
                                                <span className="block font-display text-lg font-bold text-fg">
                                                    {p.name}
                                                </span>
                                                <span className="block text-sm text-pretty text-fg-muted">
                                                    {p.tagline[locale]}
                                                </span>
                                                <span className="mt-1 block font-mono text-[11px] tracking-[0.16em] text-fg-muted uppercase">
                                                    {device}
                                                </span>
                                            </figcaption>
                                        </figure>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            <ContactSection />
        </>
    );
}
