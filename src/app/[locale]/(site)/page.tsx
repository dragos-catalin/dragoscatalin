import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactSection } from "@/components/contact/ContactSection";
import { Hero } from "@/components/hero/Hero";
import { Featured } from "@/components/home/Featured";
import { HelpBento } from "@/components/home/HelpBento";
import { NowStrip } from "@/components/home/NowStrip";
import { OpenSourceStrip } from "@/components/home/OpenSourceStrip";
import { ProjectsGrid } from "@/components/home/ProjectsGrid";
import { Timeline } from "@/components/home/Timeline";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "meta" });
    return {
        title: { absolute: t("title") },
        description: t("description"),
        alternates: localeAlternates(locale, "/"),
    };
}

export default function HomePage() {
    return (
        <>
            <Hero />
            <NowStrip />
            <HelpBento />
            <Featured />
            <ProjectsGrid />
            <OpenSourceStrip />
            <Timeline />
            <ContactSection />
        </>
    );
}
