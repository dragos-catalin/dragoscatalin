import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: site.name,
        short_name: "Dragoș",
        description:
            "Product engineer & founder — codai, Brivio, StudiAI, MixAI and 20+ open-source repos.",
        start_url: "/",
        display: "standalone",
        // Keystone dark canvas / mark tile (brand/tokens.json).
        background_color: "#090c13",
        theme_color: "#090c13",
        icons: [
            { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
            { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            {
                src: "/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
