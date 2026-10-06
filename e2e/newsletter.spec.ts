import { expect, test } from "@playwright/test";

test.describe("newsletter (V3-20)", () => {
    test("form needs a valid email and consent before it submits", async ({ page }) => {
        await page.goto("/newsletter");
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        const submit = page.getByRole("button", { name: "Subscribe" });

        await submit.click();
        await expect(page.getByText("Please enter a valid email.")).toBeVisible();

        await page.getByRole("textbox", { name: "Email" }).fill("ana@example.com");
        await submit.click();
        await expect(page.getByText("Please tick the box to agree.")).toBeVisible();
        await expect(page.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
    });

    test("canonical, hreflang and footer link", async ({ page }) => {
        await page.goto("/ro/newsletter");
        await expect(page.locator("html")).toHaveAttribute("lang", "ro");
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            "href",
            /\/ro\/newsletter$/,
        );
        await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
            "href",
            /\/newsletter$/,
        );
        await expect(
            page.locator("footer").getByRole("link", { name: "Newsletter" }),
        ).toBeVisible();
    });

    test("confirmed page is not indexed", async ({ page }) => {
        await page.goto("/newsletter/confirmed");
        await expect(
            page.getByRole("heading", { level: 1, name: "You're subscribed" }),
        ).toBeVisible();
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    });

    test("sitemap lists the newsletter page", async ({ request }) => {
        const xml = await (await request.get("/sitemap.xml")).text();
        expect(xml).toContain("/ro/newsletter");
    });
});
