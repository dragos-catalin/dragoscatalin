import type { LocalizedText } from "./types";

/**
 * The layers the owner ships, from the pocket down to the network (home hero, "from cloud to
 * your pocket"). Proof slugs are validated against src/data/projects.ts in stack.test.ts.
 */
export interface StackLayer {
    id: "pocket" | "desktop" | "web" | "ai" | "api" | "cloud";
    label: LocalizedText;
    proof: string[];
}

export const stackLayers: StackLayer[] = [
    {
        id: "pocket",
        label: { en: "Android, Wear & TV", ro: "Android, Wear și TV" },
        proof: ["titi", "vitals"],
    },
    {
        id: "desktop",
        label: { en: "Desktop (Tauri, Rust)", ro: "Desktop (Tauri, Rust)" },
        proof: ["notai", "tiksee"],
    },
    {
        id: "web",
        label: { en: "Web & PWA", ro: "Web și PWA" },
        proof: ["brivio", "studiai"],
    },
    {
        id: "ai",
        label: { en: "AI & LLM gateways", ro: "AI și gateway-uri LLM" },
        proof: ["codai", "metu"],
    },
    {
        id: "api",
        label: { en: "APIs & realtime", ro: "API-uri și realtime" },
        proof: ["nexus", "mixai"],
    },
    {
        id: "cloud",
        label: { en: "Cloud & network", ro: "Cloud și rețea" },
        proof: ["vmui", "codai"],
    },
];
