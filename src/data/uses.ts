import type { LocalizedText } from "./types";

export type UsesSectionId = "hardware" | "dev" | "infra" | "ai";

export interface UsesItem {
    name: string;
    note: LocalizedText;
    url?: string;
}

export interface UsesSection {
    id: UsesSectionId;
    items: UsesItem[];
}

export const usesSections: UsesSection[] = [
    {
        id: "hardware",
        items: [
            {
                name: "Windows 11 workstation",
                note: {
                    en: "Z790 board, 24 cores, 110 GB RAM shared with WSL — also runs the self-hosted GitHub Actions runners.",
                    ro: "Placă Z790, 24 nuclee, 110 GB RAM împărțiți cu WSL — rulează și runnerii GitHub Actions self-hosted.",
                },
            },
            {
                name: "Hyper-V dev VM fleet",
                note: {
                    en: "Disposable Linux/Windows VMs, one per project or per agent, reachable through VS Code tunnels.",
                    ro: "VM-uri Linux/Windows de unică folosință, câte una per proiect sau agent, accesibile prin tuneluri VS Code.",
                },
            },
            {
                name: "Ultra-wide monitor",
                note: {
                    en: "One long canvas: editor, terminal columns and a browser side by side.",
                    ro: "O singură pânză lungă: editor, coloane de terminal și browser una lângă alta.",
                },
            },
            {
                name: "DX Light ambilight + OpenRGB",
                note: {
                    en: "HyperHDR screen capture drives the USB strip and the case LEDs; agent events pulse the room.",
                    ro: "Captura HyperHDR controlează banda USB și LED-urile carcasei; evenimentele agenților pulsează camera.",
                },
                url: "https://openrgb.org",
            },
        ],
    },
    {
        id: "dev",
        items: [
            {
                name: "VS Code Insiders",
                note: {
                    en: "Daily build, tunnels into every VM.",
                    ro: "Build zilnic, tuneluri către fiecare VM.",
                },
                url: "https://code.visualstudio.com/insiders/",
            },
            {
                name: "GitHub Copilot",
                note: {
                    en: "Agent mode with my own rules, skills, hooks and memory — see workspace-ai.",
                    ro: "Mod agent cu propriile reguli, skill-uri, hook-uri și memorie — vezi workspace-ai.",
                },
                url: "https://github.com/features/copilot",
            },
            {
                name: "Copilot CLI",
                note: {
                    en: "Same agents in the terminal, routed through codai in BYOK mode.",
                    ro: "Aceiași agenți în terminal, rutați prin codai în mod BYOK.",
                },
                url: "https://github.com/github/copilot-cli",
            },
            {
                name: "PowerShell 7",
                note: {
                    en: "Default shell; scripts validated with the parser before they run unattended.",
                    ro: "Shell implicit; scripturile sunt validate cu parserul înainte să ruleze nesupravegheat.",
                },
                url: "https://github.com/PowerShell/PowerShell",
            },
            {
                name: "pnpm",
                note: {
                    en: "Workspaces + catalogs in every monorepo.",
                    ro: "Workspaces + cataloage în fiecare monorepo.",
                },
                url: "https://pnpm.io",
            },
            {
                name: "ripgrep",
                note: {
                    en: "The only search tool that survives 2,000 node_modules folders.",
                    ro: "Singura căutare care supraviețuiește la 2.000 de foldere node_modules.",
                },
                url: "https://github.com/BurntSushi/ripgrep",
            },
            {
                name: "WSL2 Ubuntu",
                note: {
                    en: "Linux builds, CI runners and Docker host.",
                    ro: "Build-uri Linux, runneri CI și gazdă Docker.",
                },
                url: "https://learn.microsoft.com/windows/wsl/",
            },
            {
                name: "Docker",
                note: {
                    en: "Cloud Run images and local Postgres.",
                    ro: "Imagini Cloud Run și Postgres local.",
                },
                url: "https://www.docker.com",
            },
        ],
    },
    {
        id: "infra",
        items: [
            {
                name: "Vercel",
                note: {
                    en: "Next.js web apps, previews per branch.",
                    ro: "Aplicații web Next.js, preview per branch.",
                },
                url: "https://vercel.com",
            },
            {
                name: "Google Cloud",
                note: {
                    en: "Cloud Run services and jobs, Cloud SQL Postgres, KMS, Secret Manager, Vertex AI for Claude and GPU training.",
                    ro: "Servicii și joburi Cloud Run, Cloud SQL Postgres, KMS, Secret Manager, Vertex AI pentru Claude și antrenare pe GPU.",
                },
                url: "https://cloud.google.com",
            },
            {
                name: "Neon",
                note: {
                    en: "Serverless Postgres for dev branches and small products.",
                    ro: "Postgres serverless pentru branch-uri de dev și produse mici.",
                },
                url: "https://neon.tech",
            },
            {
                name: "Cloudflare",
                note: {
                    en: "Workers for release updaters.",
                    ro: "Workers pentru updatere de release.",
                },
                url: "https://www.cloudflare.com",
            },
            {
                name: "Terraform",
                note: { en: "Primary IaC for GCP.", ro: "IaC principal pentru GCP." },
                url: "https://www.terraform.io",
            },
            {
                name: "Pulumi",
                note: { en: "IaC in Brivio.", ro: "IaC în Brivio." },
                url: "https://www.pulumi.com",
            },
            {
                name: "GitHub Actions",
                note: {
                    en: "Self-hosted WSL runners on the workstation; ubuntu-latest as fallback.",
                    ro: "Runneri WSL self-hosted pe workstation; ubuntu-latest ca rezervă.",
                },
                url: "https://github.com/features/actions",
            },
            {
                name: "Sentry",
                note: {
                    en: "Errors and traces, env-gated in every app.",
                    ro: "Erori și trace-uri, activate prin env în fiecare aplicație.",
                },
                url: "https://sentry.io",
            },
        ],
    },
    {
        id: "ai",
        items: [
            {
                name: "codai gateway",
                note: {
                    en: "One model name, Claude via Vertex AI and Azure AI Foundry behind it, with spend caps and prompt caching.",
                    ro: "Un singur nume de model, Claude prin Vertex AI și Azure AI Foundry în spate, cu plafoane de cost și prompt caching.",
                },
                url: "https://codai.ro",
            },
            {
                name: "Vercel AI SDK",
                note: {
                    en: "App-side LLM calls, streaming and tool use.",
                    ro: "Apeluri LLM în aplicații, streaming și tool use.",
                },
                url: "https://ai-sdk.dev",
            },
            {
                name: "MCP servers",
                note: {
                    en: "axiom (reasoning) on npm, plus the codai MCP memory server and Windows computer-use.",
                    ro: "axiom (raționament) pe npm, plus serverul MCP de memorie codai și computer-use pe Windows.",
                },
                url: "https://www.npmjs.com/org/codai",
            },
            {
                name: "Whisper · Deepgram · Piper",
                note: {
                    en: "Speech in and out for metu and TikSee.",
                    ro: "Vorbire la intrare și ieșire pentru metu și TikSee.",
                },
            },
        ],
    },
];
