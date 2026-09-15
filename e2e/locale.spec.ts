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

        // A real <a>: navigates even before hydration.
        const switcher = page.locator("a[aria-label^='Language']");
        await expect(switcher).toHaveAttribute("href", /^\/ro(\/|$)/);
        await switcher.click();
        await page.waitForURL(/\/ro(\/|$)/);
        await expect(page.locator("html")).toHaveAttribute("lang", "ro");
        await expect(h1).not.toHaveText(enTitle!);
        await expect(page.locator("link[rel=alternate][hreflang=en]")).toHaveCount(1);
    });
});
