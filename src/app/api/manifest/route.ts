import { json, API_HEADERS } from "@/lib/projects-api";
import { site } from "@/lib/site";

export function GET() {
    return json({
        name: "dragoscatalin",
        description: `Public, read-only discovery API for the projects, releases and open-source work of ${site.fullName}.`,
        version: "1.0.0",
        endpoints: [
            {
                path: "/api/projects",
                method: "GET",
                description: "All projects with live GitHub stats",
            },
            {
                path: "/api/projects/{slug}",
                method: "GET",
                description: "One project by slug (404 JSON if unknown)",
            },
            { path: "/llms.txt", method: "GET", description: "llmstxt.org summary for LLM agents" },
            {
                path: "/llms-full.txt",
                method: "GET",
                description: "Full project details in plain text",
            },
            {
                path: "/feed.xml",
                method: "GET",
                description: "RSS 2.0 feed of projects and releases",
            },
        ],
        schema: `${site.url}/api/projects`,
        contact: site.email,
    });
}

export function OPTIONS() {
    return new Response(null, { status: 204, headers: API_HEADERS });
}
