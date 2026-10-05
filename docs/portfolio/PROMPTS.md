# Per-repo prompts (phase 5)

One ready-to-paste prompt per product row the owner kept on 2026-10-05. Each prompt is for a fresh chat opened in that repo, because other sessions are active in brivio, codai and watch-faces. The row ids match `portfolio.csv`. When a chat finishes, it sets the row to `done` here and in its own repo tracker.

Shared constraints, already in every prompt:

- shared clone, so commit only via `agentq commit -Paths`, with `-ExpectRepo <repo>`;
- deploy only from a clean tree via `deploy-clean.ps1`;
- every locale;
- say what is VERIFIED and what is EXPECTED.

## watch-faces — G-16 + C-04 (Horae), then C-01, D-19

```text
Repo E:\gh\watch-faces. Goal: start Horae revenue before mid-October: Play uploads + in-app purchases for the ~200 built faces (G-16), then the Horae+ bundle (C-04).
Context: E:\gh\dragoscatalin\docs\portfolio\portfolio.csv rows G-16, C-04, C-01, D-19; read the repo AGENTS.md and tracker first.
Done means: (1) upload pipeline produces signed AABs per face and pushes to an internal track; (2) Play Billing IAP + entitlement check work on a real watch (VERIFIED on device); (3) Horae+ bundle SKU unlocks all faces; (4) store listing + "what's new" per locale; (5) tracker rows updated with evidence.
After: C-01 Home Assistant on the wrist, D-19 wff-dsl (Kotlin DSL for Watch Face Format, OSS) as separate goals.
Constraints: other sessions work here, agentq commit -ExpectRepo E:\gh\watch-faces, never deploy from a dirty tree.
```

## marcai — G-17

```text
Repo E:\gh\marcai. Goal: marcai charges money: Stripe entitlements + a real data source (G-17).
Context: E:\gh\dragoscatalin\docs\portfolio\portfolio.csv row G-17; repo AGENTS.md; load skills stripe-best-practices and brivio-integration (payments/email via Brivio where it fits).
Done means: (1) Checkout Session + webhook -> entitlement row, idempotent; (2) gated features check the entitlement server-side; (3) the data source is live (no fixtures in prod); (4) e2e test of buy -> unlock; (5) tracker row done with evidence.
Constraints: agentq commit -ExpectRepo E:\gh\marcai; restricted Stripe keys; no secrets in output.
```

## doomscroll-blocker (Unscroll) — G-19 + C-03, G-03

```text
Repo E:\gh\doomscroll-blocker. Goal: make Unscroll store-safe and sellable: move off the Accessibility API (G-19), add the NFC-tag unlock with a one-time purchase (C-03), and give the repo CI (G-03).
Context: E:\gh\dragoscatalin\docs\portfolio\portfolio.csv rows G-19, C-03, G-03; the private remote was created on 2026-10-05 (G-02).
Done means: (1) blocking works via UsageStats/foreground-service approach that Play policy allows (VERIFIED on device); (2) NFC tag pairing + unlock; (3) one-time IAP; (4) GitHub Actions: build, unit tests, lint, gitleaks; (5) tracker rows done.
Constraints: agentq commit -ExpectRepo E:\gh\doomscroll-blocker; Kotlin/Compose golden stack.
```

## brivio — I-01, I-02, I-15 (brivio Practice), I-03, I-04, I-05, I-06, I-07, I-19

```text
Repo E:\gh\brivio. Use the "Brivio Feature" agent. Goal: brivio Practice, the accountant cockpit that brings 50-300 SMEs per firm: I-01 cockpit (P300 vs D300, deadline countdown), I-02 accountant<->client document portal, I-15 e-Sechestru / garnishment early warning.
Context: E:\gh\dragoscatalin\docs\portfolio\portfolio.csv rows I-01..I-07, I-15, I-19; brivio's own tracker + ADRs; skills ro-accounting, e-factura-compliance, accountant.
Done means: (1) plan + ADR for the Practice tenant model (firm -> client orgs) approved via askQuestions; (2) I-01, I-02, I-15 shipped as vertical slices with org-scoped queries, audit log, RO+EN, tests, SDK/MCP/CLI ripple; (3) live on staging, verified by an authenticated request; (4) rows done here and in brivio's tracker.
Later goals, one chat each: I-03 open-banking reconciliation + dunning, I-04 EU e-invoicing hub (Peppol, KSeF, XRechnung), I-05 ViDA-ready model, I-06 AMEF receipts connector, I-07 Trust NIS2 kit, I-19 OSS e-Factura/UBL SDK + hosted validator (extract from packages/efactura).
Constraints: other sessions are active in brivio; worktree via worktree.ps1; agentq commit -ExpectRepo; deploy-clean only.
```

## codai — D-05, D-06, I-11, X-07

