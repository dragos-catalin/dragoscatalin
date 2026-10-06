import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext } from "@playwright/test";

/** V3-04..07: the interactive layer of each skin home. */
async function setSkin(context: BrowserContext, baseURL: string | undefined, skin: string) {
    await context.addCookies([
        { name: "dc-skin", value: skin, url: baseURL ?? "http://localhost:24789" },
    ]);
}

test.describe("skins v3 behaviour", () => {
    test("command: the prompt runs help, open and reports unknown commands", async ({
        page,
        context,
        baseURL,
    }) => {
        await setSkin(context, baseURL, "command");
        await page.goto("/");
        const input = page.getByRole("textbox", { name: "Command" });
        await expect(input).toBeEnabled();

        await page.keyboard.press("/");
        await expect(input).toBeFocused();

        await input.fill("help");
        await input.press("Enter");
        const log = page.getByRole("log");
        await expect(log).toContainText("Show this help");

        await input.fill("frobnicate");
        await input.press("Enter");
        await expect(log).toContainText("command not found: frobnicate");

        await input.fill("open codai");
        await input.press("Enter");
        await expect(page).toHaveURL(/\/projects\/codai$/);
    });

    test("command: typing in the contact form is not hijacked by the / shortcut", async ({
        page,
        context,
        baseURL,
    }) => {
        await setSkin(context, baseURL, "command");
        await page.goto("/");
        const message = page.locator("#contact textarea");
        await message.click();
        await page.keyboard.type("a/b");
        await expect(message).toHaveValue("a/b");
    });

    test("devices: next/previous move the ring and only the front slide is focusable", async ({
        page,
        context,
        baseURL,
    }) => {
        test.skip((page.viewportSize()?.width ?? 0) < 768, "3D ring is md+ only");
        await setSkin(context, baseURL, "devices");
        await page.goto("/");
        const region = page.locator('[aria-roledescription="carousel"]');
        await expect(region).toBeVisible();
        const slides = region.locator('[aria-roledescription="slide"]');
        const total = await slides.count();
        expect(total).toBeGreaterThan(2);

        const front = () => region.locator('[aria-roledescription="slide"]:not([inert])').first();
        const first = await front().getAttribute("aria-label");
        await page.getByRole("button", { name: "Next project" }).click();
        await expect(front()).not.toHaveAttribute("aria-label", first ?? "");
        await page.getByRole("button", { name: "Previous project" }).click();
        await expect(front()).toHaveAttribute("aria-label", first ?? "");
        expect(await region.locator('[aria-roledescription="slide"][inert]').count()).toBe(
            total - 1,
        );
        await expect(page.getByRole("button", { name: /rotation/ })).toBeVisible();
    });

    test("devices: reduced motion keeps the 2D row with every slide reachable", async ({
        browser,
        baseURL,
    }) => {
        const context = await browser.newContext({ reducedMotion: "reduce" });
        await setSkin(context, baseURL, "devices");
        const page = await context.newPage();
        await page.goto(baseURL ?? "/");
        const region = page.locator('[aria-roledescription="carousel"]');
        await expect(region).toBeVisible();
        expect(await region.locator('[aria-roledescription="slide"][inert]').count()).toBe(0);
        await context.close();
    });

    test("editorial: the headline keeps its accessible sentence after hydration", async ({
        page,
        context,
        baseURL,
    }) => {
        await setSkin(context, baseURL, "editorial");
        await page.goto("/");
        const h1 = page.getByRole("heading", { level: 1 });
        await expect(h1).toHaveAccessibleName(/I build products end to end/);
        await expect(h1).toBeVisible();
    });

    test("constellation: lab runs (webdriver) get the poster, never a canvas", async ({
        page,
        context,
        baseURL,
    }) => {
        await setSkin(context, baseURL, "constellation");
        await page.goto("/");
        await page.waitForLoadState("load");
        await page.waitForTimeout(2500); // past the idle + 1500 ms fallback
        await expect(page.locator(".cs-stars")).toBeVisible();
        expect(await page.locator("canvas").count()).toBe(0);
    });
});

test.describe("skins v3: axe with motion on", () => {
    for (const skin of ["editorial", "command", "devices"] as const) {
        test(`axe: ${skin} home (motion allowed) has no WCAG 2.2 AA violations`, async ({
            page,
            context,
            baseURL,
        }) => {
            await setSkin(context, baseURL, skin);
            await page.goto("/");
            await page.getByRole("heading", { level: 1 }).waitFor();
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1600); // entrance animations settle
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
