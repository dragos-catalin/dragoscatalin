import type { ProjectStatus } from "@/data/types";

export type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "danger" | "outline";

export const statusVariant: Record<ProjectStatus, BadgeVariant> = {
    live: "success",
    launching: "accent",
    active: "accent",
    research: "warning",
    maintenance: "neutral",
    paused: "warning",
    "case-study": "outline",
    archived: "neutral",
};
