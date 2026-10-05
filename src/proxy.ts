import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing, type Locale } from "./i18n/routing";
import { DEFAULT_SKIN, SKIN_COOKIE, SKIN_COOKIE_MAX_AGE, isSkin } from "./lib/theme";

const intl = createMiddleware(routing);

/** Internal skin homes (`src/app/[locale]/skin/<id>`) are only reachable through the rewrite. */
const SKIN_PATH = /^\/(?:([a-z]{2})\/)?skin(?:\/|$)/;
/** Matches no route inside `[locale]` → the same 404 page as any unknown URL. */
const NOT_FOUND_SEGMENT = "skin-not-found";

/** `/` → en, `/ro` → ro (as-needed prefix); anything else is not a home. */
function homeLocale(pathname: string): Locale | null {
    const p = pathname.replace(/\/+$/, "") || "/";
    if (p === "/") return routing.defaultLocale;
    for (const l of routing.locales) if (l !== routing.defaultLocale && p === `/${l}`) return l;
    return null;
}

export default function proxy(req: NextRequest): NextResponse {
    const { pathname, searchParams } = req.nextUrl;

    // (1) Direct hits on the internal skin routes are 404 (canonical home is `/` or `/ro`).
    const direct = SKIN_PATH.exec(pathname);
    if (direct) {
        const prefix = direct[1];
        const locale = routing.locales.find((l) => l === prefix) ?? routing.defaultLocale;
        return NextResponse.rewrite(new URL(`/${locale}/${NOT_FOUND_SEGMENT}`, req.url));
    }

    // (2) `?skin=<id>` previews a skin on production: set (or clear) the cookie, drop the param.
    if (searchParams.has("skin")) {
        const wanted = searchParams.get("skin");
        const clean = req.nextUrl.clone();
        clean.searchParams.delete("skin");
        const res = NextResponse.redirect(clean, 307);
        if (isSkin(wanted) && wanted !== DEFAULT_SKIN) {
            res.cookies.set(SKIN_COOKIE, wanted, {
                path: "/",
                maxAge: SKIN_COOKIE_MAX_AGE,
                sameSite: "lax",
                secure: req.nextUrl.protocol === "https:",
            });
        } else {
            res.cookies.set(SKIN_COOKIE, "", { path: "/", maxAge: 0, sameSite: "lax" });
        }
        return res;
    }

    // (3) Locale routing, unchanged.
    const res = intl(req);
    if (res.headers.has("location")) return res;

    // (4) Home with a non-classic skin cookie → that skin's static home.
    const locale = homeLocale(pathname);
    const skin = req.cookies.get(SKIN_COOKIE)?.value;
    if (!locale || !isSkin(skin) || skin === DEFAULT_SKIN) return res;

    const headers = new Headers(req.headers);
    headers.set("X-NEXT-INTL-LOCALE", locale);
    const rewritten = NextResponse.rewrite(new URL(`/${locale}/skin/${skin}`, req.url), {
        request: { headers },
    });
    const link = res.headers.get("link");
    if (link) rewritten.headers.set("link", link);
    for (const c of res.headers.getSetCookie()) rewritten.headers.append("set-cookie", c);
    return rewritten;
}

export const config = {
    // Skip api, next internals, vercel, and any path with a file extension
    matcher: "/((?!api|_next|_vercel|monitoring|.*\\..*).*)",
};
