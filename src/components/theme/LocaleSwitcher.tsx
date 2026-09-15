"use client";

import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Real anchor (progressive enhancement): works before hydration as a plain
 * link and as a soft navigation after. `replace` keeps history clean.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
    const t = useTranslations("locale");
    const locale = useLocale() as Locale;
    const pathname = usePathname();
    const next: Locale = locale === "en" ? "ro" : "en";

    return (
        <Link
            href={pathname}
            locale={next}
            replace
            aria-label={`${t("label")}: ${t(locale)} → ${t(next)}`}
            title={t(next)}
            className={cn(
                "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-pill px-2.5 font-mono text-xs font-medium tracking-wider text-fg-muted uppercase transition-colors hover:bg-accent-soft hover:text-fg",
                className,
            )}
        >
            <Languages className="size-4" aria-hidden />
            <span>{locale}</span>
        </Link>
    );
}
