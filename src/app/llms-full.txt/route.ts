import { buildLlmsFullTxt } from "@/lib/llms";

export async function GET() {
    const body = await buildLlmsFullTxt();
    return new Response(body, {
        headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
    });
}
