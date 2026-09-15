import { getTranslations } from "next-intl/server";

export async function SkipLink() {
    const t = await getTranslations("nav");
    return (
        <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-pill focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-fg focus:shadow-glow-sm"
        >
            {t("skipToContent")}
        </a>
    );
}
