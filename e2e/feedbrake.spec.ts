import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("feedbrake pages", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    for (const path of [
        "/feedbrake",
        "/feedbrake/privacy",
        "/ro/feedbrake",
        "/ro/feedbrake/privacy",
    ]) {
        test(`${path} renders with canonical, hreflang and no axe violations`, async ({ page }) => {
            const res = await page.goto(path);
            expect(res?.status()).toBe(200);
            await expect(page.getByRole("heading", { level: 1 })).toContainText("Feedbrake");
            await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
                "href",
                new RegExp(`${path}$`),
            );
            await expect(page.locator('link[rel="alternate"][hreflang="ro"]')).toHaveCount(1);
            await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
            await page.waitForLoadState("networkidle");
            const axe = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
                .analyze();
            expect(axe.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
        });
    }

    test("no Google Play link while PLAY_URL is null", async ({ page }) => {
        await page.goto("/feedbrake");
        await expect(page.locator('a[href*="play.google.com"]')).toHaveCount(0);
        await expect(page.getByText("Coming soon on Google Play")).toBeVisible();
    });

    for (const [from, to] of [
        ["/unscroll", "/feedbrake"],
        ["/unscroll/privacy", "/feedbrake/privacy"],
        ["/ro/unscroll/privacy", "/ro/feedbrake/privacy"],
    ] as const) {
        test(`${from} permanently redirects to ${to}`, async ({ request }) => {
            const res = await request.get(from, { maxRedirects: 0 });
            expect(res.status()).toBe(308);
            expect(new URL(res.headers()["location"] ?? "", "http://x").pathname).toBe(to);
        });
    }
});
