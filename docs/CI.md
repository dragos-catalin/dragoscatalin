# CI & quality gates

Everything runs through plain Node scripts in `scripts/` so the same logic
works in husky hooks, in `pnpm ci:local` and in GitHub Actions.

## Git hooks (husky)

| Hook          | Script                    | What it does                                                                                                                                                                                                                                                                                                                                                             |
| ------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pre-commit`  | `scripts/pre-commit.mjs`  | takes the commit lock (`.git/dc-commit.lock`), runs the **version + CHANGELOG gate** when `src/`, `messages/` or `public/` is staged, `check-tracker`, `check-messages` (when `messages/*.json` staged), then `lint-staged` (eslint --fix + prettier), `tsc --noEmit` (when .ts/.tsx staged) and `vitest run --changed` (when `src/` staged). Prints the slowest phases. |
| `post-commit` | `scripts/post-commit.mjs` | releases the commit lock.                                                                                                                                                                                                                                                                                                                                                |
| `pre-push`    | `scripts/pre-push.mjs`    | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (fails on any Next/Turbopack line matching `/warn/i` except known-benign), `pnpm size`.                                                                                                                                                                                                                         |

Hooks are installed by `pnpm install` (`prepare` → `husky`). Re-install with
`pnpm prepare`. Hook files are LF, no BOM.

### Switches

| Env             | Effect                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| `SKIP_HOOKS=1`  | skip pre-commit **and** pre-push entirely (emergencies only).                                               |
| `FAST_COMMIT=1` | pre-commit runs only the structural gates (version/CHANGELOG, tracker, messages) — no lint/typecheck/tests. |

PowerShell: `$env:FAST_COMMIT=1; git commit -m "..."; Remove-Item Env:FAST_COMMIT`.

### Version + CHANGELOG gate

Any staged change under `src/`, `messages/` or `public/` requires:

1. `package.json` staged with a version different from `HEAD:package.json` —
   `npm version --no-git-tag-version patch` (or `minor`/`major`) then
   `git add package.json`.
2. `CHANGELOG.md` staged with an entry.

### Commit lock

Several agents share this clone. `pre-commit` writes `{pid,startedAt}` to
`.git/dc-commit.lock`; a second commit fails with _another commit is in
progress_ — wait 30–60 s and retry. Locks are reclaimed automatically when
the pid is dead or the lock is older than 20 min.

## Whole pipeline locally — `pnpm ci:local`

`scripts/ci-local.mjs` runs the exact CI step list on Linux:

- **Windows** → re-executes itself inside WSL (`wsl.exe -e bash -lc`), mapping
  the repo path with `wslpath` (`E:\gh\dragoscatalin` → `/mnt/e/gh/dragoscatalin`),
  then `corepack enable && pnpm install --frozen-lockfile && node scripts/ci-local.mjs --inner`.
- **`--docker`** → same inside `node:26-bookworm` with the repo mounted at `/w`.
- **Linux/macOS** → runs inline.

Steps, in order: lint · typecheck · check-messages · check-tracker ·
test (coverage) · build · size · `playwright install --with-deps chromium` ·
e2e (`CI=1`, Playwright starts `pnpm build && pnpm start` on :24789).
Add `--keep-going` to run all steps despite failures. Each run writes
`.copilot-tmp/ci-logs/<timestamp>.log` and prints a timing table.

## GitHub Actions

- `.github/workflows/ci.yml` — PR/push to `main` + manual. Single `ci` job,
  actions pinned by SHA. Runner is chosen by the repo variable `CI_RUNNER`
  (falls back to `ubuntu-latest`).
- `.github/workflows/lighthouse.yml` — PRs only; builds, starts on :24789 and
  runs `treosh/lighthouse-ci-action` with `lighthouserc.json` (performance ≥ 0.9
  warn; accessibility / best-practices / SEO ≥ 0.95 error).
- `renovate.json` — weekly grouped non-major updates, lockfile maintenance,
  pinned action digests, `pnpm dedupe` after updates.

### Register the WSL self-hosted runner

In the WSL distro (Ubuntu), as your user:

```bash
mkdir -p ~/actions-runner && cd ~/actions-runner
VER=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | grep -oP '"tag_name": "v\K[^"]+')
curl -L -o runner.tar.gz "https://github.com/actions/runner/releases/download/v${VER}/actions-runner-linux-x64-${VER}.tar.gz"
tar xzf runner.tar.gz && rm runner.tar.gz
TOKEN=$(gh api -X POST repos/dragoscv/dragoscatalin/actions/runners/registration-token --jq .token)
./config.sh --url https://github.com/dragoscv/dragoscatalin --token "$TOKEN" \
  --name dragoscatalin-wsl-1 --labels dragoscatalin-linux --unattended --replace
sudo ./svc.sh install && sudo ./svc.sh start
sudo ./svc.sh status
```

The runner needs Node 26 + pnpm (`corepack enable`) and Playwright's system
deps (`pnpm exec playwright install --with-deps chromium` once).

Then point CI at it:

```powershell
gh variable set CI_RUNNER --body '["self-hosted","linux","dragoscatalin-linux"]'
# back to hosted:
gh variable delete CI_RUNNER
```

## Budgets

- `.size-limit.json` — gzip budget on `.next/static/chunks/*.js` after a
  production build. Re-measure with `pnpm size` after `pnpm build`.
- Vitest coverage thresholds: statements 60 %, lines 60 % on `src/lib`,
  `src/data`, `src/i18n`.
