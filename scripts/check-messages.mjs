#!/usr/bin/env node
/** Standalone key-parity + ICU placeholder parity check for messages/*.json. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (f) => JSON.parse(readFileSync(resolve(root, "messages", f), "utf8"));

function flatten(obj, prefix = "", out = {}) {
    for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (typeof v === "string") out[key] = v;
        else if (v && typeof v === "object") flatten(v, key, out);
        else out[key] = String(v);
    }
    return out;
}

/** Top-level ICU argument names. */
function placeholders(msg) {
    const names = new Set();
    let depth = 0;
    let buf = null;
    for (const ch of msg) {
        if (ch === "{") {
            depth++;
            if (depth === 1) buf = "";
        } else if (ch === "}") {
            if (depth === 1 && buf !== null && buf.trim()) names.add(buf.trim());
            if (depth === 1) buf = null;
            depth--;
        } else if (depth === 1 && buf !== null) {
            if (ch === ",") {
                if (buf.trim()) names.add(buf.trim());
                buf = null;
            } else buf += ch;
        }
    }
    return [...names].sort().join("|");
}

const en = flatten(read("en.json"));
const ro = flatten(read("ro.json"));
const failures = [];

for (const k of Object.keys(en)) if (!(k in ro)) failures.push(`missing in ro.json: ${k}`);
for (const k of Object.keys(ro)) if (!(k in en)) failures.push(`missing in en.json: ${k}`);
for (const [k, v] of Object.entries(en))
    if (v.trim() === "") failures.push(`empty in en.json: ${k}`);
for (const [k, v] of Object.entries(ro))
    if (v.trim() === "") failures.push(`empty in ro.json: ${k}`);
for (const k of Object.keys(en)) {
    if (!(k in ro)) continue;
    const a = placeholders(en[k]);
    const b = placeholders(ro[k]);
    if (a !== b) failures.push(`placeholder mismatch ${k}: en{${a}} ro{${b}}`);
}

if (failures.length) {
    console.error(`✖ check-messages: ${failures.length} problem(s)`);
    for (const f of failures) console.error(`   ${f}`);
    process.exit(1);
}
console.log(`✔ check-messages: ${Object.keys(en).length} keys, en ≡ ro, placeholders match`);
