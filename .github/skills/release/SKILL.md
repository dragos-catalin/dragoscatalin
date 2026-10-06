---
name: release
description: >-
  Cut a dragoscatalin.ro release: version bump, CHANGELOG, explicit-path commit in the shared
  clone, push, and LIVE verification of the Vercel deploy (headers, sitemap, llms.txt,
  canonical/hreflang). Includes the Vercel env var checklist. Use when asked to release,
  deploy, ship or verify production.
---

# Release

## 1. Preflight (all must pass, show output)

```powershell
pnpm lint; pnpm typecheck; pnpm test; pnpm size; pnpm tracker:check
```

## 2. Version + CHANGELOG

```powershell
npm version --no-git-tag-version patch   # or minor / major
```

Move `## [Unreleased]` entries in `CHANGELOG.md` to `## [x.y.z] - YYYY-MM-DD`
(Keep a Changelog; Added/Changed/Fixed). Husky refuses a `src/` change without
both. Footer reads the version from `package.json`.

## 3. Commit — shared clone rules

```powershell
git add package.json CHANGELOG.md docs/TRACKER.md docs/tracker.csv <explicit files>
git diff --cached --name-only
git commit -m "chore(release): vX.Y.Z"
git push origin main
```

Never `git add -A` / `.` / `commit -a`. If foreign files are already staged,
keep them and name them in the report. If pre-commit says another commit is in
progress, wait 30–60 s and retry.

## 4. Verify the LIVE deploy (Vercel auto-deploys `main`)

```powershell
curl.exe -sI https://dragoscatalin.ro | Select-Object -First 15
```

Expect `HTTP/2 200`, `x-vercel-id`, `x-vercel-cache`, `strict-transport-security`.

```powershell
curl.exe -s https://dragoscatalin.ro/sitemap.xml | Select-String -Pattern "projects" | Measure-Object
curl.exe -s https://dragoscatalin.ro/llms.txt | Select-Object -First 12
curl.exe -s https://dragoscatalin.ro/ro/ | Select-String -Pattern 'rel="canonical"|hreflang'
curl.exe -s https://dragoscatalin.ro/api/projects | ConvertFrom-Json | Measure-Object
```

Canonical must be `https://dragoscatalin.ro/ro`, hreflang `en`, `ro`,
`x-default` present. Confirm the footer version equals `package.json`.
Say **VERIFIED** with the output, never "should be live".

## 5. Vercel environment variables (from `.env.example`)

```powershell
npx vercel env add NEXT_PUBLIC_SITE_URL production          # https://dragoscatalin.ro
npx vercel env add GITHUB_TOKEN production                   # fine-grained PAT, read-only Metadata
npx vercel env add BRIVIO_API_KEY production                 # Brivio key, scopes emails:send, emails:read, marketing_subscribers:write ONLY
npx vercel env add CONTACT_TO_EMAIL production               # catalin@dragoscatalin.ro
npx vercel env add CONTACT_FROM_EMAIL production             # contact@dragoscatalin.ro (verified Brivio sending domain)
npx vercel env add CONTACT_HOOK_URL production               # https://homepi.taild1532d.ts.net/hooks/contact
npx vercel env add CONTACT_HOOK_SECRET production            # = vmui .private/credentials.env CONTACT_HOOK_SECRET
npx vercel env add SENTRY_DSN production
npx vercel env add NEXT_PUBLIC_SENTRY_DSN production
npx vercel env add SENTRY_ORG production
npx vercel env add SENTRY_PROJECT production
npx vercel env add SENTRY_AUTH_TOKEN production
```

Type values into the prompt — never paste secrets into chat or a command line
that gets logged. Every integration no-ops when its var is absent (Brivio →
mailto fallback, hook → no phone notification, Sentry → disabled, GitHub → static
registry data). `npx vercel env ls production` to audit. Brivio's "Create key"
dialog pre-checks ALL scopes — uncheck them before picking the three above.

## 6. Cache tags

GitHub data is cached with `cacheLife("days")` + `cacheTag("github")`
(`src/lib/github.ts`); llms builders use `cacheLife("days")`. A deploy rebuilds
the cache. To force earlier refresh without a deploy, add a guarded route
calling `revalidateTag("github", "max")` — none exists today, so a redeploy is
the supported path.
