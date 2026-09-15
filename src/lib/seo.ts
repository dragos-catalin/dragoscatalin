import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { site } from "./site";

/** Absolute URL for a path in a given locale (as-needed prefix). */
export function localeUrl(locale: string, path: string): string {
    const clean = path === "/" ? "" : path.replace(/\/$/, "");
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    return `${site.url}${prefix}${clean || "/"}`.replace(/([^:])\/\/+/g, "$1/");
}

/** Reciprocal hreflang alternates for a path. */
export function localeAlternates(
    locale: string,
    path: string,
): NonNullable<Metadata["alternates"]> {
    const languages: Record<string, string> = {};
    for (const l of routing.locales) languages[l] = localeUrl(l, path);
    languages["x-default"] = localeUrl(routing.defaultLocale, path);
    return { canonical: localeUrl(locale, path), languages };
}

export function ogImageUrl(locale: string, path: string): string {
    return `${localeUrl(locale, path).replace(/\/$/, "")}/opengraph-image`;
}
