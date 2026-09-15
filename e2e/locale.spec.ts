import { expect, test } from "@playwright/test";

test.describe("locale", () => {
    test("switcher moves to /ro, flips lang and translates the h1", async ({ page }) => {
        await page.goto("/");
        // Dev server compiles client chunks lazily; the switcher is inert until hydrated.
        await page.waitForLoadState("networkidle");
        const h1 = page.getByRole("heading", { level: 1 });
        const enTitle = (await h1.textContent())?.trim();
        expect(enTitle).toBeTruthy();

        await expect(page.locator("link[rel=alternate][hreflang=ro]")).toHaveAttribute(
            "href",
            /\/ro\/?$/,
        );
        await expect(page.locator("link[rel=alternate][hreflang='x-default']")).toHaveCount(1);
        await expect(page.locator("html")).toHaveAttribute("lang", "en");

        const switcher = page.locator("button[aria-label^='Language']");
        // A click that lands before hydration is dropped by React; poll until navigation happened.
        await expect
            .poll(
                async () => {
                    await switcher.click();
                    await page.waitForURL(/\/ro(\/|$)/, { timeout: 3_000 }).catch(() => {});
                    return new URL(page.url()).pathname;
                },
                { timeout: 20_000 },
            )
            .toMatch(/^\/ro(\/|$)/);
        await expect(page.locator("html")).toHaveAttribute("lang", "ro");
        await expect(h1).not.toHaveText(enTitle!);
        await expect(page.locator("link[rel=alternate][hreflang=en]")).toHaveCount(1);
    });
});
