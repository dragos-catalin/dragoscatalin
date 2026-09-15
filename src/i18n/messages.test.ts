import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import ro from "../../messages/ro.json";

function flatten(obj: unknown, prefix = ""): Record<string, string> {
    const out: Record<string, string> = {};
    if (obj === null || typeof obj !== "object") return out;
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (typeof v === "string") out[key] = v;
        else Object.assign(out, flatten(v, key));
    }
    return out;
}

/** Top-level ICU argument names: `{name}`, `{count, plural, …}`, `{date, date, short}`. */
function placeholders(msg: string): string[] {
    const names = new Set<string>();
    let depth = 0;
    let buf: string | null = null;
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
    return [...names].sort();
}

const flatEn = flatten(en);
const flatRo = flatten(ro);

describe("message catalogs", () => {
    it("en and ro have identical key sets", () => {
        const enKeys = Object.keys(flatEn).sort();
        const roKeys = Object.keys(flatRo).sort();
        const missingInRo = enKeys.filter((k) => !(k in flatRo));
        const missingInEn = roKeys.filter((k) => !(k in flatEn));
        expect(missingInRo, `keys missing in ro.json: ${missingInRo.join(", ")}`).toEqual([]);
        expect(missingInEn, `keys missing in en.json: ${missingInEn.join(", ")}`).toEqual([]);
    });

    it("has no empty strings", () => {
        const empty = [...Object.entries(flatEn), ...Object.entries(flatRo)]
            .filter(([, v]) => v.trim() === "")
            .map(([k]) => k);
        expect(empty).toEqual([]);
    });

    it("ICU placeholders match per key", () => {
        const mismatches: string[] = [];
        for (const key of Object.keys(flatEn)) {
            if (!(key in flatRo)) continue;
            const a = placeholders(flatEn[key]!);
            const b = placeholders(flatRo[key]!);
            if (a.join("|") !== b.join("|")) mismatches.push(`${key}: en{${a}} ro{${b}}`);
        }
        expect(mismatches, `placeholder mismatch:\n${mismatches.join("\n")}`).toEqual([]);
    });

    it("placeholder extractor handles plural and nested forms", () => {
        expect(
            placeholders("{count, plural, =0 {none} one {# item} other {# items}} on {date}"),
        ).toEqual(["count", "date"]);
        expect(placeholders("plain")).toEqual([]);
        expect(placeholders("Hi {name}!")).toEqual(["name"]);
    });
});
