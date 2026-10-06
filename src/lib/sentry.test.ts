import { describe, expect, it } from "vitest";
import { SENTRY_DATA_COLLECTION, sentryServerOptions } from "./sentry";

describe("sentry data collection", () => {
    it("sets every personal-data category explicitly to off", () => {
        const c = SENTRY_DATA_COLLECTION;
        expect(c.userInfo).toBe(false);
        expect(c.cookies).toBe(false);
        expect(c.httpHeaders).toBe(false);
        expect(c.httpBodies).toEqual([]);
        expect(c.urlQueryParams).toBe(false);
        expect(c.stackFrameVariables).toBe(false);
        expect(c.databaseQueryData).toBe(false);
        expect(c.genAI).toEqual({ inputs: false, outputs: false });
    });

    it("passes dataCollection and disables tracing in init options", () => {
        const o = sentryServerOptions("https://k@o0.ingest.sentry.io/1");
        expect(o.dataCollection).toBe(SENTRY_DATA_COLLECTION);
        expect(o.tracesSampleRate).toBe(0);
    });
});
