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
            en: "A lockfile of tool description and schema hashes, a CI check that fails on drift, and a stdio proxy that hides changed tools and refuses calls to them while the agent runs. Version 0.2 works today. Next: signed lockfiles.",
            ro: "Un lockfile cu hash-urile descrierilor și schemelor, o verificare în CI care pică la orice schimbare și un proxy stdio care ascunde tool-urile modificate și le refuză apelurile cât timp rulează agentul. Versiunea 0.2 merge deja. Urmează lockfile-uri semnate.",
        },
        tags: ["MCP", "security", "CI"],
        repo: "https://github.com/dragoscv/mcp-lock",
    },
    {
        id: "D-07",
        name: "agentcfg-audit",
        stage: "building",
        updated: "2026-10-06",
        problem: {
            en: "AGENTS.md, skills, hooks and mcp.json run with your permissions, yet nobody scans or signs them. Public studies found a third of shared skills flawed and some malicious.",
            ro: "AGENTS.md, skill-urile, hook-urile și mcp.json rulează cu permisiunile tale, dar nimeni nu le scanează sau semnează. Studii publice au găsit o treime din skill-uri cu defecte și unele malițioase.",
        },
        approach: {
            en: "A CLI that finds agent config in a repo and flags hidden Unicode, prompt-injection phrasing, remote code in hooks, unpinned MCP servers and auto-approve settings, with SARIF output for code scanning. It signs every config file into an ed25519 manifest, and verify fails on any change or an untrusted signer. Version 0.1 works today. Next: an editor gate that runs verify before a workspace loads.",
            ro: "Un CLI care găsește configurația agenților dintr-un repo și semnalează Unicode ascuns, formulări de prompt injection, cod de la distanță în hook-uri, servere MCP fără versiune fixată și setări de auto-aprobare, cu ieșire SARIF pentru code scanning. Semnează fiecare fișier de configurare într-un manifest ed25519, iar verificarea pică la orice schimbare sau semnatar nesigur. Versiunea 0.1 merge deja. Urmează o poartă în editor care rulează verificarea înainte să se încarce workspace-ul.",
        },
        tags: ["agents", "security", "supply chain"],
        repo: "https://github.com/dragos-catalin/agentcfg-audit",
    },
    {
        id: "D-01",
        name: "agentq",
        stage: "building",
        updated: "2026-10-06",
        problem: {
            en: "Several coding agents in one repo collide on builds, installs, commits and deploys. Worktrees isolate files but nothing coordinates shared resources.",
            ro: "Mai mulți agenți de cod în același repo se ciocnesc la build-uri, instalări, commit-uri și deploy-uri. Worktree-urile izolează fișierele, dar nimic nu coordonează resursele comune.",
        },
        approach: {
            en: "The FIFO queue I already run on my machine, extracted as a cross-platform daemon with a CLI, an MCP server and a library: tickets with leases, freeze marks with a reason, and a hash-chained journal. The protocol is written up as an open draft, ACP-Lock 0.1, so other tools can speak it. Version 0.1 works today. Next: hooks that route agent builds and deploys through it.",
            ro: "Coada FIFO pe care o folosesc deja pe mașina mea, extrasă ca daemon cross-platform cu CLI, server MCP și bibliotecă: tichete cu lease, înghețări cu motiv și un jurnal înlănțuit prin hash-uri. Protocolul e publicat ca draft deschis, ACP-Lock 0.1, ca să-l poată vorbi și alte unelte. Versiunea 0.1 merge deja. Urmează hook-uri care trec build-urile și deploy-urile agenților prin el.",
        },
        tags: ["agents", "coordination", "protocol"],
        repo: "https://github.com/dragos-catalin/agentq",
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
        stage: "building",
        updated: "2026-10-06",
        problem: {
            en: "Phone-to-desktop-to-TV pairing gets rewritten in every app I build.",
            ro: "Împerecherea telefon-desktop-TV se rescrie în fiecare aplicație pe care o construiesc.",
        },
        approach: {
            en: "One Rust crate: an 8-character code that works once, SPAKE2 bound to both devices' keys so a man in the middle gets one guess, a 6-digit SAS, a MAC-sealed list of paired devices, and pairing over iroh. A TypeScript package shares the code and SAS logic, tested against the same vectors. Version 0.1 works today. Next: Kotlin bindings and moving dashy and titi onto it.",
            ro: "Un singur crate Rust: un cod de 8 caractere valabil o singură dată, SPAKE2 legat de cheile ambelor dispozitive ca un atacator la mijloc să aibă o singură încercare, un SAS de 6 cifre, o listă de dispozitive împerecheate sigilată cu MAC și împerechere prin iroh. Un pachet TypeScript folosește aceeași logică pentru cod și SAS, testat pe aceiași vectori. Versiunea 0.1 merge deja. Urmează binding-uri Kotlin și mutarea dashy și titi pe el.",
        },
        tags: ["Rust", "pairing", "iroh"],
        repo: "https://github.com/dragos-catalin/device-pairing",
    },
];
