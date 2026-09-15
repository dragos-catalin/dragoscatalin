import type { Project } from "./types";

/**
 * Curated project registry. Narrative + status are hand-written (interview
 * 2026-09-15, see docs/TRACKER.md). Live stats come from src/lib/github.ts.
 * Private repos: NO repo links, presented as case studies.
 */
export const projects: Project[] = [
    // ─── Flagships ────────────────────────────────────────────────────────
    {
        slug: "codai",
        name: "codai",
        tagline: {
            en: "One model name. Every AI provider. Your own AI command center.",
            ro: "Un singur nume de model. Toți furnizorii AI. Centrul tău de comandă AI.",
        },
        summary: {
            en: "codai is a personal AI command center: an OpenAI/Anthropic-compatible gateway that exposes a single model name, `codai`, routed across Google Vertex (Anthropic Claude) and Azure AI Foundry with spend caps, prompt caching and radical-transparency pricing.\n\nIt ships as a web console, a Tauri desktop app with Windows computer-use, an on-device Android agent, TypeScript and Python SDKs, and a shared-sessions protocol so every surface syncs.",
            ro: "codai este un centru de comandă AI personal: un gateway compatibil OpenAI/Anthropic care expune un singur nume de model, `codai`, rutat către Google Vertex (Anthropic Claude) și Azure AI Foundry, cu plafoane de cost, prompt caching și prețuri transparente.\n\nVine ca o consolă web, o aplicație desktop Tauri cu computer-use pe Windows, un agent Android on-device, SDK-uri TypeScript și Python și un protocol de sesiuni partajate, astfel încât toate suprafețele se sincronizează.",
        },
        status: "live",
        category: "platform",
        visibility: "public",
        featured: true,
        order: 1,
        years: { from: 2025 },
        stack: [
            "Next.js",
            "Hono",
            "TypeScript",
            "Rust",
            "Tauri",
            "Kotlin",
            "PostgreSQL",
            "Drizzle",
            "GCP",
            "Terraform",
            "Vertex AI",
            "Azure AI",
        ],
        surfaces: [
            { label: "Console", url: "https://codai.ro" },
            { label: "Gateway", url: "https://ai.codai.ro" },
            { label: "Desktop (Tauri)", url: "https://github.com/codai-ro/codai-desktop/releases" },
            { label: "Android", url: "https://github.com/codai-ro/codai-phone" },
            { label: "SDK (TS)", url: "https://www.npmjs.com/package/codai-sdk" },
            { label: "SDK (Python)", url: "https://pypi.org/project/codai-sdk/" },
            { label: "Protocol", url: "https://github.com/codai-ro/codai-protocol" },
        ],
        repos: [
            { owner: "codai-ro", name: "codai-desktop" },
            { owner: "codai-ro", name: "codai-phone" },
            { owner: "codai-ro", name: "codai-sdk" },
            { owner: "codai-ro", name: "codai-sdk-python" },
            { owner: "codai-ro", name: "codai-protocol" },
        ],
        packages: [
            { registry: "npm", name: "codai-sdk" },
            { registry: "pypi", name: "codai-sdk" },
        ],
        website: "https://codai.ro",
        hue: 300,
    },
    {
        slug: "brivio",
        name: "Brivio",
        tagline: {
            en: "Invoicing, accounting and e-Factura for Romanian & EU businesses.",
            ro: "Facturare, contabilitate și e-Factura pentru firme din România și UE.",
        },
        summary: {
            en: "Brivio is a full SaaS ERP for the Romanian market: invoicing with ANAF e-Factura and e-Transport, double-entry accounting with immutable journal entries and a hash-chained audit log, SAF-T D406, banking imports, payroll, inventory and POS.\n\nBuilt as a Next.js 16 monorepo with Drizzle/PostgreSQL, Auth.js with passkeys, Stripe billing, a public API with TypeScript, PHP and Go SDKs, an MCP server for AI agents, and Tauri desktop apps. Successor to Datuvia.",
            ro: "Brivio este un ERP SaaS complet pentru piața românească: facturare cu e-Factura și e-Transport ANAF, contabilitate în partidă dublă cu note contabile imutabile și jurnal de audit înlănțuit criptografic, SAF-T D406, import bancar, salarizare, stocuri și POS.\n\nConstruit ca monorepo Next.js 16 cu Drizzle/PostgreSQL, Auth.js cu passkeys, facturare Stripe, API public cu SDK-uri TypeScript, PHP și Go, server MCP pentru agenți AI și aplicații desktop Tauri. Succesorul Datuvia.",
        },
        status: "launching",
        category: "product",
        visibility: "private",
        featured: true,
        order: 2,
        years: { from: 2026 },
        stack: [
            "Next.js",
            "TypeScript",
            "Drizzle",
            "PostgreSQL",
            "Auth.js",
            "Stripe",
            "Tauri",
            "Pulumi",
            "GCP",
            "PHP",
            "Go",
        ],
        surfaces: [
            { label: "Web", url: "https://brivio.ro" },
            {
                label: "Desktop (Tauri)",
                url: "https://github.com/dragoscv/brivio-releases/releases",
            },
            { label: "SDK (PHP)", url: "https://github.com/brivio-ro/brivio-sdk-php" },
            { label: "SDK (Go)", url: "https://github.com/brivio-ro/brivio-sdk-go" },
        ],
        repos: [
            { owner: "dragoscv", name: "brivio-releases", label: "Releases" },
            { owner: "brivio-ro", name: "brivio-sdk-php" },
            { owner: "brivio-ro", name: "brivio-sdk-go" },
        ],
        website: "https://brivio.ro",
        hue: 215,
        related: [{ slug: "datuvia", relation: "predecessor" }],
    },

    // ─── Products ─────────────────────────────────────────────────────────
    {
        slug: "studiai",
        name: "StudiAI",
        tagline: {
            en: "AI-powered course platform with codai-backed inference tiers.",
            ro: "Platformă de cursuri cu AI, cu niveluri de inferență prin codai.",
        },
        summary: {
            en: "StudiAI.ro is a live course platform: video lessons, progress tracking, Stripe subscriptions and AI assistance whose inference runs through the codai gateway with per-tier budgets.",
            ro: "StudiAI.ro este o platformă de cursuri live: lecții video, progres, abonamente Stripe și asistență AI a cărei inferență rulează prin gateway-ul codai, cu bugete per nivel.",
        },
        status: "live",
        category: "product",
        visibility: "private",
        years: { from: 2023 },
        stack: ["Next.js", "TypeScript", "Firebase", "Stripe", "Sentry", "Vercel"],
        website: "https://studiai.ro",
        hue: 250,
        related: [{ slug: "codai", relation: "part-of" }],
    },
    {
        slug: "muzicai",
        name: "MuzicAI (mmo)",
        tagline: {
            en: "Open-source music management suite for DJs and producers.",
            ro: "Suită open-source de management muzical pentru DJ și producători.",
        },
        summary: {
            en: "Multi Media Organizer: a PWA, a desktop companion with auto-update (47 releases), a browser extension and a Rust audio engine (`mixai`) for analysis and mixing. Real-time collaboration via Yjs. AGPL-3.0.",
            ro: "Multi Media Organizer: PWA, aplicație desktop cu auto-update (47 versiuni), extensie de browser și motor audio Rust (`mixai`) pentru analiză și mixaj. Colaborare în timp real prin Yjs. AGPL-3.0.",
        },
        status: "maintenance",
        category: "product",
        visibility: "public",
        years: { from: 2025, to: 2026 },
        stack: ["Next.js", "TypeScript", "Tauri", "Rust", "Electron", "Yjs", "PostgreSQL"],
        surfaces: [
            { label: "Web", url: "https://muzicai.ro" },
            { label: "Desktop", url: "https://github.com/dragoscv/mmo/releases" },
        ],
        repos: [{ owner: "dragoscv", name: "mmo" }],
        website: "https://muzicai.ro",
        hue: 20,
    },
    {
        slug: "notai",
        name: "notai",
        tagline: {
            en: "Calm, collaborative notes with a drawing canvas — optimized for ADHD brains.",
            ro: "Notițe calme, colaborative, cu pânză de desen — optimizate pentru minți ADHD.",
        },
        summary: {
            en: "Excalidraw is the note surface. Yjs sync, Tauri desktop with sticky notes, graph view, voice capture, webhooks and public profiles. Signed installers for Windows, macOS and Linux.",
            ro: "Excalidraw este suprafața de notițe. Sincronizare Yjs, desktop Tauri cu sticky notes, vizualizare graf, captură vocală, webhooks și profiluri publice. Instalatoare semnate pentru Windows, macOS și Linux.",
        },
        status: "maintenance",
        category: "product",
        visibility: "public",
        years: { from: 2026 },
        stack: ["Next.js", "TypeScript", "Tauri", "Rust", "Yjs", "Drizzle", "Cloud Run"],
        surfaces: [
            { label: "Web", url: "https://notai.ro" },
            { label: "Desktop", url: "https://github.com/dragoscv/notai/releases" },
        ],
        repos: [{ owner: "dragoscv", name: "notai" }],
        website: "https://notai.ro",
        hue: 160,
    },
    {
        slug: "metu",
        name: "metu",
        tagline: {
            en: "A personal AI operating system — external RAM for AI-native founders.",
            ro: "Un sistem de operare AI personal — RAM extern pentru fondatori AI-native.",
        },
        summary: {
            en: "metu remembers, prioritises and tells you what not to do. Web, Hono WebSocket hub, Expo mobile, a Tauri companion with a VRM avatar and voice, a VS Code extension and a browser extension share one Zod-typed protocol.",
            ro: "metu ține minte, prioritizează și îți spune ce să nu faci. Web, hub WebSocket Hono, mobil Expo, companion Tauri cu avatar VRM și voce, extensie VS Code și extensie de browser împart un singur protocol tipizat cu Zod.",
        },
        status: "active",
        category: "platform",
        visibility: "public",
        years: { from: 2025 },
        stack: [
            "Next.js",
            "Hono",
            "Expo",
            "Tauri",
            "three.js",
            "TypeScript",
            "Drizzle",
            "PostgreSQL",
        ],
        repos: [{ owner: "dragoscv", name: "metu" }],
        hue: 120,
    },
    {
        slug: "tiksee",
        name: "TikSee",
        tagline: {
            en: "TikTok LIVE streamer companion for Windows and Android.",
            ro: "Companion pentru streameri TikTok LIVE pe Windows și Android.",
        },
        summary: {
            en: "Tauri 2 + React desktop app with a Node/Hono sidecar for the TikTok webcast protocol, serial LCD output, OBS integration and realtime TTS; Android companion app.",
            ro: "Aplicație desktop Tauri 2 + React cu sidecar Node/Hono pentru protocolul TikTok webcast, ieșire LCD serial, integrare OBS și TTS în timp real; aplicație Android companion.",
        },
        status: "active",
        category: "tool",
        visibility: "public",
        years: { from: 2026 },
        stack: ["Tauri", "Rust", "React", "Hono", "Kotlin", "Azure Speech"],
        repos: [{ owner: "dragoscv", name: "selfie-screen" }],
        hue: 350,
    },

    // ─── Case studies (private) ───────────────────────────────────────────
    {
        slug: "datuvia",
        name: "Datuvia",
        tagline: {
            en: "Business management platform: contracts, documents, ANAF integration.",
            ro: "Platformă de management de business: contracte, documente, integrare ANAF.",
        },
        summary: {
            en: "A large client engagement: CRM, contract lifecycle, document management and ANAF integrations for Romanian companies, built on Next.js and PostgreSQL.\n\nThe client discontinued the project; the architecture and lessons became Brivio, which is larger in scope.",
            ro: "Un proiect mare pentru un client: CRM, ciclu de viață al contractelor, management de documente și integrări ANAF pentru firme românești, pe Next.js și PostgreSQL.\n\nClientul a renunțat la proiect; arhitectura și lecțiile au devenit Brivio, care este mult mai amplu.",
        },
        story: {
            problem: {
                en: "Romanian SMEs juggle contracts, invoices and ANAF obligations across disconnected tools.",
                ro: "IMM-urile românești jonglează contracte, facturi și obligații ANAF în instrumente deconectate.",
            },
            approach: {
                en: "One multi-tenant platform with role-based access, document templates, e-signature flows and ANAF lookups.",
                ro: "O platformă multi-tenant cu acces pe roluri, șabloane de documente, fluxuri de e-semnătură și interogări ANAF.",
            },
            outcome: {
                en: "Contract ended by the client. The domain model was carried forward into Brivio.",
                ro: "Contract încheiat de client. Modelul de domeniu a fost dus mai departe în Brivio.",
            },
        },
        status: "case-study",
        category: "client",
        visibility: "private",
        years: { from: 2024, to: 2026 },
        stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind"],
        hue: 200,
        related: [{ slug: "brivio", relation: "successor" }],
    },
    {
        slug: "money",
        name: "money",
        tagline: {
            en: "AI pattern trading scanner — AI explains, statistics decide.",
            ro: "Scanner de pattern-uri de trading cu AI — AI explică, statistica decide.",
        },
        summary: {
            en: "Backtests hypotheses on Binance top-100 with costs and slippage, scores signals with XGBoost, guards against overfitting with deflated Sharpe, PBO and walk-forward validation, and paper-trades with a journal. Python 3.12 FastAPI quant service + Next.js web. Live trading is gated behind a kill switch.",
            ro: "Testează ipoteze pe Binance top-100 cu costuri și slippage, punctează semnale cu XGBoost, se apără de overfitting cu Sharpe deflatat, PBO și walk-forward, și face paper trading cu jurnal. Serviciu quant Python 3.12 FastAPI + web Next.js. Tradingul live e blocat de un kill switch.",
        },
        status: "research",
        category: "research",
        visibility: "private",
        years: { from: 2026 },
        stack: ["Python", "FastAPI", "XGBoost", "pandas", "Next.js", "PostgreSQL", "Cloud Run"],
        hue: 90,
    },
    {
        slug: "nexus",
        name: "Nexus",
        tagline: {
            en: "Engine-agnostic roleplay server platform with a double-entry economy.",
            ro: "Platformă de servere roleplay independentă de engine, cu economie în partidă dublă.",
        },
        summary: {
            en: "Server-authoritative core with PostgreSQL as the source of truth, realm multi-tenancy and game engines as adapters. Successor to GangGPT.",
            ro: "Nucleu server-authoritative cu PostgreSQL ca sursă de adevăr, multi-tenancy pe realm-uri și engine-uri de joc ca adaptoare. Succesorul GangGPT.",
        },
        status: "active",
        category: "platform",
        visibility: "private",
        years: { from: 2026 },
        stack: ["TypeScript", "PostgreSQL", "Drizzle", "Node.js"],
        hue: 40,
        related: [{ slug: "ganggpt", relation: "predecessor" }],
    },

    // ─── Tools & research ─────────────────────────────────────────────────
    {
        slug: "vmui",
        name: "vmui",
        tagline: {
            en: "Local-first multi-cloud VM control plane, no SaaS dependency.",
            ro: "Panou de control VM multi-cloud, local-first, fără dependență SaaS.",
        },
        summary: {
            en: "Runs entirely on your laptop: SQLite + Drizzle, AES-256-GCM secrets, AWS / Azure / GCP / Scaleway / local KVM providers, an ssh2 WebSocket terminal bridge and a Go CLI. Also hosts home-automation bridges (HyperHDR → OpenRGB / Tuya, Home Assistant signals).",
            ro: "Rulează integral pe laptop: SQLite + Drizzle, secrete AES-256-GCM, provideri AWS / Azure / GCP / Scaleway / KVM local, bridge terminal ssh2 peste WebSocket și CLI în Go. Găzduiește și bridge-uri de home-automation (HyperHDR → OpenRGB / Tuya, semnale Home Assistant).",
        },
        status: "active",
        category: "tool",
        visibility: "public",
        years: { from: 2026 },
        stack: ["Next.js", "TypeScript", "SQLite", "Drizzle", "Go", "Python", "QEMU"],
        repos: [{ owner: "dragoscv", name: "vmui" }],
        hue: 190,
    },
    {
        slug: "hide",
        name: "HIDE",
        tagline: {
            en: "Encrypt to a person, not to a key. Hybrid post-quantum file encryption.",
            ro: "Criptează către o persoană, nu către o cheie. Criptare hibridă post-cuantică.",
        },
        summary: {
            en: "X25519 + ML-KEM-768 hybrid encryption in Rust with MLS groups, fuzzing, frozen test vectors and an independent Node interop. CLI, portable binaries, WASM and a Tauri desktop app.",
            ro: "Criptare hibridă X25519 + ML-KEM-768 în Rust, cu grupuri MLS, fuzzing, vectori de test înghețați și interop independent în Node. CLI, binare portabile, WASM și aplicație desktop Tauri.",
        },
        status: "research",
        category: "research",
        visibility: "public",
        years: { from: 2026 },
        stack: ["Rust", "WASM", "Tauri", "TypeScript"],
        repos: [{ owner: "hide-protocol", name: "hide" }],
        packages: [{ registry: "npm", name: "hide-protocol" }],
        disclaimer: {
            en: "Experimental and unaudited — not for sensitive data.",
            ro: "Experimental și neauditat — nu pentru date sensibile.",
        },
        hue: 280,
    },
    {
        slug: "notalone",
        name: "notalone",
        tagline: {
            en: "Preregistered search for protocol-like modulation in pulsar data.",
            ro: "Căutare preînregistrată de modulație tip protocol în date de pulsari.",
        },
        summary: {
            en: "Seven frozen, control-gated experiments on Breakthrough Listen single-pulse data (GBT + Parkes). Result: a bounded null. Methods paper draft included.",
            ro: "Șapte experimente înghețate, cu control, pe date single-pulse Breakthrough Listen (GBT + Parkes). Rezultat: un nul mărginit. Include draftul lucrării de metodă.",
        },
        status: "research",
        category: "research",
        visibility: "public",
        years: { from: 2026, to: 2026 },
        stack: ["Python", "NumPy", "SciPy"],
        repos: [{ owner: "dragoscv", name: "notalone" }],
        hue: 240,
    },
    {
        slug: "workspace-ai",
        name: "workspace-ai",
        tagline: {
            en: "Instruction files and skills for AI coding agents, across roles.",
            ro: "Fișiere de instrucțiuni și skill-uri pentru agenți AI de programare.",
        },
        summary: {
            en: "An open collection of agent rules, skills and hooks for business and engineering roles, with Memorai MCP integration.",
            ro: "O colecție deschisă de reguli, skill-uri și hook-uri pentru agenți, pe roluri de business și inginerie, cu integrare Memorai MCP.",
        },
        status: "active",
        category: "tool",
        visibility: "public",
        years: { from: 2026 },
        stack: ["Markdown", "PowerShell", "TypeScript"],
        repos: [{ owner: "dragoscv", name: "workspace-ai" }],
        hue: 60,
    },
    {
        slug: "circuit-tracks",
        name: "Circuit Tracks panel",
        tagline: {
            en: "Browser MIDI editor for the Novation Circuit Tracks.",
            ro: "Editor MIDI în browser pentru Novation Circuit Tracks.",
        },
        summary: {
            en: "Web MIDI panel for synth presets, song and track management on the Circuit Tracks groovebox.",
            ro: "Panou Web MIDI pentru presetări de synth, management de piese și track-uri pe groovebox-ul Circuit Tracks.",
        },
        status: "active",
        category: "hobby",
        visibility: "private",
        years: { from: 2026 },
        stack: ["Python", "Web MIDI"],
        hue: 330,
    },

    // ─── Open-source libraries ────────────────────────────────────────────
    {
        slug: "memorai",
        name: "Memorai MCP",
        tagline: {
            en: "Semantic memory server for AI agents.",
            ro: "Server de memorie semantică pentru agenți AI.",
        },
        summary: {
            en: "Enterprise-grade MCP memory server with sub-100 ms semantic operations. Published as @codai/memorai-mcp.",
            ro: "Server MCP de memorie cu operații semantice sub 100 ms. Publicat ca @codai/memorai-mcp.",
        },
        status: "maintenance",
        category: "library",
        visibility: "public",
        years: { from: 2025, to: 2025 },
        stack: ["TypeScript", "MCP"],
        repos: [{ owner: "dragoscv", name: "memorai-mcp" }],
        packages: [{ registry: "npm", name: "@codai/memorai-mcp" }],
        hue: 300,
    },
    {
        slug: "glass",
        name: "GlassMCP",
        tagline: {
            en: "Let AI agents control Windows safely.",
            ro: "Lasă agenții AI să controleze Windows în siguranță.",
        },
        summary: {
            en: "Machine Control Protocol server exposing Windows automation over REST/WebSocket — the OS-level equivalent of Playwright. Published as @codai/glass-mcp.",
            ro: "Server Machine Control Protocol care expune automatizarea Windows peste REST/WebSocket — echivalentul Playwright la nivel de OS. Publicat ca @codai/glass-mcp.",
        },
        status: "maintenance",
        category: "library",
        visibility: "public",
        years: { from: 2025, to: 2025 },
        stack: ["TypeScript", "MCP", "Windows"],
        repos: [{ owner: "dragoscv", name: "glass" }],
        packages: [{ registry: "npm", name: "@codai/glass-mcp" }],
        hue: 210,
    },
    {
        slug: "axiom",
        name: "Axiom MCP",
        tagline: {
            en: "Reasoning tools for AI agents.",
            ro: "Instrumente de raționament pentru agenți AI.",
        },
        summary: {
            en: "MCP server published as @codai/axiom-mcp.",
            ro: "Server MCP publicat ca @codai/axiom-mcp.",
        },
        status: "maintenance",
        category: "library",
        visibility: "public",
        years: { from: 2025, to: 2025 },
        stack: ["TypeScript", "MCP"],
        repos: [{ owner: "dragoscv", name: "axiom" }],
        packages: [{ registry: "npm", name: "@codai/axiom-mcp" }],
        hue: 260,
    },
    {
        slug: "firewand",
        name: "firewand",
        tagline: {
            en: "Modular Firebase utility library.",
            ro: "Bibliotecă modulară de utilitare Firebase.",
        },
        summary: {
            en: "Typed helpers for Firebase Auth, Firestore and Storage.",
            ro: "Helperi tipizați pentru Firebase Auth, Firestore și Storage.",
        },
        status: "maintenance",
        category: "library",
        visibility: "public",
        years: { from: 2024, to: 2025 },
        stack: ["TypeScript", "Firebase"],
        repos: [{ owner: "dragoscv", name: "firewand" }],
        packages: [{ registry: "npm", name: "firewand" }],
        hue: 45,
    },
    {
        slug: "btpay",
        name: "btpay",
        tagline: {
            en: "Banca Transilvania PSD2 payment-initiation client.",
            ro: "Client PSD2 de inițiere plăți pentru Banca Transilvania.",
        },
        summary: {
            en: "TypeScript client for the BT PISP API.",
            ro: "Client TypeScript pentru API-ul PISP al BT.",
        },
        status: "maintenance",
        category: "library",
        visibility: "public",
        years: { from: 2025, to: 2025 },
        stack: ["TypeScript", "PSD2"],
        repos: [{ owner: "dragoscv", name: "btpay" }],
        packages: [{ registry: "npm", name: "btpay" }],
        hue: 230,
    },
    {
        slug: "stripe-firebase",
        name: "stripe-firebase",
        tagline: { en: "Stripe ↔ Firebase helpers.", ro: "Helperi Stripe ↔ Firebase." },
        summary: {
            en: "Subscriptions and checkout sync between Stripe and Firestore.",
            ro: "Sincronizare abonamente și checkout între Stripe și Firestore.",
        },
        status: "maintenance",
        category: "library",
        visibility: "public",
        years: { from: 2025, to: 2025 },
        stack: ["TypeScript", "Stripe", "Firebase"],
        repos: [{ owner: "dragoscv", name: "stripe-firebase" }],
        packages: [{ registry: "npm", name: "stripe-firebase" }],
        hue: 270,
    },

    // ─── Archive ──────────────────────────────────────────────────────────
    {
        slug: "ganggpt",
        name: "GangGPT",
        tagline: {
            en: "AI-driven GTA V roleplay server on RAGE:MP.",
            ro: "Server roleplay GTA V cu AI pe RAGE:MP.",
        },
        summary: {
            en: "Procedurally generated missions, NPCs with persistent memory and dynamic faction warfare powered by Azure OpenAI. Archived; succeeded by Nexus.",
            ro: "Misiuni generate procedural, NPC-uri cu memorie persistentă și războaie de facțiuni dinamice pe Azure OpenAI. Arhivat; succedat de Nexus.",
        },
        status: "archived",
        category: "hobby",
        visibility: "public",
        years: { from: 2025, to: 2025 },
        stack: ["TypeScript", "RAGE:MP", "Azure OpenAI"],
        repos: [{ owner: "dragoscv", name: "gang-gpt-gta-v" }],
        hue: 40,
        related: [{ slug: "nexus", relation: "successor" }],
    },
    {
        slug: "metric-time",
        name: "Metric Time",
        tagline: {
            en: "A 100-hour day clock and metric calendar.",
            ro: "Un ceas cu zi de 100 de ore și calendar metric.",
        },
        summary: {
            en: "Converts UTC to metric time with 100 metric hours per day and a metric calendar since 2000-01-01.",
            ro: "Convertește UTC în timp metric cu 100 de ore metrice pe zi și un calendar metric de la 2000-01-01.",
        },
        status: "archived",
        category: "hobby",
        visibility: "public",
        years: { from: 2025, to: 2025 },
        stack: ["HTML", "JavaScript"],
        repos: [{ owner: "dragoscv", name: "metric-time" }],
        website: "https://dragoscv.github.io/100-hours/",
        hue: 100,
    },
];

