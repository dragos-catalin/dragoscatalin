import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { SkinBrand } from "@/skins/shared/SkinBrand";
import { SkinFooter } from "@/skins/shared/SkinFooter";
import { SkinNav } from "@/skins/shared/SkinNav";
import { SkinTools } from "@/skins/shared/SkinTools";

/** Device-wall chrome: a surface bar header over the wall. */
export async function DevicesChrome({ children }: { children: ReactNode }) {
    const t = await getTranslations("skins.devices");
    return (
        <div data-skin-home="devices" className="dv-wall flex min-h-dvh flex-col">
            <header className="border-b border-line bg-surface">
                <div className="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
                    <SkinBrand />
                    <SkinNav className="order-3 w-full md:order-none md:w-auto" />
                    <SkinTools />
                </div>
            </header>
            <main id="main" className="relative flex-1">
                {children}
            </main>
            <SkinFooter className="bg-surface">
                <p className="text-fg-muted">{t("description")}</p>
            </SkinFooter>
        </div>
    );
}
