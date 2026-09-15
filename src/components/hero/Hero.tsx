import { ArrowDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge, ButtonLink } from "@/components/ui";
import { HeroItem, HeroReveal } from "./HeroReveal";
import { TechStack } from "./TechStack";

export async function Hero() {
    const t = await getTranslations("hero");

    return (
        <section
            id="home"
            className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden"
        >
            {/* Ambient glow — static, GPU-cheap */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[min(600px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-soft blur-[120px]"
            />
            {/* Grid pattern */}
            <div
                aria-hidden="true"
                className="hero-grid pointer-events-none absolute inset-0 -z-10"
            />

            <div className="container-x relative z-10 px-6 py-24 lg:py-28">
                <HeroReveal className="mx-auto flex max-w-4xl flex-col items-center text-center">
                    <HeroItem className="mb-10">
                        <Badge variant="success" dot className="tracking-wide uppercase">
                            {t("available")}
                        </Badge>
                    </HeroItem>

                    <HeroItem className="mb-6">
                        <h1 className="text-5xl leading-[0.95] font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
                            <span className="block text-fg">{t("titleLine1")}</span>
                            <span className="gradient-text block">{t("titleLine2")}</span>
                        </h1>
                    </HeroItem>

                    <HeroItem className="mb-10">
                        <p className="mx-auto max-w-xl text-base leading-relaxed text-pretty text-fg-muted sm:text-lg">
                            {t("subtitle")}
                        </p>
                    </HeroItem>

                    <HeroItem className="mb-20 flex flex-col gap-3 sm:flex-row">
                        <ButtonLink
                            href="/projects"
                            variant="primary"
                            size="lg"
                            className="rounded-pill px-8"
                        >
                            {t("ctaProjects")}
                            <ArrowDown className="ml-2 size-4" aria-hidden="true" />
                        </ButtonLink>
                        <ButtonLink
                            href="/#contact"
                            variant="secondary"
                            size="lg"
                            className="rounded-pill px-8"
                        >
                            {t("ctaContact")}
                        </ButtonLink>
                    </HeroItem>

                    <HeroItem className="w-full">
                        <TechStack label={t("techLabel")} />
                    </HeroItem>
                </HeroReveal>
            </div>

            <a
                href="#now"
                aria-label={t("scroll")}
                className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 rounded-pill p-2 text-fg-subtle transition-colors hover:text-fg-muted"
            >
                <span
                    aria-hidden="true"
                    className="flex h-8 w-5 items-start justify-center rounded-pill border border-line-strong p-1.5"
                >
                    <span className="hero-scroll-dot size-1 rounded-full bg-fg-muted" />
                </span>
            </a>
        </section>
    );
}
