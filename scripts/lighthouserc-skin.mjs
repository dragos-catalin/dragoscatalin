#!/usr/bin/env node
/**
 * Derive a per-skin Lighthouse CI config from lighthouserc.json (V3-03).
 *   node scripts/lighthouserc-skin.mjs <skin>   → prints the path of the written config
 * classic = lighthouserc.json unchanged. Any other skin: home + /projects with the same
 * assertions and `settings.extraHeaders` = Cookie dc-skin=<skin> (lhci wants a JSON string).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SKINS = ["classic", "editorial", "constellation", "command", "devices"];
const skin = process.argv[2] ?? "classic";
if (!SKINS.includes(skin)) {
    console.error(`unknown skin "${skin}" (${SKINS.join(", ")})`);
    process.exit(2);
}
if (skin === "classic") {
    console.log("./lighthouserc.json");
    process.exit(0);
}

const rc = JSON.parse(readFileSync("lighthouserc.json", "utf8"));
const origin = new URL(rc.ci.collect.url[0]).origin;
rc.ci.collect.url = [`${origin}/`, `${origin}/projects`];
rc.ci.collect.settings = {
    ...rc.ci.collect.settings,
    extraHeaders: JSON.stringify({ Cookie: `dc-skin=${skin}` }),
};
mkdirSync(".lighthouseci", { recursive: true });
const out = `./.lighthouseci/lighthouserc.${skin}.json`;
writeFileSync(out, JSON.stringify(rc, null, 2));
console.log(out);
