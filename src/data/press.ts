import { allPackages, projects } from "./projects";
import type { LocalizedText } from "./types";
import { site } from "@/lib/site";

export interface PressFact {
    label: LocalizedText;
    value: LocalizedText;
}

export interface PressProduct {
    slug: string;
    name: string;
    tagline: LocalizedText;
    website: string;
}

const publicRepoCount = new Set(
    projects
        .filter((p) => p.visibility === "public")
        .flatMap((p) => (p.repos ?? []).map((r) => `${r.owner}/${r.name}`)),
).size;

export const bioShort: LocalizedText = {
    en: "Dragos Catalin Vladulescu is a full-stack developer from Romania. He builds codai, an AI gateway and command center; Brivio, an ERP with e-Factura for Romanian and EU businesses; StudiAI, a course platform; and the open-source MixAI and notai. His libraries ship on npm and PyPI.",
    ro: "Dragos Catalin Vladulescu este developer full-stack din România. Construiește codai, un gateway și centru de comandă AI; Brivio, un ERP cu e-Factura pentru firme din România și UE; StudiAI, o platformă de cursuri; și proiectele open-source MixAI și notai. Bibliotecile sale sunt publicate pe npm și PyPI.",
};

export const bioLong: LocalizedText = {
    en: "Dragos Catalin Vladulescu is a full-stack developer based in Romania who designs and ships AI-native products end to end — database schema, cloud infrastructure, native desktop and polished web interfaces alike.\n\nHis flagship is codai, a live AI gateway and personal command center that exposes a single model name routed across Google Vertex (Anthropic Claude) and Azure AI Foundry, with spend caps, prompt caching and transparent pricing. It ships as a web console, a Tauri desktop app with Windows computer-use, an Android agent, and TypeScript and Python SDKs.\n\nHe is launching Brivio in Q4 2026: an ERP for Romanian and EU businesses with ANAF e-Factura and e-Transport, double-entry accounting, an immutable hash-chained audit log, SAF-T, payroll and inventory. Brivio succeeds Datuvia, a business-management platform he built for a client.\n\nStudiAI, his course platform, has been live since 2023 with inference tiers powered by codai. He maintains MixAI, a self-hosted media platform for films and music with a DJ mixer, on web, desktop and TV, and notai, a calm collaborative notes app built on a drawing canvas.\n\nOn the research side he works on HIDE, an experimental hybrid post-quantum file-encryption protocol in Rust, and notalone, a preregistered statistical search over pulsar data. He publishes open-source libraries and MCP servers on npm and PyPI, and shares the rules, skills and hooks he uses to work with AI coding agents.",
    ro: "Dragos Catalin Vladulescu este developer full-stack din România care proiectează și livrează produse AI-native cap-coadă — de la schema bazei de date și infrastructura cloud până la aplicații desktop native și interfețe web șlefuite.\n\nProdusul său principal este codai, un gateway AI și centru de comandă personal, live, care expune un singur nume de model rutat către Google Vertex (Anthropic Claude) și Azure AI Foundry, cu plafoane de cost, prompt caching și prețuri transparente. Vine ca o consolă web, o aplicație desktop Tauri cu computer-use pe Windows, un agent Android și SDK-uri TypeScript și Python.\n\nÎn T4 2026 lansează Brivio: un ERP pentru firme din România și UE cu e-Factura și e-Transport ANAF, contabilitate în partidă dublă, jurnal de audit imutabil înlănțuit criptografic, SAF-T, salarizare și stocuri. Brivio este succesorul Datuvia, o platformă de management de business construită pentru un client.\n\nStudiAI, platforma sa de cursuri, este live din 2023, cu niveluri de inferență alimentate de codai. Menține MixAI, o platformă media self-hosted pentru filme și muzică, cu mixer DJ, pe web, desktop și TV, și notai, o aplicație de notițe colaborative construită pe o pânză de desen.\n\nPe partea de cercetare lucrează la HIDE, un protocol experimental de criptare hibridă post-cuantică în Rust, și la notalone, o căutare statistică preînregistrată în date de pulsari. Publică biblioteci open-source și servere MCP pe npm și PyPI și împărtășește regulile, skill-urile și hook-urile cu care lucrează alături de agenți AI de programare.",
};

export const pressFacts: PressFact[] = [
    { label: { en: "Name", ro: "Nume" }, value: { en: site.fullName, ro: site.fullName } },
    { label: { en: "Location", ro: "Locație" }, value: { en: "Romania", ro: "România" } },
    { label: { en: "On GitHub since", ro: "Pe GitHub din" }, value: { en: "2015", ro: "2015" } },
    {
        label: { en: "Public repositories", ro: "Repo-uri publice" },
        value: { en: `${publicRepoCount} in the registry`, ro: `${publicRepoCount} în registru` },
    },
    {
        label: { en: "Published packages", ro: "Pachete publicate" },
        value: {
            en: `${allPackages.length} on npm and PyPI`,
            ro: `${allPackages.length} pe npm și PyPI`,
        },
    },
    {
        label: { en: "Organisations", ro: "Organizații" },
        value: {
            en: "codai-ro · brivio-ro · hide-protocol",
            ro: "codai-ro · brivio-ro · hide-protocol",
        },
    },
    {
        label: { en: "Languages", ro: "Limbi" },
        value: { en: "Romanian, English", ro: "Română, engleză" },
    },
    {
        label: { en: "GitHub", ro: "GitHub" },
        value: { en: `@${site.handle}`, ro: `@${site.handle}` },
    },
];

export const pressProducts: PressProduct[] = projects
    .filter(
        (p): p is typeof p & { website: string } =>
            Boolean(p.website) && (p.featured === true || p.status === "live"),
    )
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .map((p) => ({ slug: p.slug, name: p.name, tagline: p.tagline, website: p.website }));
