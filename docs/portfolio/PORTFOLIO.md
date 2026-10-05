# Portfolio tracker: gaps, ideas and decisions

This file covers the whole portfolio: every active repo in `E:\gh`, the shared
agent infrastructure, new product ideas, OSS, SDKs and protocols. The website's
own tracker is separate, in [`../TRACKER.md`](../TRACKER.md).

The machine-readable twin is [`portfolio.csv`](portfolio.csv). It uses the same
ids, and both files are updated in the same commit.

## Statuses and kinds

**Status values:**

- `proposed`
- `keep`, meaning the owner chose it
- `doing`
- `done`
- `dropped`
- `later`

**Id prefixes:**

- `G` is a gap in an existing repo.
- `X` is shared agent/dev infrastructure.
- `S` is this site.
- `I` is a RO/EU B2B idea.
- `D` is a devtool or OSS idea.
- `P` is a protocol.
- `C` is a consumer or prosumer idea.

**Scoring:**

- `impact` and `effort` are H/M/L.
- `fit` (1–5) measures how much existing code the idea reuses and how well it fits the owner's goals: consulting leads, revenue, reputation.

## Sources (2026-10-05)

Seven parallel subagents produced the inputs:

- 4 read-only audits:
  - codai, brivio and money
  - 14 consumer and tool repos
  - 15 newer repos
  - shared agent infrastructure
- 3 web-research passes:
  - RO/EU B2B regulation and pain points
  - devtools, AI and protocols
  - consumer and home lab

The ranked findings live in the CSV `problem` and `source` columns. Dates from regulation drafts are marked "verify" until confirmed against Monitorul Oficial or the EU source.

## Headline findings

1. **Some risks need action now, not ideas.**
   - The money Telegram token was never rotated (G-01).
   - **abridge has zero commits.**
   - afti, dashy, caelia, devbox and Unscroll have no remote (G-02).
2. **Drift happens because nothing automates it.**
   - Only dragoscatalin has Renovate.
   - money, vmui and Unscroll have no CI (G-03, G-04, X-06).
   - Sentry 10 without `dataCollection` collects everything (G-05).
3. **The fastest revenue is already built and waiting to ship.**
   - Horae: 200 faces built, uploads frozen (G-16, C-04).
   - marcai entitlements (G-17).
   - TikSee live-ready rows (G-18).
4. **Romanian invoicing is now a commodity** (Oblio is 29 €/year). The money is after the invoice:
   - the accountant cockpit, document portal and bank reconciliation (I-01..I-03);
   - EU cross-border e-invoicing (I-04).
5. **The most distinctive OSS assets are the agent tooling built for this machine:**
   - agentq → coordination daemon plus protocol (D-01, P-01);
   - axiom as the policy point for destructive actions (D-02);
   - mcp-lock and agentcfg-audit, both of which have strong 2025–2026 incident evidence (D-03, D-07).

## Recommended top 10 (agent's ranking, pending owner decision)

| #   | Ids                    | Why                                                                                   |
| --- | ---------------------- | ------------------------------------------------------------------------------------- |
| 1   | G-01, G-02             | Security and data-loss risk; effort S                                                 |
| 2   | X-06, G-03, G-04, G-05 | One shared CI and security workflow plus a Renovate preset stops drift in all repos   |
| 3   | G-16, C-04             | Horae: revenue from work already done; seasonal deadline mid-October                  |
| 4   | I-01, I-02, I-15       | "brivio Practice": one accounting firm brings 50–300 SMEs                             |
| 5   | D-01, P-01             | agentq OSS plus spec: a unique asset, builds reputation, a lead magnet for consulting |
| 6   | D-03, D-07             | Small, fast OSS with strong evidence (CVEs, ToxicSkills)                              |
| 7   | D-05, D-06             | codai cache doctor plus budgets: direct margin and differentiation                    |
| 8   | S-01, S-02, S-03, S-05 | Site gates plus a services page aimed at the site's lead goal                         |
| 9   | X-01, X-02, X-03       | The agent guard and agentq failures cost time in every session                        |
| 10  | I-04                   | The only international upside, with fixed deadlines (KSeF, Germany)                   |

## Decisions log

