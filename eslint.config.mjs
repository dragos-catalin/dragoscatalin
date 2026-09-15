import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
    globalIgnores([
        ".next/**",
        "out/**",
        "coverage/**",
        "next-env.d.ts",
        ".copilot-tmp/**",
        "playwright-report/**",
        "test-results/**",
        ".vitest/**",
    ]),
    ...nextVitals,
    ...nextTs,
    // eslint-plugin-react 7.x auto-detection calls context.getFilename(), removed in ESLint 10.
    { settings: { react: { version: "19.3" } } },
    // eslint-config-next already registers the jsx-a11y plugin; only add its recommended rules.
    { files: ["src/**/*.{ts,tsx}"], rules: jsxA11y.flatConfigs.recommended.rules },
    {
        files: ["src/**/*.{ts,tsx}"],
        // eslint-plugin-react 7.x calls context.getFilename() (removed in ESLint 10) during
        // version detection; an explicit version skips detection entirely.
        settings: { react: { version: "19.3" } },
        rules: {
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { fixStyle: "inline-type-imports" },
            ],
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            "no-console": ["warn", { allow: ["warn", "error"] }],
            // Design contract: semantic tokens only. Raw palette classes are banned in src/.
            "no-restricted-syntax": [
                "error",
                {
                    selector:
                        "Literal[value=/\\b(bg|text|border|from|via|to|ring|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\\b/]",
                    message:
                        "Raw Tailwind palette class. Use semantic tokens (bg-surface, text-fg, text-accent, border-line…) from globals.css.",
                },
            ],
        },
    },
    {
        files: ["scripts/**/*.mjs", "*.config.{mjs,ts}"],
        rules: { "no-console": "off" },
    },
    {
        // Bundle budget: zod (91 KB gz) and server env must never reach the browser.
        // Lighthouse mobile 2026-09-15: a single `clientEnv` import cost ~1 s of LCP.
        files: ["src/components/**/*.tsx", "src/app/**/*.tsx"],
        ignores: ["src/app/**/page.tsx", "src/app/**/layout.tsx", "src/app/**/route.ts"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    paths: [
                        {
                            name: "zod",
                            message:
                                "zod is server-only. Validate in a Server Action / route and pass results down; client env comes from @/lib/env.client.",
                        },
                        {
                            name: "@/lib/env",
                            message: "Use @/lib/env.client in components (no zod in the browser).",
                        },
                    ],
                },
            ],
        },
    },
    prettier,
]);
