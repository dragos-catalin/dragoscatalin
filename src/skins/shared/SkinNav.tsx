import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { SKIN_NAV } from "./nav";

/** Static primary nav for skin chrome (no aria-current: see ./nav.ts). */
export async function SkinNav({
    className,
    linkClassName,
}: {
    className?: string;
    linkClassName?: string;
}) {
    const t = await getTranslations("nav");
    return (
        <nav aria-label={t("menu")} className={className}>
            <ul className="flex flex-wrap items-center gap-x-1 gap-y-1">
                {SKIN_NAV.map((item) => (
                    <li key={item.key}>
                        <Link
                            href={item.href}
                            className={cn(
                                "inline-flex min-h-11 items-center rounded-pill px-3 text-sm font-medium text-fg-muted transition-colors hover:text-fg",
                                linkClassName,
                            )}
                        >
                            {t(item.key)}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
