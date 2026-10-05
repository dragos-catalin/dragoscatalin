import { Languages, Undo2 } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { ThemeMenu } from "@/components/theme/ThemeMenu";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { backToClassicHref } from "./nav";

const TOOL =
    "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-pill px-2.5 text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg";

/**
 * Right-hand tools of every skin header: appearance menu (incl. the Skin switch), a static
 * locale link (home → home; LocaleSwitcher reads usePathname, which a rewrite breaks) and a
 * "Back to classic" link that makes the proxy clear the cookie.
 */
export async function SkinTools({ className }: { className?: string }) {
    const locale = (await getLocale()) as Locale;
    const tl = await getTranslations("locale");
    const ts = await getTranslations("skins");
    const next: Locale = locale === "en" ? "ro" : "en";

    return (
        <div className={cn("flex items-center gap-1", className)}>
            <ThemeMenu />
            <Link
                href="/"
                locale={next}
                aria-label={`${tl("label")}: ${tl(locale)} → ${tl(next)}`}
                title={tl(next)}
                className={cn(TOOL, "font-mono text-xs font-medium tracking-wider uppercase")}
            >
                <Languages className="size-4" aria-hidden />
                <span>{locale}</span>
            </Link>
            <a
                href={backToClassicHref(locale)}
                data-skin-back
                className={cn(TOOL, "text-xs font-medium")}
            >
                <Undo2 className="size-4" aria-hidden />
                <span className="max-sm:sr-only">{ts("backToClassic")}</span>
            </a>
        </div>
    );
}
