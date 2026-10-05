import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { SkinBrand } from "@/skins/shared/SkinBrand";
import { SkinFooter } from "@/skins/shared/SkinFooter";
import { SkinNav } from "@/skins/shared/SkinNav";
import { SkinTools } from "@/skins/shared/SkinTools";

/** Night-sky chrome: transparent header over the poster, footer on the same sky. */
export async function ConstellationChrome({ children }: { children: ReactNode }) {
    const t = await getTranslations("skins.constellation");
    return (
        <div data-skin-home="constellation" className="cs-sky flex min-h-dvh flex-col">
            <header className="relative z-20">
                <div className="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5">
                    <SkinBrand />
                    <SkinNav className="order-3 w-full md:order-none md:w-auto" />
                    <SkinTools />
                </div>
            </header>
            <main id="main" className="relative flex-1">
                {children}
            </main>
            <SkinFooter className="bg-transparent">
                <p className="font-mono text-fg-muted">{t("name")}</p>
            </SkinFooter>
        </div>
    );
}