| Date       | Question              | Answer                                                                                                                                                         |
| ---------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-05 | Scope                 | Audit every active repo in `E:\gh` plus shared infrastructure. Retired repos (evocrm) are excluded.                                                            |
| 2026-10-05 | Where to implement    | This repo (dragoscatalin v3 plus upgrade), plus chosen ideas as new scaffold repos. Fixes in other repos become rows here, so other sessions aren't disturbed. |
| 2026-10-05 | Tracker location      | `docs/portfolio/` (this file plus the CSV), kept separate from the site tracker.                                                                               |
| 2026-10-05 | Idea types            | All of them: RO/EU SaaS, OSS/devtools, protocols, consumer, private tools.                                                                                     |
| 2026-10-05 | Capacity              | 1–2 new products plus small OSS projects; the rest of the time goes to codai and brivio.                                                                       |
| 2026-10-05 | Urgent items kept     | G-01, G-02, G-15, G-23                                                                                                                                         |
| 2026-10-05 | Shared infra kept     | X-01..X-07, G-03, G-04, G-05                                                                                                                                   |
| 2026-10-05 | Fast revenue kept     | G-16 + C-04 (Horae), G-17 (marcai), G-19 + C-03 (Unscroll). G-18 (TikSee) was not chosen.                                                                      |
| 2026-10-05 | B2B kept              | I-01, I-02, I-15 (brivio Practice), I-03, I-04, I-05, I-07, I-06, I-11                                                                                         |
| 2026-10-05 | OSS kept              | D-01 + P-01, D-03 + P-03, D-07, D-02 + P-02, D-05, D-06, D-19, I-19, D-20                                                                                      |
| 2026-10-05 | Consumer backlog kept | C-01, C-02, C-05, C-07, C-08, C-09, C-10, C-12                                                                                                                 |
| 2026-10-05 | Archive               | Only cursuri-studiai (guides move to the site blog) and devbox (folded into vmui). The rest stay as they are.                                                  |
| 2026-10-05 | Site                  | S-01..S-03 gates, the V3-01 upgrade plus Sentry 11 plus Resend → Brivio, S-05 `/services` and `/lab`, and S-06 (below).                                        |
| 2026-10-05 | Owner note            | mmo/MuzicAI is now **MixAI** (mixai.ro) and has TV apps. The site must show the TV surface for every project that has one (S-06).                              |
| 2026-10-05 | Order                 | 1) urgent items, 2) site gates and upgrade, 3) shared infra, 4) chosen OSS as new scaffold repos, 5) everything else as rows plus a handoff prompt per repo.   |

## Execution plan

Phases follow the owner's order. A row goes `keep` → `doing` → `done` (with evidence) in this file and in the CSV.

1. **Urgent:**
   - G-02: private remotes, with a secret scan before each first push.
   - G-15: inspect and clean root clutter.
   - G-23: export, then delete only after an explicit confirmation.
   - G-01: the owner rotates the token in BotFather; the agent updates the stores.
2. **Site, in this repo:**
   - Gates (S-01..S-03).
   - Dependency upgrade (V3-01) and Sentry 11.
   - Registry fix for MixAI and TV surfaces (S-06).
   - `/services` and `/lab` (S-05).
   - Resend → Brivio (G-21), which is blocked on the Brivio JMAP send fix (V3-23).
3. **Shared infra:**
   - In `~/.copilot`: X-01..X-05.
   - A reusable workflow and Renovate preset repo: X-06, G-03, G-04.
   - A Sentry 11 slice per repo (G-05).
   - The drift report (X-07).
4. **OSS:** a new scaffold repo per chosen item, in order D-03 → D-07 → D-01/P-01 → I-19 → D-19 → D-20. D-02/P-02 and D-05/D-06 extend axiom and codai.
5. **Products (I-_, C-_, G-16, G-17, G-19):** each gets a tracker row in its own repo plus a ready-to-paste prompt for a dedicated chat. Other sessions are active in brivio, codai and watch-faces.

## Progress (2026-10-05)

| Phase      | Done                                                                                                                                                                    | Open                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1 Urgent   | G-02, G-15, G-23 (RSVPs kept until 2026-11-04)                                                                                                                          | G-01: only the owner can rotate the token in BotFather                             |
| 2 Site     | S-01, S-02, S-03, S-05, S-06, V3-01: 2.8.0 is live. This brings Next 16.3.8 (critical `next/og` RCE fix), Sentry 11 server-only, the CI gates, and `/services` + `/lab` | G-21: Resend → Brivio, blocked until the V3-23 JMAP fix reaches Brivio production  |
| 3 Infra    | X-01 guard, X-02 `-ExpectRepo`, X-03 unstage on failure, X-04 budget/backup/hook-test checks, X-05 `run-logged.ps1`                                                     | X-06, G-03, G-04, G-05 (others), X-07: one prompt each in [PROMPTS.md](PROMPTS.md) |
| 4 OSS      | D-03 mcp-lock 0.1 at `E:\gh\mcp-lock` → private `dragoscv/mcp-lock` (CI green, 14 tests)                                                                                | D-07, D-01/P-01, I-19, D-19, D-20: one prompt in [PROMPTS.md](PROMPTS.md)          |
| 5 Products | Ready-to-paste prompt per repo: [PROMPTS.md](PROMPTS.md)                                                                                                                | Each prompt runs in its own chat                                                   |