/** Older experiments shown only on the archive timeline (no detail pages). */
export const archiveTimeline: {
    year: number;
    name: string;
    note: { en: string; ro: string };
    repo?: string;
}[] = [
    {
        year: 2025,
        name: "dexai",
        note: { en: "DEX analytics experiment", ro: "Experiment analitică DEX" },
        repo: "dragoscv/dexai",
    },
    {
        year: 2025,
        name: "AIDE",
        note: {
            en: "Early codai.ro AI-native IDE concept",
            ro: "Concept timpuriu de IDE AI-native codai.ro",
        },
        repo: "dragoscv/AIDE",
    },
    {
        year: 2025,
        name: "codai-ecosystem",
        note: {
            en: "40+ scaffold repos for the codai ecosystem",
            ro: "40+ repo-uri scaffold pentru ecosistemul codai",
        },
    },
    {
        year: 2025,
        name: "bancai · jucai · editai · mancai",
        note: { en: "Romanian AI product experiments", ro: "Experimente de produse AI românești" },
    },
    {
        year: 2025,
        name: "raimixer · prakter · fq-generator",
        note: { en: "Small tools", ro: "Instrumente mici" },
    },
    {
        year: 2023,
        name: "StudiAI",
        note: { en: "Course platform launched", ro: "Lansarea platformei de cursuri" },
    },
    {
        year: 2022,
        name: "create-next-javonet",
        note: { en: "First npm package", ro: "Primul pachet npm" },
    },
    { year: 2015, name: "GitHub", note: { en: "Joined GitHub", ro: "Cont GitHub" } },
];

export function getProject(slug: string): Project | undefined {
    return projects.find((p) => p.slug === slug);
}

export const featuredProjects = projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

export const allRepos = projects.flatMap((p) => p.repos ?? []);
export const allPackages = projects.flatMap((p) => p.packages ?? []);
