import { expect, test } from "@playwright/test";

const cards = (page: import("@playwright/test").Page) => page.locator("main a[href^='/projects/']");

test.describe("projects", () => {
    test("lists projects and filters via URL state", async ({ page }) => {
        await page.goto("/projects");
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        // The grid streams in behind a Suspense skeleton — poll instead of a one-shot count.
        await expect.poll(() => cards(page).count()).toBeGreaterThanOrEqual(10);

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
        await expect.poll(() => cards(page).count()).toBeGreaterThanOrEqual(10);
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

    test("paused project shows no live site link", async ({ page }) => {
        await page.goto("/projects/notai");
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("notai");
        await expect(page.getByTestId("paused-note")).toBeVisible();
        await expect(page.getByTestId("visit-site")).toHaveCount(0);
        await expect(page.locator("main a[href*='notai.ro']")).toHaveCount(0);
    });

    test("store badges link to the store with an accessible name", async ({ page }) => {
        await page.goto("/projects/codai");
        const ms = page.getByTestId("store-badges").locator("a[data-store='ms-store']");
        await expect(ms).toHaveAttribute("href", /^https:\/\/apps\.microsoft\.com\//);
        await expect(ms).toHaveAccessibleName(/codai on Microsoft Store/);
        await expect(page.getByTestId("platform-chips")).toContainText("Wear OS");

        const ld = await page.locator("script[type='application/ld+json']").allTextContents();
        const app = ld
            .map((p) => JSON.parse(p) as Record<string, unknown>)
            .find((j) => j["@type"] === "SoftwareApplication");
        expect(app?.installUrl).toMatch(/^https:\/\/apps\.microsoft\.com\//);
        expect(String(app?.operatingSystem)).toContain("Wear OS");
    });

    test("Horae lists its live faces with Play links", async ({ page }) => {
        await page.goto("/ro/projects/horae");
        await expect(page.getByTestId("teaser")).toContainText("publicate pe Google Play");
        const links = page.getByTestId("listings").locator("a[href^='https://play.google.com/']");
        await expect.poll(() => links.count()).toBeGreaterThan(0);
    });
});
