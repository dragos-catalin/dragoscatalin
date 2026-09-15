import { expect, test } from "@playwright/test";

test.describe("seo / aeo routes", () => {
    test("sitemap lists localized project urls", async ({ request }) => {
        const res = await request.get("/sitemap.xml");
        expect(res.ok()).toBeTruthy();
        const xml = await res.text();
        expect(xml).toContain("<urlset");
        expect(xml).toContain("/ro/projects/codai");
        expect(xml).toContain("/projects/codai");
    });

    test("robots points at the sitemap", async ({ request }) => {
        const txt = await (await request.get("/robots.txt")).text();
        expect(txt).toMatch(/^Sitemap: https?:\/\/.+\/sitemap\.xml/m);
    });

    test("llms.txt is markdown starting with a heading", async ({ request }) => {
        const res = await request.get("/llms.txt");
        expect(res.ok()).toBeTruthy();
        expect((await res.text()).startsWith("# ")).toBe(true);
    });

    test("/api/projects returns the registry", async ({ request }) => {
        const res = await request.get("/api/projects");
        expect(res.ok()).toBeTruthy();
        const json = (await res.json()) as { projects: { slug: string }[] };
        expect(Array.isArray(json.projects)).toBe(true);
        expect(json.projects.length).toBeGreaterThan(10);
        expect(json.projects.some((p) => p.slug === "codai")).toBe(true);
    });

    test("feed.xml is RSS", async ({ request }) => {
        const res = await request.get("/feed.xml");
        expect(res.ok()).toBeTruthy();
        expect(await res.text()).toContain("<rss");
    });
});
