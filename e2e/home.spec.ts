import { expect, test } from "@playwright/test";

test.describe("home", () => {
    test("loads with hero, nav and a clean console", async ({ page }) => {
        const errors: string[] = [];
        page.on("console", (msg) => {
            if (msg.type() === "error") errors.push(msg.text());
        });
        page.on("pageerror", (err) => errors.push(err.message));

        await page.goto("/");
        await expect(page).toHaveTitle(/Dragoș Cătălin/);

        const h1 = page.getByRole("heading", { level: 1 });
        await expect(h1).toBeVisible();
        await expect(h1).not.toHaveText("");

        const hero = page.locator("#home");
        // Restored v1 hero: technology pills are present, and no continuously
        // animated canvas/WebGL object exists anywhere (owner policy, docs/DESIGN.md).
        expect(await hero.locator(".hero-pill").count()).toBeGreaterThanOrEqual(10);
        expect(await page.locator("canvas").count()).toBe(0);

        // Fixed floating header: <main> must carry the offset so the h1 is never under it.
        // (2026-09-15: exporting the class from a "use client" file rendered a function body.)
        const headerBox = await page.locator("header").boundingBox();
        const h1Box = await h1.boundingBox();
        expect(headerBox && h1Box && h1Box.y >= headerBox.y + headerBox.height).toBe(true);

        const nav = page.getByRole("navigation").first();
        const links = nav.getByRole("link");
        expect(await links.count()).toBeGreaterThanOrEqual(4);
        await expect(nav.getByRole("link", { name: "Projects" })).toHaveAttribute(
            "href",
            "/projects",
        );

        expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
    });

    // V3-11: real numbers in the hero, measured languages and store links on About.
    test("hero shows measured numbers; About shows languages and store profiles", async ({
        page,
    }) => {
        await page.goto("/");
        await expect(page.getByTestId("hero-proof")).toContainText(/\d+ products shipped/);
        await expect(page.getByTestId("hero-proof")).toContainText(/commits in \d{4}/);

        await page.goto("/about");
        await expect(page.getByTestId("about-numbers")).toContainText("20+");
        await expect(page.getByTestId("about-languages")).toContainText("TypeScript");
        await expect(page.getByTestId("about-languages")).toContainText("Kotlin");
        await expect(page.getByTestId("about-also").getByRole("listitem").first()).toBeVisible();
        const stores = page.getByTestId("about-stores");
        await expect(
            stores.locator(
                'a[href="https://play.google.com/store/apps/developer?id=Dragos+Catalin"]',
            ),
        ).toBeVisible();
        await expect(
            stores.locator('a[href="https://marketplace.visualstudio.com/publishers/dragoscv"]'),
        ).toBeVisible();
        await expect(page.getByTestId("footer-stores").getByRole("link")).toHaveCount(4);

        await page.goto("/ro/about");
        await expect(
            page.getByRole("heading", { level: 2, name: "Limbajele în care scriu" }),
        ).toBeVisible();
    });
});
