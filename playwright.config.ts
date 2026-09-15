import { defineConfig, devices } from "@playwright/test";

const PORT = 24789;
const baseURL = process.env.PW_BASE_URL ?? `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);

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
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        { name: "mobile", use: { ...devices["Pixel 7"] } },
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
