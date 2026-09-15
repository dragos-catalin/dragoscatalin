/**
 * Top padding for <main> so content clears the fixed floating pill header.
 * Lives in its own server-safe module: exporting a string from the
 * "use client" Header.tsx turns it into a client reference on the server
 * (it rendered as a function body in the className — found 2026-09-15).
 */
export const HEADER_OFFSET_CLASS = "pt-24 md:pt-28";
