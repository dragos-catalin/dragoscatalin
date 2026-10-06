import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const afterTasks: (() => Promise<void>)[] = [];
const isBot = vi.fn(() => false);

vi.mock("next/headers", () => ({
    headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7" }),
}));
vi.mock("next/server", () => ({ after: (fn: () => Promise<void>) => afterTasks.push(fn) }));
vi.mock("botid/server", () => ({ checkBotId: async () => ({ isBot: isBot() }) }));
vi.mock("@/lib/env", () => ({
    serverEnv: {
        BRIVIO_API_KEY: "brv_test",
        BRIVIO_API_URL: "https://api.example.test",
        CONTACT_FROM_EMAIL: "contact@dragoscatalin.ro",
        CONTACT_TO_EMAIL: "catalin@dragoscatalin.ro",
        CONTACT_HOOK_URL: "https://hook.example.test/hooks/contact",
        CONTACT_HOOK_SECRET: "0123456789abcdef0123",
    },
}));

const { contactAction } = await import("./contact");

function form(over: Record<string, string> = {}): FormData {
    const f = new FormData();
    const v = {
        name: "Ana Pop",
        email: "ana@example.com",
        message: "Salut, aș vrea să discutăm un proiect nou.",
        website: "",
        locale: "ro",
        ...over,
    };
    for (const [k, val] of Object.entries(v)) f.set(k, val);
    return f;
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
    afterTasks.length = 0;
    isBot.mockReturnValue(false);
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
});

describe("contactAction", () => {
    it("sends through Brivio, then posts a signed hook the homepi verifier accepts", async () => {
        fetchMock.mockResolvedValueOnce(new Response("{}", { status: 202 }));
        fetchMock.mockResolvedValueOnce(new Response(null, { status: 202 }));

        await expect(contactAction({ ok: false }, form())).resolves.toEqual({ ok: true });

        const [url, init] = fetchMock.mock.calls[0]!;
        expect(url).toBe("https://api.example.test/v1/email/send");
        const h = init!.headers as Record<string, string>;
        expect(h.authorization).toBe("Bearer brv_test");
        expect(h["idempotency-key"]).toMatch(/^[0-9a-f-]{36}$/);
        const body = JSON.parse(init!.body as string);
        expect(body).toMatchObject({
            from: "dragoscatalin.ro <contact@dragoscatalin.ro>",
            to: ["catalin@dragoscatalin.ro"],
            reply_to: "Ana Pop <ana@example.com>",
            category: "notification",
        });

        // The hook runs after the response.
        expect(fetchMock).toHaveBeenCalledTimes(1);
        await afterTasks[0]!();
        const [hookUrl, hookInit] = fetchMock.mock.calls[1]!;
        expect(hookUrl).toBe("https://hook.example.test/hooks/contact");
        const hh = hookInit!.headers as Record<string, string>;
        const raw = hookInit!.body as string;
        const expected = createHmac("sha256", "0123456789abcdef0123")
            .update(`${hh["x-dc-timestamp"]}.${raw}`)
            .digest("hex");
        expect(hh["x-dc-signature"]).toBe(expected);
        expect(JSON.parse(raw)).toMatchObject({ name: "Ana Pop", locale: "ro" });
    });

    it("does not notify the phone when Brivio refuses the message", async () => {
        fetchMock.mockResolvedValueOnce(new Response("{}", { status: 422 }));
        await expect(contactAction({ ok: false }, form())).resolves.toEqual({
            ok: false,
            code: "error",
        });
        expect(afterTasks).toHaveLength(0);
    });

    it("refuses a BotID-flagged request without calling Brivio", async () => {
        isBot.mockReturnValue(true);
        const res = await contactAction({ ok: false }, form({ email: "b@example.com" }));
        expect(res).toEqual({ ok: false, code: "error" });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("pretends success when the honeypot is filled", async () => {
        await expect(contactAction({ ok: false }, form({ website: "x" }))).resolves.toEqual({
            ok: true,
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("strips header-breaking characters from the name in reply_to and subject", async () => {
        fetchMock.mockResolvedValueOnce(new Response("{}", { status: 202 }));
        await contactAction({ ok: false }, form({ name: 'Eve "<x>"\r\nBcc' }));
        const body = JSON.parse(fetchMock.mock.calls[0]![1]!.body as string);
        expect(body.reply_to).toBe("Eve xBcc <ana@example.com>");
        expect(body.subject).not.toMatch(/[\r\n]/);
    });
});
