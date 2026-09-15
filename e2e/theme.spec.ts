import { expect, test } from "@playwright/test";

test.describe("theme", () => {
    test("mode + accent apply and persist across reload via cookie", async ({ page, context }) => {
        await page.goto("/");
        const html = page.locator("html");

        const dialog = page.getByRole("dialog");
        const trigger = page.locator("button[aria-haspopup='dialog']").first();
        // Clicks before hydration are dropped by React; retry until the dialog is open.
        await expect
            .poll(
                async () => {
                    if (await dialog.isVisible()) return true;
                    await trigger.click();
                    return dialog.isVisible();
                },
                { timeout: 20_000 },
            )
            .toBe(true);

        await dialog.getByRole("radio", { name: "Light" }).click();
        await expect(html).toHaveAttribute("data-mode", "light");

        await dialog.getByRole("button", { name: "Emerald" }).click();
        await expect(html).toHaveAttribute("data-accent", "emerald");

        const cookies = await context.cookies();
        const theme = cookies.find((c) => c.name === "dc-theme");
        expect(theme, "dc-theme cookie should be set").toBeTruthy();
        expect(decodeURIComponent(theme!.value)).toContain('"accent":"emerald"');

        await page.reload();
        await expect(html).toHaveAttribute("data-mode", "light");
        await expect(html).toHaveAttribute("data-accent", "emerald");
    });
});