```text
Repo E:\gh\codai. Goal: margin and differentiation features for the gateway: D-05 cache doctor (explain why a request missed the prompt cache: layout, tool order, volatile prefix), D-06 per-agent/task/branch budgets exposed as an MCP tool, I-11 AI Act Art. 50 transparency middleware, X-07 weekly stack-drift + cost report on the hub.
Context: E:\gh\dragoscatalin\docs\portfolio\portfolio.csv rows D-05, D-06, I-11, X-07; codai trackers; agent "Codai Gateway Ops" for anything touching apps/gateway hot paths.
Done means: (1) each feature behind a flag with tests; (2) gateway deploy verified by an authenticated request answered by the new revision (revision_name in the log line); (3) SDK (TS+Python) + MCP + docs ripple; (4) rows done.
Constraints: other sessions active; agentq commit -ExpectRepo E:\gh\codai; migrations before the image; deploy-clean only.
```

## axiom — D-02 + P-02

```text
Repo E:\gh\axiom. Goal: make axiom the policy point for destructive agent actions (D-02) and write the Transactional Agent Writes spec (P-02).
Context: E:\gh\dragoscatalin\docs\portfolio\portfolio.csv rows D-02, P-02; axiom AGENTS.md (Biome, tsdown, Changesets, no shell spawning in packages/*/src).
Done means: (1) policy rules for DROP/TRUNCATE, force-push, bucket/volume deletes, with dry-run + approval; (2) MCP + hook + GitHub Action surfaces enforce them; (3) spec doc P-02 in docs/; (4) changeset + release notes; (5) rows done.
```

## Shared infra — X-06, G-03, G-04, G-05

```text
Goal: one shared CI + security workflow and a Renovate preset used by every active repo (X-06, G-04), CI for money/vmui/Unscroll/notalone (G-03), and Sentry 11 with explicit dataCollection in codai, money, afti, caelia (G-05; dragoscatalin is done in 2.8.0 — copy src/lib/sentry.ts + its test).
Context: E:\gh\dragoscatalin\docs\portfolio\portfolio.csv rows X-06, G-03, G-04, G-05; reference implementation: E:\gh\dragoscatalin\.github\workflows\ci.yml (format, audit, gitleaks job) and links.yml.
Done means: (1) new repo dragoscv/workflows with a reusable workflow (lint/typecheck/test/gitleaks/audit/engines check) and dragoscv/renovate-config (golden-stack groups, minimumReleaseAge 1 day); (2) each repo calls it, first run green (link the run); (3) Sentry slice merged per repo with a test that dataCollection is explicit; (4) rows done.
Constraints: one worktree per repo; agentq commit -ExpectRepo; never touch other sessions' files.
```

## OSS scaffolds — D-07, D-01 + P-01, D-20

```text
Goal: next OSS scaffolds after mcp-lock (D-03, done 2026-10-05 at E:\gh\mcp-lock): D-07 agentcfg-audit (scan + sign AGENTS.md/SKILL.md/hooks/mcp.json), then D-01 agentq extracted from ~/.copilot/bin/agentq.ps1 as a daemon + ACP-Lock protocol spec (P-01), then D-20 device-pairing crate (SPAKE2 + SAS + iroh, from titi/dashy).
Context: E:\gh\dragoscatalin\docs\portfolio\portfolio.csv; copy the mcp-lock layout (tsdown, vitest, TS7 dual install, CI with audit, README with threat model).
Done means per scaffold: repo created private first, tests green, README with problem/approach, CI green, /lab entry on dragoscatalin.ro updated (src/data/lab.ts stage -> building + repo link) with a version bump.
```

## Consumer backlog — C-02, C-05, C-07..C-10, C-12

These are kept but not scheduled. Each gets its own chat when the owner picks it. The prompt names the repo and the row, and the chat writes its own plan first via the Plan agent.

```text
Repo <E:\gh\dashy | E:\gh\mmo | E:\gh\vitals | new>. Goal: portfolio row <C-02 Google TV home hub (dashy) | C-07 MixAI offline library + stems, one-time purchase (mmo) | C-10 home-lab health on watch/TV/tray (vitals) | C-05 BAC/EN AI tutor in Romanian | C-08 elderly check-in on Wear OS | C-09 scam-call shield for RO seniors | C-12 ADHD next-tiny-step, one-time>.
Context: E:\gh\dragoscatalin\docs\portfolio\portfolio.csv row <id> (problem, proposal, evidence); repo AGENTS.md if it exists; golden stack in ~/.claude/CLAUDE.md (native Kotlin/Compose for Android/Wear/TV, Tauri 2 for desktop).
Done means: (1) Plan agent writes the plan + "Done means" for the row and raises pricing/scope via askQuestions; (2) MVP built and running on a real device (VERIFIED); (3) store listing draft per locale; (4) portfolio row -> done with evidence and a project entry on dragoscatalin.ro (skill add-project).
Constraints: new repos start private with a secret scan before first push; agentq commit -ExpectRepo.
```
