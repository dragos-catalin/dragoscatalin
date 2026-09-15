<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# dragoscatalin.ro — agent entry point

Portfolio-only site. Read, in order:

1. [`.github/copilot-instructions.md`](.github/copilot-instructions.md) — stack,
   commands, hard rules, known traps, verification.
2. [`docs/TRACKER.md`](docs/TRACKER.md) + [`docs/tracker.csv`](docs/tracker.csv)
   — canonical status; update both in the same commit as a feature.
3. [`docs/DESIGN.md`](docs/DESIGN.md) — art direction contract.
4. [`docs/CI.md`](docs/CI.md) — husky gates, `pnpm ci:local`, Actions.

Path-scoped rules: [`.github/instructions/`](.github/instructions/)
(`theme-tokens`, `i18n`, `seo-aeo`). Recipes: [`.github/skills/`](.github/skills/)
— `add-project`, `theme-surface`, `release`.
