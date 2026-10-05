import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ConsentSettingsButton } from "@/components/consent";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import pkg from "../../../package.json";

// Build time, so the shell stays statically prerenderable (cacheComponents trap b).
const BUILD_YEAR = new Date().getFullYear();

const LINK = "link-inline transition-colors hover:text-fg";

/** Minimal legal/utility footer shared by skin homes; each skin passes its own signature. */
export async function SkinFooter({
    className,
    children,
}: {
    className?: string;
    children?: ReactNode;
}) {
    const t = await getTranslations();
    return (
        <footer className={cn("border-t border-line", className)}>
            <div className="container-x flex flex-col gap-6 py-10 text-xs text-fg-subtle md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2">
                    {children}
                    <p>{t("footer.rights", { year: BUILD_YEAR })}</p>
                </div>
                <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    <li className="font-mono">{t("footer.version", { version: pkg.version })}</li>
                    <li>
                        <Link href="/projects" className={LINK}>
                            {t("nav.projects")}
                        </Link>
                    </li>
                    <li>
                        <Link href="/press" className={LINK}>
                            {t("nav.press")}
                        </Link>
                    </li>
                    <li>
                        <Link href="/privacy" className={LINK}>
                            {t("footer.privacy")}
                        </Link>
                    </li>
                    <li>
                        <ConsentSettingsButton
                            className={cn(LINK, "inline-flex min-h-6 items-center")}
                        />
                    </li>
                    <li>
                        <a href="/llms.txt" className={LINK}>
                            {t("footer.llms")}
                        </a>
                    </li>
                </ul>
            </div>
        </footer>
    );
}
