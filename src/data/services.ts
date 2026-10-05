import type { LocalizedText } from "./types";

/** S-05: who the site serves (owner profile V3-34) and what each audience gets. */
export type AudienceId = "startups" | "smes" | "enterprise" | "developers";

export interface Audience {
    id: AudienceId;
    title: LocalizedText;
    lead: LocalizedText;
    offers: LocalizedText[];
    /** Registry slugs used as proof. Validated against src/data/projects.ts in tests. */
    proof: string[];
    engagement: LocalizedText;
}

export const audiences: Audience[] = [
    {
        id: "startups",
        title: { en: "Startups & founders", ro: "Startup-uri și fondatori" },
        lead: {
            en: "From idea to a product people pay for: one engineer who owns schema, cloud, app and launch.",
            ro: "De la idee la un produs pentru care oamenii plătesc: un singur inginer care răspunde de schemă, cloud, aplicație și lansare.",
        },
        offers: [
            {
                en: "MVP end to end on Next.js, Postgres and Stripe, live in weeks, not quarters",
                ro: "MVP cap-coadă pe Next.js, Postgres și Stripe, live în săptămâni, nu în trimestre",
            },
            {
                en: "Web, desktop (Tauri), Android and TV from one codebase plan",
                ro: "Web, desktop (Tauri), Android și TV dintr-un singur plan de cod",
            },
            {
                en: "AI features through a gateway with spend caps, so a demo never becomes a bill",
                ro: "Funcții AI printr-un gateway cu plafoane de cost, ca un demo să nu devină o factură",
            },
            {
                en: "CI, tests, Lighthouse 100 and observability from day one",
                ro: "CI, teste, Lighthouse 100 și observabilitate din prima zi",
            },
        ],
        proof: ["codai", "tiksee", "studiai"],
        engagement: {
            en: "Fixed-scope MVP sprint, then a monthly retainer if you want me to stay.",
            ro: "Sprint MVP cu scop fix, apoi abonament lunar dacă vrei să rămân.",
        },
    },
    {
        id: "smes",
        title: { en: "Romanian SMEs", ro: "IMM-uri din România" },
        lead: {
            en: "Invoicing, e-Factura and the boring automation that gives you your evenings back.",
            ro: "Facturare, e-Factura și automatizările plictisitoare care îți dau serile înapoi.",
        },
        offers: [
            {
                en: "ANAF e-Factura and e-Transport integration, SAF-T exports, BNR exchange rates",
                ro: "Integrare e-Factura și e-Transport ANAF, exporturi SAF-T, curs BNR",
            },
            {
                en: "Bank reconciliation, document capture and accountant hand-off",
                ro: "Reconciliere bancară, preluare documente și predare către contabil",
            },
            {
                en: "Internal tools that replace spreadsheets and copy-paste",
                ro: "Unelte interne care înlocuiesc Excel-ul și copy-paste-ul",
            },
            {
                en: "Everything bilingual and GDPR-correct",
                ro: "Totul bilingv și corect GDPR",
            },
        ],
        proof: ["brivio", "datuvia"],
        engagement: {
            en: "Start with a one-week audit of your current flow, then a fixed-price build.",
            ro: "Începem cu un audit de o săptămână al fluxului actual, apoi o implementare la preț fix.",
        },
    },
    {
        id: "enterprise",
        title: { en: "Enterprise & EU teams", ro: "Companii și echipe din UE" },
        lead: {
            en: "Architecture, cloud and network work done by someone who also writes the code.",
            ro: "Arhitectură, cloud și rețea, făcute de cineva care scrie și codul.",
        },
        offers: [
            {
                en: "GCP architecture: Cloud Run, Cloud SQL, Terraform, least-privilege IAM",
                ro: "Arhitectură GCP: Cloud Run, Cloud SQL, Terraform, IAM cu privilegii minime",
            },
            {
                en: "AI gateway and agent rollouts with budgets, audit and data residency in the EU",
                ro: "Gateway AI și agenți cu bugete, audit și date rezidente în UE",
            },
            {
                en: "Multi-tenant SaaS design: tenancy boundaries, hash-chained audit logs, migrations without downtime",
                ro: "Design SaaS multi-tenant: limite de tenant, jurnale de audit înlănțuite, migrări fără downtime",
            },
            {
                en: "Code and security reviews, upgrade plans for stacks that fell behind",
                ro: "Code review și audit de securitate, planuri de upgrade pentru stack-uri rămase în urmă",
            },
        ],
        proof: ["codai", "brivio", "afti"],
        engagement: {
            en: "Advisory days or an embedded engagement, remote from Romania, EU time zone.",
            ro: "Zile de consultanță sau colaborare în echipă, remote din România, fus orar UE.",
        },
    },
    {
        id: "developers",
        title: { en: "Developers", ro: "Developeri" },
        lead: {
            en: "Open-source tools, SDKs and the agent setup I use every day.",
            ro: "Unelte open-source, SDK-uri și setup-ul de agenți pe care îl folosesc zilnic.",
        },
        offers: [
            {
                en: "Libraries and MCP servers on npm and PyPI",
                ro: "Biblioteci și servere MCP pe npm și PyPI",
            },
            {
                en: "Agent rules, skills and hooks for safe multi-agent work",
                ro: "Reguli, skill-uri și hook-uri pentru lucrul sigur cu mai mulți agenți",
            },
            {
                en: "Pairing sessions and workshops on AI-assisted engineering",
                ro: "Sesiuni de pairing și workshop-uri despre inginerie asistată de AI",
            },
        ],
        proof: ["axiom", "workspace-ai", "hide"],
        engagement: {
            en: "Issues and PRs are welcome; workshops are booked per session.",
            ro: "Issue-urile și PR-urile sunt binevenite; workshop-urile se rezervă pe sesiune.",
        },
    },
];

export interface ProcessStep {
    title: LocalizedText;
    body: LocalizedText;
}

export const processSteps: ProcessStep[] = [
    {
        title: { en: "Talk", ro: "Discutăm" },
        body: {
            en: "A 30-minute call. You describe the problem, I ask about users, money and deadlines.",
            ro: "Un apel de 30 de minute. Îmi descrii problema, eu întreb despre utilizatori, bani și termene.",
        },
    },
    {
        title: { en: "Scope", ro: "Stabilim scopul" },
        body: {
            en: "A written plan with what is in, what is out, a price and checks that prove it is done.",
            ro: "Un plan scris: ce intră, ce nu intră, un preț și verificările care dovedesc că e gata.",
        },
    },
    {
        title: { en: "Build", ro: "Construim" },
        body: {
            en: "Weekly demos on a live preview URL. You see progress, not status reports.",
            ro: "Demo săptămânal pe un link de preview live. Vezi progresul, nu rapoarte.",
        },
    },
    {
        title: { en: "Hand over", ro: "Predăm" },
        body: {
            en: "Your repo, your cloud account, docs and tests. No lock-in.",
            ro: "Repo-ul tău, contul tău de cloud, documentație și teste. Fără lock-in.",
        },
    },
];
