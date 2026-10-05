// Layout sanity: horizontal overflow, elements poking outside the viewport,
// section inner width vs container, empty sections, tap targets < 24px, and
// text truncated by overflow:hidden. Run against dev/prod at several widths.
//   node scripts/layout-scan.mjs [baseUrl]
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
    "/feedbrake",
    "/feedbrake/privacy",
    "/ro",
];
const widths = [360, 390, 768, 1024, 1440, 1920, 2560, 3440];
// V3-03: every non-classic skin (cookie dc-skin) re-scans its home and a shared content page.
const skins = ["editorial", "constellation", "command", "devices"];
const skinRoutes = ["/", "/ro", "/projects"];
const jobs = [
    ...routes.map((route) => ({ skin: "classic", route })),
    ...skins.flatMap((skin) => skinRoutes.map((route) => ({ skin, route }))),
];

const b = await chromium.launch();
const problems = [];
for (const w of widths) {
    const page = await b.newPage({ viewport: { width: w, height: 900 } });
    for (const { skin, route: path } of jobs) {
        await page.context().clearCookies({ name: "dc-skin" });
        if (skin !== "classic")
            await page.context().addCookies([{ name: "dc-skin", value: skin, url: base }]);
        const route = skin === "classic" ? path : `${path} [${skin}]`;
        // Repeat visits leave Next segment prefetches pending → "networkidle" never fires
        // (also on the pre-skins build); wait for load + bounded idle instead.
        await page.goto(base + path, { waitUntil: "load" });
        await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
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
            const out = [];
            const vw = document.documentElement.clientWidth;
            const cls = (e) => (typeof e.className === "string" ? e.className : "");
            const skip = (e) =>
                Boolean(e.closest(".sr-only, [aria-hidden='true']")) ||
                /sr-only|-left-\[9999px\]/.test(cls(e));
            const label = (e) =>
                e.tagName.toLowerCase() +
                (e.id ? "#" + e.id : "") +
                (cls(e) ? "." + cls(e).split(" ").slice(0, 2).join(".") : "");

            if (document.documentElement.scrollWidth > vw + 1)
                out.push({
                    kind: "page-overflow",
                    detail: "scrollWidth " + document.documentElement.scrollWidth + " > " + vw,
                });

            for (const e of document.querySelectorAll("main *, header *, footer *")) {
                const cs = getComputedStyle(e);
                if (cs.position === "fixed" || cs.display === "none" || skip(e)) continue;
                const r = e.getBoundingClientRect();
                if (r.width === 0) continue;
                if (r.right > vw + 1 || r.left < -1) {
                    let clipped = false;
                    for (let p = e.parentElement; p; p = p.parentElement)
                        if (getComputedStyle(p).overflow !== "visible") {
                            clipped = true;
                            break;
                        }
                    if (!clipped)
                        out.push({
                            kind: "h-overflow",
                            detail:
                                label(e) +
                                " left=" +
                                Math.round(r.left) +
                                " right=" +
                                Math.round(r.right),
                        });
                }
            }

            const lefts = [
                ...new Set(
                    [...document.querySelectorAll("main .container-x")].map((c) =>
                        Math.round(c.getBoundingClientRect().left),
                    ),
                ),
            ];
            if (lefts.length > 1)
                out.push({ kind: "container-misaligned", detail: "left edges " + lefts.join(",") });

            for (const s of document.querySelectorAll("main section")) {
                const r = s.getBoundingClientRect();
                if (r.height < 40)
                    out.push({
                        kind: "section-tiny",
                        detail: label(s) + " h=" + Math.round(r.height),
                    });
                if (!s.textContent.trim()) out.push({ kind: "section-empty", detail: label(s) });
            }

            for (const e of document.querySelectorAll(
                "a, button, [role=button], input, select, textarea",
            )) {
                const r = e.getBoundingClientRect();
                const cs = getComputedStyle(e);
                if (r.width === 0 || cs.visibility === "hidden" || skip(e)) continue;
                if (r.width < 24 || r.height < 24)
                    out.push({
                        kind: "small-target",
                        detail:
                            label(e) +
                            " " +
                            Math.round(r.width) +
                            "x" +
                            Math.round(r.height) +
                            ' "' +
                            (e.textContent || e.getAttribute("aria-label") || "")
                                .trim()
                                .slice(0, 30) +
                            '"',
                    });
            }

            for (const e of document.querySelectorAll("main *")) {
                if (skip(e)) continue;
                const cs = getComputedStyle(e);
                if (
                    cs.overflow === "hidden" &&
                    cs.whiteSpace === "nowrap" &&
                    cs.textOverflow !== "ellipsis" &&
                    e.scrollWidth > e.clientWidth + 2 &&
                    e.children.length === 0
                )
                    out.push({
                        kind: "clipped-text",
                        detail: label(e) + ' "' + e.textContent.trim().slice(0, 30) + '"',
                    });
            }

            if (vw <= 420)
                for (const e of document.querySelectorAll("main h1, main h2, main p")) {
                    const r = e.getBoundingClientRect();
                    if (r.width && (r.left < 8 || r.right > vw - 8))
                        out.push({
                            kind: "edge-text",
                            detail:
                                label(e) +
                                " left=" +
                                Math.round(r.left) +
                                " right=" +
                                Math.round(r.right),
                        });
                }
            return out;
        });
        for (const f of found) problems.push({ w, route, ...f });
    }
    await page.close();
}
await b.close();

const norm = (d) => d.replace(/\d+x\d+|left=-?\d+|right=-?\d+|h=\d+/g, "");
const grouped = new Map();
for (const p of problems) {
    const k = p.kind + "|" + p.route + "|" + norm(p.detail);
    if (!grouped.has(k)) grouped.set(k, { ...p, widths: new Set() });
    grouped.get(k).widths.add(p.w);
}
const rows = [...grouped.values()].sort(
    (a, b) => a.kind.localeCompare(b.kind) || a.route.localeCompare(b.route),
);
console.log(rows.length + " layout findings\n");
for (const r of rows)
    console.log(
        r.kind.padEnd(20) +
            " " +
            r.route.padEnd(16) +
            " @" +
            [...r.widths].join(",").padEnd(36) +
            " " +
            r.detail,
    );
process.exit(rows.length ? 1 : 0);
