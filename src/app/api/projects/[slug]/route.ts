import { getProject } from "@/data/projects";
import { json, loadStats, toApiProject, API_HEADERS } from "@/lib/projects-api";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const project = getProject(slug);
    if (!project) return json({ error: "not_found", slug }, 404);
    const stats = await loadStats();
    return json({ generatedAt: new Date().toISOString(), project: toApiProject(project, stats) });
}

export function OPTIONS() {
    return new Response(null, { status: 204, headers: API_HEADERS });
}
