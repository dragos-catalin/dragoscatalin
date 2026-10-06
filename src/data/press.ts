import { CAREER, horaeLive, measured } from "./numbers";
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

// V3-11: public name only (owner, V3-34). Numbers come from ./numbers (registry + measured.json).
export const bioShort: LocalizedText = {
    en: `Dragoș Cătălin is a product engineer and founder from Romania. He builds products end to end — from cloud and network to the app in your pocket — with ${CAREER.codeYears}+ years of code behind him. His products include codai, an AI gateway with desktop and phone apps; Brivio, invoicing and e-Factura for Romanian businesses; and Horae, ${horaeLive} watch faces live on Google Play.`,
    ro: `Dragoș Cătălin este product engineer și fondator din România. Construiește produse cap-coadă — de la cloud și rețea până la aplicația din buzunarul tău — și scrie cod de peste ${CAREER.codeYears} de ani. Printre produsele lui: codai, un gateway AI cu aplicații de desktop și telefon; Brivio, facturare și e-Factura pentru firmele din România; și Horae, cu ${horaeLive} cadrane publicate pe Google Play.`,
};

export const bioLong: LocalizedText = {
    en: `Dragoș Cătălin is a product engineer, founder and architect based in Romania. He started coding at about ten, was first paid for it at fifteen and has worked in software ever since: cloud systems and networking, web, desktop, Android and AI.\n\nHis flagship is codai, a live AI gateway and personal command center: one model name routed across Google Vertex and Azure AI Foundry, with spend caps, prompt caching and transparent pricing. It ships as a web console, a Windows desktop app on the Microsoft Store, an Android agent, a VS Code extension and TypeScript and Python SDKs.\n\nHe is launching Brivio, an ERP for Romanian and EU businesses with ANAF e-Factura and e-Transport, double-entry accounting, an immutable audit log, SAF-T, payroll and inventory. Horae, his watch-face studio for Wear OS, has ${horaeLive} faces live on Google Play.\n\nIn ${measured.year} alone he made ${measured.commits.total.toLocaleString("en")} commits across ${measured.commits.reposWithCommits} of his repositories, mostly in TypeScript, Rust and Kotlin. He publishes open-source libraries, MCP servers and VS Code extensions, and builds the tools his AI coding agents use to work safely side by side.`,
    ro: `Dragoș Cătălin este product engineer, fondator și arhitect, din România. A început să scrie cod pe la zece ani, a fost plătit prima dată pentru asta la cincisprezece și de atunci lucrează în software: sisteme cloud și rețelistică, web, desktop, Android și AI.\n\nProdusul lui principal este codai, un gateway AI și centru de comandă personal, live: un singur nume de model rutat către Google Vertex și Azure AI Foundry, cu plafoane de cost, prompt caching și prețuri transparente. Vine ca o consolă web, o aplicație desktop pentru Windows în Microsoft Store, un agent Android, o extensie VS Code și SDK-uri TypeScript și Python.\n\nLansează Brivio, un ERP pentru firme din România și UE, cu e-Factura și e-Transport ANAF, contabilitate în partidă dublă, jurnal de audit imutabil, SAF-T, salarizare și stocuri. Horae, studioul lui de cadrane pentru Wear OS, are ${horaeLive} cadrane publicate pe Google Play.\n\nDoar în ${measured.year} a făcut ${measured.commits.total.toLocaleString("ro")} de commit-uri în ${measured.commits.reposWithCommits} de repo-uri proprii, mai ales în TypeScript, Rust și Kotlin. Publică biblioteci open source, servere MCP și extensii VS Code și construiește uneltele cu care agenții lui AI de programare lucrează în siguranță unul lângă altul.`,
};

export const pressFacts: PressFact[] = [
    { label: { en: "Name", ro: "Nume" }, value: { en: site.name, ro: site.name } },
    {
        label: { en: "Location", ro: "Locație" },
        value: { en: "Romania (remote, EU)", ro: "România (remote, UE)" },
    },
    {
        label: { en: "Experience", ro: "Experiență" },
        value: {
            en: `${CAREER.codeYears}+ years of code, ${CAREER.paidYears}+ paid`,
            ro: `Peste ${CAREER.codeYears} de ani de cod, peste ${CAREER.paidYears} plătiți`,
        },
    },
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
