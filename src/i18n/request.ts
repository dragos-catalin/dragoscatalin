import * as rootParams from "next/root-params";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

// Uses next/root-params (Next 16.3) so [locale] routes stay statically
// prerenderable under cacheComponents — no setRequestLocale, no headers().
export default getRequestConfig(async ({ locale }) => {
    if (!locale) {
        const paramValue = await rootParams.locale();
        if (hasLocale(routing.locales, paramValue)) {
            locale = paramValue;
        } else {
            notFound();
        }
    }
    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
