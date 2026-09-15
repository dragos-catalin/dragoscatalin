#!/usr/bin/env node
/**
 * Guard for docs/tracker.csv + docs/TRACKER.md.
 *  - RFC 4180 CSV (quoted fields may contain commas, newlines and "" escapes)
 *  - exact header, 8 fields per row, unique ids, enum status/severity
 *  - every `done` row cites ≥1 existing path in `evidence` (";"-separated, `path#anchor` / `path:line` ok)
 *  - TRACKER.md exists and mentions every `area`
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const CSV = resolve(root, "docs/tracker.csv");
const MD = resolve(root, "docs/TRACKER.md");
const HEADER = ["id", "area", "title", "detail", "severity", "status", "evidence", "notes"];
const STATUS = new Set(["todo", "doing", "done", "blocked", "cancelled"]);
const SEVERITY = new Set(["high", "medium", "low"]);

export function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;
    const src = text.replace(/^\uFEFF/, "");
    for (let i = 0; i < src.length; i++) {
        const c = src[i];
        if (quoted) {
            if (c === '"') {
                if (src[i + 1] === '"') {
                    field += '"';
                    i++;
                } else quoted = false;
            } else field += c;
        } else if (c === '"') {
            quoted = true;
        } else if (c === ",") {
            row.push(field);
            field = "";
        } else if (c === "\n" || c === "\r") {
            if (c === "\r" && src[i + 1] === "\n") i++;
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
        } else field += c;
    }
    if (field !== "" || row.length) {
        row.push(field);
        rows.push(row);
    }
    return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

const failures = [];
const fail = (m) => failures.push(m);

if (!existsSync(CSV)) fail(`missing ${CSV}`);
if (!existsSync(MD)) fail(`missing ${MD}`);

if (existsSync(CSV)) {
    const rows = parseCsv(readFileSync(CSV, "utf8"));
    const header = rows[0] ?? [];
    if (header.join(",") !== HEADER.join(","))
        fail(`header must be exactly "${HEADER.join(",")}", got "${header.join(",")}"`);

    const ids = new Set();
    const areas = new Set();
    rows.slice(1).forEach((r, idx) => {
        const line = idx + 2;
        if (r.length !== HEADER.length) {
            fail(`line ${line}: expected 8 fields, got ${r.length} → ${JSON.stringify(r)}`);
            return;
        }
        const [id, area, title, , severity, status, evidence] = r;
        if (!id) fail(`line ${line}: empty id`);
        if (ids.has(id)) fail(`line ${line}: duplicate id ${id}`);
        ids.add(id);
        if (!area) fail(`line ${line}: empty area`);
        areas.add(area);
        if (!title) fail(`line ${line}: empty title`);
        if (!STATUS.has(status))
            fail(`${id}: invalid status "${status}" (${[...STATUS].join("|")})`);
        if (!SEVERITY.has(severity))
            fail(`${id}: invalid severity "${severity}" (${[...SEVERITY].join("|")})`);
        if (status === "done") {
            const paths = evidence
                .split(";")
                .map((s) => s.trim())
                .filter(Boolean);
            if (paths.length === 0) fail(`${id}: status done but evidence is empty`);
            for (const p of paths) {
                const clean = p.replace(/#.*$/, "").replace(/:\d+(-\d+)?$/, "");
                if (!existsSync(resolve(root, clean)))
                    fail(`${id}: evidence path does not exist: ${p}`);
            }
        }
    });

    if (existsSync(MD)) {
        const md = readFileSync(MD, "utf8");
        for (const a of areas) {
            const re = new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
            if (!re.test(md)) fail(`TRACKER.md does not mention area "${a}"`);
        }
    }
    if (!failures.length)
        console.log(
            `✔ check-tracker: ${rows.length - 1} rows, ${areas.size} areas, ids unique, evidence ok`,
        );
}

if (failures.length) {
    console.error(`✖ check-tracker: ${failures.length} problem(s)`);
    for (const f of failures) console.error(`   ${f}`);
    process.exit(1);
}
