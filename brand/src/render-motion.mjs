// render-motion.mjs — Keystone logo motion preview (gate E) from brand/motion/demo.html.
//   node brand/src/render-motion.mjs
// Writes brand/motion/intro-frames.png (8-frame strip, each frame sampled by pausing the real
// CSS animations at t ms) and brand/motion/intro.webm (Playwright video, 3 replays). Both <= 300 KB.
import { createRequire } from "node:module";
import {
    mkdirSync,
    readFileSync,
    readdirSync,
    renameSync,
    rmSync,
    statSync,
    writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const MOTION = join(HERE, "..", "motion");
const req = createRequire(join(ROOT, "package.json"));
const { chromium } = req("@playwright/test");
const sharp = createRequire(req.resolve("next/package.json"))("sharp");

// Inject the generated comma geometry into the demo page (single source: geometry.ts).
const geo = readFileSync(join(ROOT, "src/components/brand/geometry.ts"), "utf8");
const comma = geo.slice(geo.indexOf("export const COMMA"));
const d = comma.match(/"d": "([^"]+)"/)[1];
const vb = comma.match(/"viewBox": "([^"]+)"/)[1];
const demoSrc = join(MOTION, "demo.html");
let html = readFileSync(demoSrc, "utf8");
html = html.replace(
    /viewBox="(__COMMA_VB__|[-\d. ]+)"><path d="(__COMMA_D__|[^"]+)" fill="var\(--accent\)"/,
    `viewBox="${vb}"><path d="${d}" fill="var(--accent)"`,
);
writeFileSync(demoSrc, html);

const FRAMES = [0, 120, 260, 380, 520, 700, 820, 1100];
const browser = await chromium.launch();

// 1. frame strip
const page = await browser.newPage({ viewport: { width: 900, height: 700 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(demoSrc).href);
await page.evaluate(() => document.fonts.ready);
const stage = page.locator("#stage");
const shots = [];
for (const t of FRAMES) {
    await page.evaluate((ms) => {
        const s = document.getElementById("stage");
        s.classList.remove("play");
        void s.offsetWidth;
        s.classList.add("play");
        for (const a of s.getAnimations({ subtree: true })) {
            a.pause();
            a.currentTime = ms;
        }
    }, t);
    shots.push(await stage.screenshot());
}
const meta = await sharp(shots[0]).metadata();
const W = meta.width,
    H = meta.height,
    label = 34;
const strip = sharp({
    create: { width: W, height: (H + label) * FRAMES.length, channels: 4, background: "#090c13" },
}).composite(
    FRAMES.flatMap((t, i) => [
        { input: shots[i], left: 0, top: i * (H + label) + label },
        {
            input: Buffer.from(
                `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${label}"><text x="16" y="24" fill="#999ea9" font-family="monospace" font-size="16">t = ${t} ms${t === 1100 ? "  (final frame = static master)" : ""}</text></svg>`,
            ),
            left: 0,
            top: i * (H + label),
        },
    ]),
);
const stripBuf = await strip.png().toBuffer();
const stripOut = join(MOTION, "intro-frames.png");
await sharp(stripBuf)
    .resize({ width: Math.round(W * 0.75) })
    .png({ palette: true, colors: 64, effort: 10 })
    .toFile(stripOut);
await page.close();

// 2. video
const vdir = join(MOTION, ".video");
rmSync(vdir, { recursive: true, force: true });
mkdirSync(vdir, { recursive: true });
const ctx = await browser.newContext({
    viewport: { width: 720, height: 260 },
    recordVideo: { dir: vdir, size: { width: 720, height: 260 } },
});
const vp = await ctx.newPage();
await vp.goto(pathToFileURL(demoSrc).href);
await vp.addStyleTag({ content: "body{padding:40px} h1,p,ol,button{display:none}" });
await vp.evaluate(() => document.fonts.ready);
for (let i = 0; i < 3; i++) {
    await vp.evaluate(() => {
        const s = document.getElementById("stage");
        s.classList.remove("play");
        void s.offsetWidth;
        s.classList.add("play");
    });
    await vp.waitForTimeout(1800);
}
await ctx.close();
await browser.close();
const vid = readdirSync(vdir).find((f) => f.endsWith(".webm"));
const vidOut = join(MOTION, "intro.webm");
renameSync(join(vdir, vid), vidOut);
rmSync(vdir, { recursive: true, force: true });

for (const f of [stripOut, vidOut]) {
    const kb = statSync(f).size / 1024;
    console.log(
        `${f.replace(ROOT, "").slice(1)}  ${kb.toFixed(1)} KB${kb > 300 ? "  OVER 300 KB" : ""}`,
    );
}
