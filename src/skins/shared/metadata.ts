import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo";

/**
 * Every skin home IS the home page: same title/description as classic and canonical `/` or
 * `/ro`, so search engines never see `/skin/<id>` (also absent from sitemap.ts and llms.txt).
 */
export async function skinHomeMetadata(params: Promise<{ locale: string }>): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "meta" });
    return {
        title: { absolute: t("title") },
        description: t("description"),
        alternates: localeAlternates(locale, "/"),
    };
}
