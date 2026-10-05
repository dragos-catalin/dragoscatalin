import { routing } from "@/i18n/routing";
import { SKIN_COOKIE } from "@/lib/theme";

/**
 * Skin chrome nav. Static on purpose: skin homes are served through a proxy rewrite, so
 * usePathname() would read `/skin/<id>` on the client and mismatch the prerendered HTML
 * (node_modules/next/dist/docs/.../use-pathname.md § rewrites). No aria-current here.
 */
export const SKIN_NAV = [
    { key: "projects", href: "/projects" },
    { key: "services", href: "/services" },
    { key: "about", href: "/about" },
    { key: "contact", href: "/#contact" },
] as const;

/** Full-page link that makes the proxy clear `dc-skin` and land on the classic home. */
export function backToClassicHref(locale: string): string {
    const prefix = locale === routing.defaultLocale ? "/" : `/${locale}`;
    return `${prefix}?skin=classic`;
}

export { SKIN_COOKIE };
