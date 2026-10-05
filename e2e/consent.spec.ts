import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ANALYTICS =
    /\/_vercel\/(insights|speed-insights)\/|va\.vercel-scripts\.com|challenges\.cloudflare\.com/;

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.describe("cookie consent", () => {
    test("nothing optional loads before a choice; reject keeps it off", async ({
        page,
        context,
    }) => {
        const optional: string[] = [];
        page.on("request", (r) => {
            if (ANALYTICS.test(r.url())) optional.push(r.url());
        });
        await page.goto("/");
        const banner = page.getByRole("region", { name: /cookies/i });
        await expect(banner).toBeVisible();
        // Equal prominence: both are the same variant/size.
        const reject = banner.getByRole("button", { name: /reject all/i });
        const accept = banner.getByRole("button", { name: /accept all/i });
        await expect(reject).toHaveClass((await accept.getAttribute("class")) ?? "");
        await page.waitForLoadState("networkidle");
        expect(optional).toEqual([]);

        await reject.click();
        await expect(banner).toBeHidden();
        const cookie = (await context.cookies()).find((c) => c.name === "dc-consent");
        expect(decodeURIComponent(cookie?.value ?? "")).toContain('"analytics":false');
        await page.reload();
        await expect(page.getByRole("region", { name: /cookies/i })).toBeHidden();
        await page.waitForLoadState("networkidle");
        expect(optional).toEqual([]);
    });

    test("preferences dialog is keyboard accessible and persists the choice", async ({
        page,
        context,
    }) => {
        await page.goto("/");
        await page.getByRole("button", { name: /customise/i }).click();
        const dialog = page.getByRole("dialog", { name: /cookie preferences/i });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole("switch", { name: /strictly necessary/i })).toBeDisabled();
        const analytics = dialog.getByRole("switch", { name: /analytics/i });
        await expect(analytics).toHaveAttribute("aria-checked", "false");
        await analytics.click();
        await expect(analytics).toHaveAttribute("aria-checked", "true");

        const axe = await new AxeBuilder({ page })
            .include("dialog")
            .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
            .analyze();
        expect(axe.violations.map((v) => v.id)).toEqual([]);

        await dialog.getByRole("button", { name: /save choice/i }).click();
        await expect(dialog).toBeHidden();
        const cookie = (await context.cookies()).find((c) => c.name === "dc-consent");
        expect(decodeURIComponent(cookie?.value ?? "")).toContain('"analytics":true');

        // Re-open from the footer and dismiss with Escape.
        await page
            .getByRole("button", { name: /cookie settings/i })
            .first()
            .click();
        await expect(dialog).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
    });

    test("privacy page lists every stored item", async ({ page }) => {
        await page.goto("/privacy");
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(/privacy/i);
        for (const name of ["dc-theme", "NEXT_LOCALE", "dc-consent"])
            await expect(page.getByRole("rowheader", { name })).toBeVisible();
    });
});
