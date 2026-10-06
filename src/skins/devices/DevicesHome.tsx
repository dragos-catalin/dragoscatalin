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
import { pickDevice, type Device } from "./carousel-math";
import { DeviceCarousel, type DeviceCarouselSlide } from "./DeviceCarousel";

/** Preferred frame per slot, in order; a project that does not run there gets its own first device. */
const SLOTS: Device[] = ["desktop", "phone", "tv", "watch", "desktop", "phone"];

const FRAME: Record<Device, { shot: ShotKey; max: string }> = {
    desktop: { shot: "desktop-dark", max: "" },
    tv: { shot: "desktop-dark", max: "" },
    phone: { shot: "mobile-dark", max: "max-w-[8.5rem]" },
    watch: { shot: "mobile-dark", max: "max-w-[7rem]" },
};

function Screen({ project, shot, alt }: { project: Project; shot: ShotKey; alt: string }) {
    const src = shotSrc(project.slug, shot);
    // The h1 is the LCP on this page, so no carousel image gets `priority`.
    if (src)
        return (
            <Image
                src={src}
                alt={alt}
                fill
                sizes="(min-width: 48rem) 16rem, 75vw"
                className="object-cover object-top"
                draggable={false}
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
    const items = teaserProjects(SLOTS.length);

    const slides: DeviceCarouselSlide[] = items.map((p, i) => {
        const kind = pickDevice(
            (p.surfaces ?? []).map((s) => s.label),
            SLOTS[i % SLOTS.length]!,
        );
        const frame = FRAME[kind];
        const device = ts(`devices.${kind}`);
        return {
            key: p.slug,
            label: ts("devices.slideLabel", {
                index: i + 1,
                total: items.length,
                name: p.name,
            }),
            content: (
                <Link
                    href={`/projects/${p.slug}`}
                    draggable={false}
                    className="dv-card flex h-full flex-col items-center justify-end gap-4 rounded-card p-2"
                >
                    <figure className="w-full">
                        <div className={cn("dv-frame mx-auto w-full", `dv-${kind}`, frame.max)}>
                            <Screen
                                project={p}
                                shot={frame.shot}
                                alt={ts("devices.onDevice", { name: p.name, device })}
                            />
                        </div>
                        {kind === "tv" ? <div aria-hidden="true" className="dv-stand" /> : null}
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
            ),
        };
    });

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
                    <DeviceCarousel
                        slides={slides}
                        labels={{
                            carousel: ts("devices.carousel"),
                            previous: ts("devices.previous"),
                            next: ts("devices.next"),
                            pause: ts("devices.pause"),
                            play: ts("devices.play"),
                        }}
                    />
                </div>
            </section>

            <ContactSection />
        </>
    );
}
