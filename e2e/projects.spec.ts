import { expect, test } from "@playwright/test";

const cards = (page: import("@playwright/test").Page) => page.locator("main a[href^='/projects/']");

test.describe("projects", () => {
    test("lists projects and filters via URL state", async ({ page }) => {
        await page.goto("/projects");
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        expect(await cards(page).count()).toBeGreaterThanOrEqual(10);

        const search = page.getByRole("searchbox");
        await search.fill("codai");
        await expect(page).toHaveURL(/[?&]q=codai/);
        await expect(cards(page).first()).toBeVisible();
        expect(await cards(page).count()).toBeGreaterThanOrEqual(1);
        await expect(cards(page).filter({ hasText: /codai/i }).first()).toBeVisible();

        // Status chip toggles a URL param.
        const statusGroup = page.locator("fieldset").first();
        await statusGroup.getByRole("button", { pressed: false }).first().click();
        await expect(page).toHaveURL(/[?&]status=/);

        // Clear resets everything.
        await page.getByRole("button", { name: /clear/i }).click();
        await expect(page).not.toHaveURL(/[?&](q|status)=/);
        await expect(search).toHaveValue("");
        expect(await cards(page).count()).toBeGreaterThanOrEqual(10);
    });

    test("detail page renders name and SoftwareApplication JSON-LD", async ({ page }) => {
        await page.goto("/projects/codai");
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("codai");

        const ld = page.locator("script[type='application/ld+json']");
        const payloads = await ld.allTextContents();
        const types = payloads.flatMap((p) => {
            const j = JSON.parse(p) as { "@type"?: string } | { "@type"?: string }[];
            return Array.isArray(j) ? j.map((x) => x["@type"]) : [j["@type"]];
        });
        expect(types).toContain("SoftwareApplication");
    });
});
