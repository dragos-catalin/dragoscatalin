import { defineConfig, devices } from "@playwright/test";

const PORT = 24789;
const baseURL = process.env.PW_BASE_URL ?? `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);

// Every spec except consent.spec.ts starts with a stored "reject" choice so the
// banner never overlays click targets; consent.spec.ts tests the real first visit.
const consentState = {
    cookies: [
        {
            name: "dc-consent",
            value: encodeURIComponent(JSON.stringify({ v: 1, at: Date.now(), analytics: false })),
            domain: new URL(baseURL).hostname,
            path: "/",
            expires: -1,
            httpOnly: false,
            secure: false,
            sameSite: "Lax" as const,
        },
    ],
    origins: [],
};

export default defineConfig({
    testDir: "./e2e",
    timeout: 60_000,
    expect: { timeout: 10_000 },
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 2 : undefined,
    reporter: [["list"], ["html", { open: "never" }]],
    use: {
        baseURL,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        locale: "en-US",
    },
    projects: [
        {
            name: "chromium",
            testIgnore: /consent\.spec/,
            use: { ...devices["Desktop Chrome"], storageState: consentState },
        },
        {
            name: "mobile",
            testIgnore: /consent\.spec/,
            use: { ...devices["Pixel 7"], storageState: consentState },
        },
        { name: "consent", testMatch: /consent\.spec/, use: { ...devices["Desktop Chrome"] } },
    ],
    // Locally we reuse the dev server already running on :24789.
    webServer: isCI
        ? {
              command: "pnpm build && pnpm start",
              port: PORT,
              reuseExistingServer: true,
              timeout: 300_000,
          }
        : undefined,
});
