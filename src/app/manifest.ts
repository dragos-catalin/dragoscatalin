import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: site.name,
        short_name: "Dragos",
        description:
            "Full-stack developer & builder — codai, Brivio, StudiAI, MuzicAI and 20+ open-source repos.",
        start_url: "/",
        display: "standalone",
        background_color: "#12111c",
        theme_color: "#12111c",
        icons: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        ],
    };
}
