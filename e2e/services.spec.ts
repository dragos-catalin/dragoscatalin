import { expect, test } from "@playwright/test";

test.describe("services and lab (S-05)", () => {
    test("services lists the four audiences and links to the contact form", async ({ page }) => {
        await page.goto("/services");
        await expect(page.getByRole("heading", { level: 1, name: "Services" })).toBeVisible();
        for (const id of ["startups", "smes", "enterprise", "developers"])
            await expect(page.locator(`section#${id}`)).toBeVisible();
        await expect(
            page.getByRole("link", { name: "Tell me about your project" }),
        ).toHaveAttribute("href", /#contact$/);
        const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
        expect(ld.some((s) => s.includes('"ProfessionalService"'))).toBe(true);
    });

    test("services renders in Romanian", async ({ page }) => {
        await page.goto("/ro/services");
        await expect(page.getByRole("heading", { level: 1, name: "Servicii" })).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("lang", "ro");
    });

    test("lab shows dated entries with a stage", async ({ page }) => {
        await page.goto("/lab");
        await expect(page.getByRole("heading", { level: 1, name: "Lab" })).toBeVisible();
        await expect(page.locator("li#d-03")).toContainText("mcp-lock");
        await expect(page.locator("li#d-03 time")).toHaveAttribute(
            "datetime",
            /^\d{4}-\d{2}-\d{2}$/,
        );
    });

    test("sitemap and llms.txt include the new pages", async ({ request }) => {
        const xml = await (await request.get("/sitemap.xml")).text();
        expect(xml).toContain("/services");
        expect(xml).toContain("/ro/lab");
        const llms = await (await request.get("/llms.txt")).text();
        expect(llms).toContain("/services");
        expect(llms).toContain("/lab");
    });
});
