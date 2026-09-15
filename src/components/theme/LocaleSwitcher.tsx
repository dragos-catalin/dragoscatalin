"use client";

import { startTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
    const t = useTranslations("locale");
    const locale = useLocale() as Locale;
    const router = useRouter();
    const pathname = usePathname();
    const next: Locale = locale === "en" ? "ro" : "en";

    const toggle = () => {
        startTransition(() => {
            router.replace(pathname, { locale: next });
        });
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={`${t("label")}: ${t(locale)} → ${t(next)}`}
            title={t(next)}
            className={cn(
                "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-pill px-2.5 font-mono text-xs font-medium tracking-wider text-fg-muted uppercase transition-colors hover:bg-accent-soft hover:text-fg",
                className,
            )}
        >
            <Languages className="size-4" aria-hidden />
            <span>{locale}</span>
        </button>
    );
}
