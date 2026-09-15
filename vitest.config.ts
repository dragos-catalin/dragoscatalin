import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));
const alias = { "@": src };
const exclude = ["**/node_modules/**", "**/.next/**", "e2e/**", "scripts/**", "**/.copilot-tmp/**"];

export default defineConfig({
    plugins: [react()],
    resolve: { alias },
    test: {
        globals: true,
        exclude,
        coverage: {
            provider: "v8",
            reportsDirectory: "./coverage",
            include: ["src/lib/**", "src/data/**", "src/i18n/**"],
            // Next-runtime-only modules (request-scoped i18n, OG image renderer, env schema, motion presets)
            exclude: [
                "**/*.test.*",
                "src/lib/og.tsx",
                "src/lib/env.ts",
                "src/lib/motion.ts",
                "src/i18n/request.ts",
                "src/i18n/navigation.ts",
            ],
            thresholds: { statements: 60, lines: 60 },
        },
        projects: [
            {
                extends: true,
                test: {
                    name: "node",
                    environment: "node",
                    include: ["src/**/*.test.ts"],
                },
            },
            {
                extends: true,
                test: {
                    name: "jsdom",
                    environment: "jsdom",
                    include: ["src/**/*.test.tsx"],
                    setupFiles: ["./src/test/setup.ts"],
                },
            },
        ],
    },
});
