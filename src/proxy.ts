import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
    // Skip api, next internals, vercel, and any path with a file extension
    matcher: "/((?!api|_next|_vercel|monitoring|.*\\..*).*)",
};
