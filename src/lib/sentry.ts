import type { NodeOptions } from "@sentry/nextjs";

type DataCollection = NonNullable<NodeOptions["dataCollection"]>;

/**
 * Sentry 11 collects every category by default when `dataCollection` is unset
 * (user info, cookies, headers, bodies, query strings, local variables) — a
 * GDPR problem for a site that promises "no tracking without consent" on
 * /privacy. Errors are captured server-side only, with nothing personal.
 */
export const SENTRY_DATA_COLLECTION: Required<DataCollection> = {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
    graphQL: { document: false, variables: false },
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    queues: false,
    stackFrameVariables: false,
    frameContextLines: 5,
};

export function sentryServerOptions(dsn: string) {
    return {
        dsn,
        dataCollection: SENTRY_DATA_COLLECTION,
        tracesSampleRate: 0,
        environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    };
}
