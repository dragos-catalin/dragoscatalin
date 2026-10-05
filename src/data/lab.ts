import type { LocalizedText } from "./types";

/**
 * S-05: public idea log. Only ideas the owner chose to build in the open
 * (docs/portfolio/portfolio.csv "OSS kept", 2026-10-05). Commercial B2B and
 * consumer ideas stay private until they ship. Keep `id` equal to the
 * portfolio row id so the two never drift.
 */
export type LabStage = "exploring" | "building" | "shipped" | "paused";

export interface LabIdea {
    id: string;
    name: string;
    stage: LabStage;
    /** ISO date the entry was last updated. */
    updated: string;
    problem: LocalizedText;
    approach: LocalizedText;
    tags: string[];
    repo?: string;
}

export const LAB_STAGES: LabStage[] = ["building", "exploring", "shipped", "paused"];

export const labIdeas: LabIdea[] = [
    {
        id: "D-03",
        name: "mcp-lock",
        stage: "building",
        updated: "2026-10-05",
        problem: {
            en: "MCP servers can change a tool's description or schema after you approved it (tool poisoning, rug-pulls). Nothing pins what an agent is allowed to call.",
            ro: "Serverele MCP pot schimba descrierea sau schema unui tool după ce l-ai aprobat (tool poisoning, rug-pull). Nimic nu fixează ce are voie un agent să apeleze.",
        },
        approach: {
            en: "A lockfile of tool description and schema hashes and a CI check that fails on drift (0.1 works today: lock, check, stdio and HTTP servers). Next: a local proxy that refuses changed tools at runtime.",
            ro: "Un lockfile cu hash-urile descrierilor și schemelor și o verificare în CI care pică la orice schimbare (versiunea 0.1 merge deja: lock, check, servere stdio și HTTP). Urmează un proxy local care refuză tool-urile modificate la rulare.",
        },
        tags: ["MCP", "security", "CI"],
    },
    {
        id: "D-07",
        name: "agentcfg-audit",
        stage: "exploring",
        updated: "2026-10-05",
        problem: {
            en: "AGENTS.md, skills, hooks and mcp.json run with your permissions, yet nobody scans or signs them. Public studies found a third of shared skills flawed and some malicious.",
            ro: "AGENTS.md, skill-urile, hook-urile și mcp.json rulează cu permisiunile tale, dar nimeni nu le scanează sau semnează. Studii publice au găsit o treime din skill-uri cu defecte și unele malițioase.",
        },
        approach: {
            en: "A scanner and signer for agent config, plus an editor gate that warns before an unsigned repo config runs.",
            ro: "Un scanner și semnător pentru configurația agenților, plus o poartă în editor care avertizează înainte să ruleze o configurație nesemnată.",
        },
        tags: ["agents", "security", "supply chain"],
    },
    {
        id: "D-01",
        name: "agentq",
        stage: "exploring",
        updated: "2026-10-05",
        problem: {
            en: "Several coding agents in one repo collide on builds, installs, commits and deploys. Worktrees isolate files but nothing coordinates shared resources.",
            ro: "Mai mulți agenți de cod în același repo se ciocnesc la build-uri, instalări, commit-uri și deploy-uri. Worktree-urile izolează fișierele, dar nimic nu coordonează resursele comune.",
        },
        approach: {
            en: "The FIFO queue I already run on my machine, extracted as a daemon with an open protocol (ACP-Lock): tickets, liveness, freezes and a journal.",
            ro: "Coada FIFO pe care o folosesc deja pe mașina mea, extrasă ca daemon cu un protocol deschis (ACP-Lock): tichete, liveness, înghețări și jurnal.",
        },
        tags: ["agents", "coordination", "protocol"],
    },
    {
        id: "I-19",
        name: "e-Factura SDK",
        stage: "exploring",
        updated: "2026-10-05",
        problem: {
            en: "Every Romanian developer reimplements ANAF UBL and CIUS-RO validation and learns the same edge cases the hard way.",
            ro: "Fiecare developer din România reimplementează validarea UBL și CIUS-RO de la ANAF și învață aceleași cazuri-limită pe pielea lui.",
        },
        approach: {
            en: "An open-source UBL builder and validator extracted from Brivio, with a hosted validator anyone can try.",
            ro: "Un builder și validator UBL open-source extras din Brivio, cu un validator găzduit pe care îl poate încerca oricine.",
        },
        tags: ["e-Factura", "ANAF", "UBL"],
    },
    {
        id: "D-19",
        name: "wff-dsl",
        stage: "exploring",
        updated: "2026-10-05",
        problem: {
            en: "Watch Face Format is mandatory on Wear OS since January 2026, and faces are hand-written XML.",
            ro: "Watch Face Format e obligatoriu pe Wear OS din ianuarie 2026, iar cadranele se scriu de mână în XML.",
        },
        approach: {
            en: "A typed Kotlin DSL that generates valid WFF, with previews and lint rules.",
            ro: "Un DSL Kotlin tipizat care generează WFF valid, cu previzualizări și reguli de lint.",
        },
        tags: ["Wear OS", "Kotlin", "DSL"],
    },
    {
        id: "D-20",
        name: "device-pairing",
        stage: "exploring",
        updated: "2026-10-05",
        problem: {
            en: "Phone-to-desktop-to-TV pairing gets rewritten in every app I build.",
            ro: "Împerecherea telefon-desktop-TV se rescrie în fiecare aplicație pe care o construiesc.",
        },
        approach: {
            en: "One Rust crate for QR or code pairing, key exchange and LAN discovery, with Kotlin and TypeScript bindings.",
            ro: "Un singur crate Rust pentru împerechere prin QR sau cod, schimb de chei și descoperire în LAN, cu binding-uri Kotlin și TypeScript.",
        },
        tags: ["Rust", "pairing", "Tauri"],
    },
];
