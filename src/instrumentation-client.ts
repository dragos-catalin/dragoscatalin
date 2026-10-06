import { initBotId } from "botid/client/core";

/**
 * Vercel BotID for the contact and newsletter Server Actions. A Server Action
 * POSTs to the page URL it is rendered on; the contact section lives on the
 * home of every skin (skins are cookie rewrites, the URL stays `/` or `/ro`),
 * the newsletter form on `/newsletter`.
 */
initBotId({
    protect: [
        { path: "/", method: "POST" },
        { path: "/ro", method: "POST" },
        { path: "/newsletter", method: "POST" },
        { path: "/ro/newsletter", method: "POST" },
    ],
});
