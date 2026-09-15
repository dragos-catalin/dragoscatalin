import { expect, test } from "@playwright/test";

test.describe("home", () => {
    test("loads with hero, nav and a clean console", async ({ page }) => {
        const errors: string[] = [];
        page.on("console", (msg) => {
            if (msg.type() === "error") errors.push(msg.text());
        });
        page.on("pageerror", (err) => errors.push(err.message));

        await page.goto("/");
        await expect(page).toHaveTitle(/Dragos Catalin/);

        const h1 = page.getByRole("heading", { level: 1 });
        await expect(h1).toBeVisible();
        await expect(h1).not.toHaveText("");

        const hero = page.locator("#home");
        // Restored v1 hero: technology pills are present, and no continuously
        // animated canvas/WebGL object exists anywhere (owner policy, docs/DESIGN.md).
        expect(await hero.locator(".hero-pill").count()).toBeGreaterThanOrEqual(10);
        expect(await page.locator("canvas").count()).toBe(0);

        const nav = page.getByRole("navigation").first();
        const links = nav.getByRole("link");
        expect(await links.count()).toBeGreaterThanOrEqual(4);
        await expect(nav.getByRole("link", { name: "Projects" })).toHaveAttribute(
            "href",
            "/projects",
        );

        expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
    });
});
