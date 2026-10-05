// render.mjs — screenshot the concept HTML sheets to brand/concepts/*.png (each <= 300 KB).
//   node brand/concepts/src/render.mjs
// Uses the repo's @playwright/test (Chromium) and Next's bundled sharp for palette-PNG compression.
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { statSync } from "node:fs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
const req = createRequire(join(ROOT, "package.json"));
const { chromium } = req("@playwright/test");
const sharp = createRequire(req.resolve("next/package.json"))("sharp");
const LIMIT = 300 * 1024;

const pages = [
    ["sheet-a.html", "concept-a-trace.png"],
    ["sheet-b.html", "concept-b-ink.png"],
    ["sheet-c.html", "concept-c-hearth.png"],
    ["sheet-d.html", "concept-d-phosphor.png"],
    ["sheet-e.html", "concept-e-keystone.png"],
    ["overview.html", "overview.png"],
    ["glyph-test.html", "glyph-test.png"],
];

async function compress(buf, out) {
    let width = (await sharp(buf).metadata()).width;
    for (const [colors, scale] of [
        [256, 1],
        [128, 1],
        [256, 0.85],
        [128, 0.85],
        [96, 0.75],
        [64, 0.7],
    ]) {
        const w = Math.round(width * scale);
        await sharp(buf)
            .resize({ width: w })
            .png({ palette: true, colors, effort: 10, compressionLevel: 9, dither: 0.6 })
            .toFile(out);
        const size = statSync(out).size;
        if (size <= LIMIT) return { size, colors, w };
    }
    throw new Error(`${out} still > 300 KB`);
}

const browser = await chromium.launch();
const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
});
for (const [src, png] of pages) {
    await page.goto(pathToFileURL(join(HERE, src)).href);
    await page.evaluate(() => document.fonts.ready);
    const missing = await page.evaluate(() =>
        [...document.fonts].filter((f) => f.status === "error").map((f) => f.family),
    );
    const buf = await page.screenshot({ fullPage: true, type: "png" });
    const out = join(HERE, "..", png);
    const r = await compress(buf, out);
    await sharp(buf)
        .resize({ width: 800 })
        .jpeg({ quality: 70 })
        .toFile(join(ROOT, ".copilot-tmp", "brand", `preview-${png.replace(".png", ".jpg")}`));
    console.log(
        `${png.padEnd(26)} ${(r.size / 1024).toFixed(0)} KB  ${r.w}px wide  ${r.colors} colours${missing.length ? `  FONT ERRORS: ${missing.join(",")}` : ""}`,
    );
}
await browser.close();
