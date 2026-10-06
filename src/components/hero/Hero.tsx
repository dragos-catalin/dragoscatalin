import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge, ButtonLink } from "@/components/ui";
import { HeroItem, HeroReveal } from "./HeroReveal";
import { StackLayers } from "./StackLayers";
import { TechStack } from "./TechStack";

export async function Hero() {
    const t = await getTranslations("hero");

    return (
        <section id="home" className="relative isolate overflow-hidden">
            {/* Ambient glow behind the headline — static, GPU-cheap */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-[18%] left-[8%] -z-10 size-[min(560px,90vw)] rounded-full bg-accent-soft blur-[120px]"
            />
            {/* Grid pattern */}
            <div
                aria-hidden="true"
                className="hero-grid pointer-events-none absolute inset-0 -z-10"
            />

            <div className="container-x relative z-10 pt-16 pb-14 md:pt-24 lg:pt-28">
                <HeroReveal className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
                    <div className="flex flex-col items-start">
                        <HeroItem index={0} className="mb-8 flex flex-wrap items-center gap-3">
                            <Badge variant="success" dot className="tracking-wide uppercase">
                                {t("available")}
                            </Badge>
                            <span className="font-mono text-xs tracking-[0.14em] text-fg-subtle uppercase">
                                {t("eyebrow")}
                            </span>
                        </HeroItem>

                        <HeroItem index={1} lcp className="mb-6">
                            <h1 className="font-display text-[clamp(2.6rem,6.4vw,5.6rem)] leading-[0.95] font-extrabold tracking-tighter text-balance">
                                <span className="block text-fg">{t("titleLine1")}</span>
                                <span className="gradient-text block pb-1">{t("titleLine2")}</span>
                            </h1>
                        </HeroItem>

                        <HeroItem index={2} className="mb-9">
                            <p className="max-w-xl text-base leading-relaxed text-pretty text-fg-muted sm:text-lg">
                                {t("subtitle")}
                            </p>
                        </HeroItem>

                        <HeroItem
                            index={3}
                            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
                        >
                            <ButtonLink
                                href="/projects"
                                variant="primary"
                                size="lg"
                                className="rounded-pill px-8"
                            >
                                {t("ctaProjects")}
                                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
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
                    </div>

                    <HeroItem index={4}>
                        <StackLayers />
                    </HeroItem>
                </HeroReveal>

                <div className="mt-16 border-t border-line pt-8 md:mt-20">
                    <TechStack label={t("techLabel")} />
                </div>
            </div>
        </section>
    );
}
