import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/projects", "/projects/codai", "/about"];

// Reveal animations blend foreground colours mid-transition; axe would sample a
// half-faded frame. The site honours prefers-reduced-motion, so audit the settled state.
test.use({ contextOptions: { reducedMotion: "reduce" } });

for (const path of PAGES) {
    test(`axe: ${path} has no WCAG 2.2 AA violations`, async ({ page }) => {
        await page.goto(path);
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
