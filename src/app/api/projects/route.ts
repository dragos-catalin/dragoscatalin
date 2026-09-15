import { projects } from "@/data/projects";
import { json, loadStats, toApiProject, API_HEADERS } from "@/lib/projects-api";
import { site } from "@/lib/site";

export async function GET() {
    const stats = await loadStats();
    return json({
        generatedAt: new Date().toISOString(),
        site: { name: site.name, url: site.url },
        projects: projects.map((p) => toApiProject(p, stats)),
    });
}

export function OPTIONS() {
    return new Response(null, { status: 204, headers: API_HEADERS });
}
