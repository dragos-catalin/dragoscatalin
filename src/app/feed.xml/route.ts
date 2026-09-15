import { cacheLife } from "next/cache";
import { Feed } from "feed";
import { allRepos, projects } from "@/data/projects";
import { fetchRepoStats } from "@/lib/github";
import { site } from "@/lib/site";

const MAX_ITEMS = 50;

interface Item {
    title: string;
    id: string;
    link: string;
    description: string;
    date: Date;
}

async function buildFeed(): Promise<string> {
    "use cache";
    cacheLife("days");

    const stats = await fetchRepoStats(allRepos);
    const items: Item[] = [];

    for (const p of projects) {
        const link = `${site.url}/projects/${p.slug}`;
        items.push({
            title: p.name,
            id: link,
            link,
            description: p.tagline.en,
            date: new Date(`${p.years.from}-01-01T00:00:00Z`),
        });
        for (const r of p.repos ?? []) {
            const rel = stats[`${r.owner}/${r.name}`]?.latestRelease;
            if (!rel) continue;
            items.push({
                title: `${p.name} ${rel.tag}`,
                id: rel.url,
                link: rel.url,
                description: rel.name ?? `${p.name} release ${rel.tag}`,
                date: new Date(rel.publishedAt),
            });
        }
    }

    items.sort((a, b) => b.date.getTime() - a.date.getTime());

    const feed = new Feed({
        title: site.name,
        description: "Projects and releases by Dragos Catalin Vladulescu.",
        id: site.url,
        link: site.url,
        language: "en",
        image: site.avatar,
        favicon: `${site.url}/icon-192.png`,
        copyright: `© ${new Date().getFullYear()} ${site.fullName}`,
        updated: items[0]?.date ?? new Date(),
        feedLinks: { rss: `${site.url}/feed.xml` },
        author: { name: site.fullName, email: site.email, link: site.url },
    });
    for (const it of items.slice(0, MAX_ITEMS)) feed.addItem(it);
    return feed.rss2();
}

export async function GET() {
    const body = await buildFeed();
    return new Response(body, {
        headers: {
            "content-type": "application/rss+xml; charset=utf-8",
            "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
    });
}
