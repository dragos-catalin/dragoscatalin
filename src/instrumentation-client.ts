import { initBotId } from "botid/client/core";

/**
 * Vercel BotID for the contact Server Action. A Server Action POSTs to the page
 * URL it is rendered on; the contact section lives on the home of every skin
 * (skins are cookie rewrites, the URL stays `/` or `/ro`).
 */
initBotId({
    protect: [
        { path: "/", method: "POST" },
        { path: "/ro", method: "POST" },
    ],
});
