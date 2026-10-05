import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { SkinBrand } from "@/skins/shared/SkinBrand";
import { SkinFooter } from "@/skins/shared/SkinFooter";
import { SkinNav } from "@/skins/shared/SkinNav";
import { SkinTools } from "@/skins/shared/SkinTools";

// Build time, like the footer year (cacheComponents: no new Date() in render).
const EDITION_YEAR = new Date().getFullYear();

/** Masthead + footer of the editorial skin. Static nav (rewritten route, no usePathname). */
export async function EditorialChrome({ children }: { children: ReactNode }) {
    const t = await getTranslations("skins.editorial");
    return (
        <div data-skin-home="editorial" className="flex min-h-dvh flex-col bg-bg">
            <header className="ed-masthead">
                <div className="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
                    <SkinBrand />
                    <SkinNav className="order-3 w-full md:order-none md:w-auto" />
                    <SkinTools />
                </div>
                <div className="ed-rule">
                    <p className="container-x py-2 font-mono text-[11px] tracking-[0.2em] text-fg-muted uppercase">
                        {t("issue")} · {EDITION_YEAR}
                    </p>
                </div>
            </header>
            <main id="main" className="relative flex-1">
                {children}
            </main>
            <SkinFooter>
                <p className="font-display text-base font-bold text-fg">{t("name")}</p>
            </SkinFooter>
        </div>
    );
}
