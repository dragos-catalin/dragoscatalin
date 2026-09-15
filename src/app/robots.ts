import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** AI crawlers are explicitly allowed (answer-engine optimisation). */
const AI_AGENTS = [
    "GPTBot",
    "ChatGPT-User",
    "ClaudeBot",
    "anthropic-ai",
    "PerplexityBot",
    "Google-Extended",
    "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            { userAgent: "*", allow: "/", disallow: ["/api/"] },
            ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: "/" })),
        ],
        sitemap: `${site.url}/sitemap.xml`,
        host: site.url,
    };
}
