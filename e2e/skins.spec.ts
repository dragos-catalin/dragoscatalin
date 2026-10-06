import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const SKIN_HOMES = ["editorial", "constellation", "command", "devices"] as const;

async function setSkin(context: BrowserContext, baseURL: string | undefined, skin: string) {
    await context.addCookies([
        { name: "dc-skin", value: skin, url: baseURL ?? "http://localhost:24789" },
    ]);
}

function collectErrors(page: Page) {
    const errors: string[] = [];
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));
    return errors;
}

test.describe("skins", () => {
    for (const skin of SKIN_HOMES) {
        test(`${skin}: home renders the skin with headline, nav and a clean console`, async ({
            page,
            context,
            baseURL,
        }) => {
            await setSkin(context, baseURL, skin);
            const errors = collectErrors(page);
            await page.goto("/");
            await expect(page.locator(`[data-skin-home="${skin}"]`)).toBeVisible();
            await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
            await expect(page).toHaveURL(/\/$/);
            await expect(page.getByRole("heading", { level: 1 })).toContainText(
                "I build products end to end",
            );
            // Classic home markers are absent (hero pills belong to classic only).
            expect(await page.locator(".hero-pill").count()).toBe(0);
            // Lab runs (navigator.webdriver) never get a canvas: constellation's R3F sky (V3-05)
            // is gated off there, so the poster is what tests and Lighthouse see.
            expect(await page.locator("canvas").count()).toBe(0);

            const nav = page.getByRole("navigation").first();
            await expect(nav.getByRole("link", { name: "Projects" })).toHaveAttribute(
                "href",
                "/projects",
            );
            await expect(page.locator("a[data-skin-back]")).toHaveAttribute(
                "href",
                "/?skin=classic",
            );
            await nav.getByRole("link", { name: "Projects" }).click();
            await expect(page).toHaveURL(/\/projects$/);
            await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
            expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
        });

        test(`${skin}: /ro home is the Romanian skin home`, async ({ page, context, baseURL }) => {
            await setSkin(context, baseURL, skin);
            await page.goto("/ro");
            await expect(page.locator(`[data-skin-home="${skin}"]`)).toBeVisible();
            await expect(page.locator("html")).toHaveAttribute("lang", "ro");
            await expect(page.getByRole("heading", { level: 1 })).toContainText(
                "Construiesc produse",
            );
        });

        test(`${skin}: content pages keep the classic chrome and carry data-skin`, async ({
            page,
            context,
            baseURL,
        }) => {
            await setSkin(context, baseURL, skin);
            await page.goto("/projects");
            await expect(page.locator("html")).toHaveAttribute("data-skin", skin);
            await expect(page.locator("[data-skin-home]")).toHaveCount(0);
            await expect(page.locator("header").first()).toBeVisible();
            await expect(page.locator("main#main")).toBeVisible();
        });
    }

    test("?skin=command sets the cookie and redirects to the clean home", async ({
        page,
        context,
    }) => {
        const res = await page.request.get("/?skin=command", { maxRedirects: 0 });
        expect(res.status()).toBe(307);
        expect(res.headers()["location"]).toMatch(/\/$/);
        expect(res.headers()["set-cookie"]).toContain("dc-skin=command");

        await page.goto("/?skin=command");
        await expect(page).toHaveURL(/\/$/);
        await expect(page.locator('[data-skin-home="command"]')).toBeVisible();
        const cookie = (await context.cookies()).find((c) => c.name === "dc-skin");
        expect(cookie?.value).toBe("command");
    });

    test("?skin=classic clears the cookie and shows the classic home", async ({
        page,
        context,
        baseURL,
    }) => {
        await setSkin(context, baseURL, "editorial");
        await page.goto("/?skin=classic");
        await expect(page).toHaveURL(/\/$/);
        await expect(page.locator("[data-skin-home]")).toHaveCount(0);
        await expect(page.locator("#home .hero-pill").first()).toBeAttached();
        const cookie = (await context.cookies()).find((c) => c.name === "dc-skin");
        expect(cookie).toBeUndefined();
    });

    test("direct hits on /skin/* are 404", async ({ request }) => {
        for (const path of ["/skin/editorial", "/ro/skin/command", "/en/skin/devices"]) {
            const res = await request.get(path, { maxRedirects: 0 });
            expect(res.status(), path).toBe(404);
        }
    });

    test("the theme menu switches skins and reloads the home", async ({ page, context }) => {
        await page.goto("/");
        await page.getByRole("button", { name: "Appearance" }).first().click();
        const group = page.getByRole("group", { name: "Skin" });
        await expect(group.getByRole("button", { name: "Classic" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        await group.getByRole("button", { name: "Editorial" }).click();
        await expect(page.locator('[data-skin-home="editorial"]')).toBeVisible();
        const cookie = (await context.cookies()).find((c) => c.name === "dc-skin");
        expect(cookie?.value).toBe("editorial");
    });
});

test.describe("skins: axe", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    for (const skin of SKIN_HOMES) {
        test(`axe: ${skin} home has no WCAG 2.2 AA violations`, async ({
            page,
            context,
            baseURL,
        }) => {
            await setSkin(context, baseURL, skin);
            await page.goto("/");
            await page.getByRole("heading", { level: 1 }).waitFor();
            await page.waitForLoadState("networkidle");
            const results = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
                .analyze();
            const summary = results.violations.map(
                (v) =>
                    `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).join("\n  ")}`,
            );
            expect(results.violations, summary.join("\n")).toEqual([]);
        });
    }
});
