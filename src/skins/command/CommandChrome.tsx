import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { SkinBrand } from "@/skins/shared/SkinBrand";
import { SkinFooter } from "@/skins/shared/SkinFooter";
import { SkinNav } from "@/skins/shared/SkinNav";
import { SkinTools } from "@/skins/shared/SkinTools";

/** Command-center chrome: a status bar header and a terse footer. */
export async function CommandChrome({ children }: { children: ReactNode }) {
    const t = await getTranslations("skins.command");
    return (
        <div data-skin-home="command" className="cmd-root flex min-h-dvh flex-col text-fg">
            <header className="cmd-bar bg-surface">
                <div className="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
                    <SkinBrand />
                    <SkinNav
                        className="order-3 w-full md:order-none md:w-auto"
                        linkClassName="font-mono"
                    />
                    <SkinTools />
                </div>
            </header>
            <main id="main" className="relative flex-1">
                {children}
            </main>
            <SkinFooter className="bg-surface">
                <p className="font-mono text-fg-muted">
                    <span className="text-accent">$</span> {t("name").toLowerCase()} --help
                </p>
            </SkinFooter>
        </div>
    );
}
