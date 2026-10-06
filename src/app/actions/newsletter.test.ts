import { beforeEach, describe, expect, it, vi } from "vitest";

const isBot = vi.fn(() => false);

vi.mock("next/headers", () => ({
    headers: async () =>
        new Headers({ "x-forwarded-for": "203.0.113.9", "user-agent": "Vitest/5" }),
}));
vi.mock("next-intl/server", () => ({
    getTranslations: async () => (key: string) => `t:${key}`,
}));
vi.mock("botid/server", () => ({ checkBotId: async () => ({ isBot: isBot() }) }));
vi.mock("@/lib/env", () => ({
    serverEnv: { BRIVIO_API_KEY: "brv_test", BRIVIO_API_URL: "https://api.example.test" },
}));

const { subscribeAction } = await import("./newsletter");
const { NEWSLETTER_CONSENT_VERSION } = await import("@/lib/newsletter");

function form(over: Record<string, string | null> = {}): FormData {
    const f = new FormData();
    const v: Record<string, string | null> = {
        email: "Ana@Example.com",
        consent: "on",
        company: "",
        locale: "ro",
        ...over,
    };
    for (const [k, val] of Object.entries(v)) if (val !== null) f.set(k, val);
    return f;
}

const fetchMock = vi.fn<typeof fetch>();
const ok = (status: string, code = 201) =>
    new Response(JSON.stringify({ data: { status }, error: null }), { status: code });

beforeEach(() => {
    isBot.mockReturnValue(false);
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
});

describe("subscribeAction", () => {
    it("creates a pending Brivio subscriber with consent evidence and a localized redirect", async () => {
        fetchMock.mockResolvedValueOnce(ok("pending"));
        await expect(subscribeAction({ ok: false }, form())).resolves.toEqual({
            ok: true,
            status: "pending",
        });
        const [url, init] = fetchMock.mock.calls[0]!;
        expect(url).toBe("https://api.example.test/v1/marketing/subscribers");
        const h = init!.headers as Record<string, string>;
        expect(h.authorization).toBe("Bearer brv_test");
        expect(h["idempotency-key"]).toMatch(/^[0-9a-f-]{36}$/);
        const body = JSON.parse(init!.body as string);
        expect(body).toMatchObject({
            email: "ana@example.com",
            locale: "ro",
            source: "dragoscatalin.ro/newsletter",
            consent: {
                text_version: NEWSLETTER_CONSENT_VERSION,
                text: "t:consent",
                ip: "203.0.113.9",
                user_agent: "Vitest/5",
            },
        });
        expect(body.redirect_url).toMatch(/^https:\/\/.+\/ro\/newsletter\/confirmed$/);
    });

    it("reports an address that already confirmed", async () => {
        fetchMock.mockResolvedValueOnce(ok("subscribed", 200));
        await expect(subscribeAction({ ok: false }, form({ locale: "en" }))).resolves.toEqual({
            ok: true,
            status: "subscribed",
        });
        const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
        expect(body.redirect_url).toMatch(/^https:\/\/[^/]+\/newsletter\/confirmed$/);
    });

    it("refuses without the consent checkbox and never calls Brivio", async () => {
        await expect(subscribeAction({ ok: false }, form({ consent: null }))).resolves.toEqual({
            ok: false,
            code: "invalid",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("pretends success when the honeypot is filled", async () => {
        await expect(
            subscribeAction({ ok: false }, form({ company: "ACME" })),
        ).resolves.toMatchObject({ ok: true });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("refuses a BotID-flagged request", async () => {
        isBot.mockReturnValue(true);
        await expect(subscribeAction({ ok: false }, form())).resolves.toEqual({
            ok: false,
            code: "error",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("maps Brivio 429 to a rate message and 5xx to a generic error", async () => {
        fetchMock.mockResolvedValueOnce(new Response("{}", { status: 429 }));
        await expect(subscribeAction({ ok: false }, form())).resolves.toEqual({
            ok: false,
            code: "rate",
        });
        fetchMock.mockResolvedValueOnce(new Response("{}", { status: 503 }));
        await expect(subscribeAction({ ok: false }, form())).resolves.toEqual({
            ok: false,
            code: "error",
        });
    });
});
