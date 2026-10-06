// Scan every visible text node on each route for effective contrast < 4.5 (3 for ≥24px bold/large).
// Resolves the REAL backdrop by walking ancestors until a non-transparent background is found.
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:24789";
const routes = [
    "/",
    "/projects",
    "/services",
    "/lab",
    "/projects/codai",
    "/projects/titi",
    "/about",
    "/open-source",
    "/now",
    "/uses",
    "/press",
    "/ro",
];
const modes = ["dark", "light"];
const accents = ["ember", "violet"];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const issues = [];

for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    for (const mode of modes)
        for (const accent of accents) {
            await page.evaluate(
                ([m, a]) => {
                    document.documentElement.setAttribute("data-mode", m);
                    document.documentElement.setAttribute("data-accent", a);
                },
                [mode, accent],
            );
            await page.waitForTimeout(150);
            await page.evaluate(() =>
                document.getAnimations().forEach((a) => {
                    try {
                        a.finish();
                    } catch {
                        a.cancel();
                    }
                }),
            );
            const found = await page.evaluate(() => {
                const toRGB = (s) => {
                    if (!s || s === "transparent" || s === "rgba(0, 0, 0, 0)") return [0, 0, 0, 0];
                    // Paint and read back: works for oklab/oklch/color-mix, which fillStyle
                    // string normalisation does not handle (it returned "#000000").
                    const cv = document.createElement("canvas");
                    cv.width = cv.height = 1;
                    const c = cv.getContext("2d", { willReadFrequently: true });
                    c.clearRect(0, 0, 1, 1);
                    c.fillStyle = s;
                    c.fillRect(0, 0, 1, 1);
                    const d = c.getImageData(0, 0, 1, 1).data;
                    return [d[0], d[1], d[2], d[3] / 255];
                };
                const lum = ([r, g, b]) => {
                    const f = (c) => {
                        c /= 255;
                        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
                    };
                    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
                };
                const blend = (fg, bg) => {
                    const a = fg[3];
                    return [
                        fg[0] * a + bg[0] * (1 - a),
                        fg[1] * a + bg[1] * (1 - a),
                        fg[2] * a + bg[2] * (1 - a),
                        1,
                    ];
                };
                const ratio = (a, b) => {
                    const l1 = lum(a),
                        l2 = lum(b);
                    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
                };
                const backdrop = (el) => {
                    let acc = null;
                    for (let e = el; e; e = e.parentElement) {
                        const cs = getComputedStyle(e);
                        const bg = toRGB(cs.backgroundColor);
                        if (bg[3] > 0) {
                            acc = acc ? blend(acc, bg) : bg;
                            if (acc[3] >= 0.99 || bg[3] >= 0.99) return acc;
                        }
                        if (
                            cs.backgroundImage &&
                            cs.backgroundImage !== "none" &&
                            !cs.backgroundImage.startsWith("url")
                        ) {
                            return acc ?? toRGB(getComputedStyle(document.body).backgroundColor); // gradient: fall back to body
                        }
                    }
                    const body = toRGB(getComputedStyle(document.body).backgroundColor);
                    return acc ? blend(acc, body) : body;
                };
                const out = [];
                const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                const seen = new Set();
                let n;
                while ((n = walker.nextNode())) {
                    const t = n.textContent.trim();
                    if (t.length < 2) continue;
                    const el = n.parentElement;
                    if (!el || seen.has(el)) continue;
                    seen.add(el);
                    const cs = getComputedStyle(el);
                    if (
                        cs.visibility === "hidden" ||
                        cs.display === "none" ||
                        Number(cs.opacity) === 0
                    )
                        continue;
                    const r = el.getBoundingClientRect();
                    if (r.width === 0 || r.height === 0) continue;
                    if (el.closest(".sr-only,[aria-hidden='true']")) continue;
                    // background-clip:text gradients read as transparent; measured by eye + design review.
                    if (el.closest(".gradient-text")) continue;
                    let fg = toRGB(cs.color);
                    const bg = backdrop(el);
                    if (fg[3] < 1) fg = blend(fg, bg);
                    // walk opacity of ancestors
                    let op = 1;
                    for (let e = el; e && e !== document.body; e = e.parentElement)
                        op *= Number(getComputedStyle(e).opacity);
                    if (op < 0.99) fg = blend([fg[0], fg[1], fg[2], op], bg);
                    const size = parseFloat(cs.fontSize);
                    const bold = parseInt(cs.fontWeight) >= 700;
                    const large = size >= 24 || (size >= 18.66 && bold);
                    const need = large ? 3 : 4.5;
                    const cr = ratio(fg, bg);
                    if (cr < need) {
                        const path = [];
                        for (let e = el, i = 0; e && i < 4; e = e.parentElement, i++)
                            path.unshift(
                                e.tagName.toLowerCase() +
                                    (e.className && typeof e.className === "string"
                                        ? "." + e.className.split(" ").slice(0, 2).join(".")
                                        : ""),
                            );
                        out.push({
                            text: t.slice(0, 40),
                            ratio: +cr.toFixed(2),
                            need,
                            size,
                            fg: cs.color,
                            path: path.join(" > "),
                        });
                    }
                }
                return out;
            });
            for (const f of found) issues.push({ route, mode, accent, ...f });
        }
}
await browser.close();

const byKey = new Map();
for (const i of issues) {
    const k = `${i.route}|${i.path}|${i.text}`;
    if (!byKey.has(k)) byKey.set(k, { ...i, combos: [] });
    byKey.get(k).combos.push(`${i.mode}/${i.accent}`);
}
const rows = [...byKey.values()].sort((a, b) => a.ratio - b.ratio);
console.log(`${rows.length} unique low-contrast text nodes (${issues.length} across combos)\n`);
for (const r of rows)
    console.log(
        `${String(r.ratio).padStart(5)} <${r.need} ${r.route.padEnd(18)} ${r.combos.join(",").padEnd(40)} "${r.text}"  ${r.path}  fg=${r.fg}`,
    );
process.exit(rows.length ? 1 : 0);
