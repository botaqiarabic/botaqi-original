# Botaqi Deployment Checklist — P0 Emergency

**Goal:** Ship Botaqi MVP to Vercel production with security remediation.  
**Owner:** Project team  
**Timeline:** ~1 hour  
**Status:** � NOT STARTED — Awaiting manual secret rotation

---

## Pre-Deployment: Security Foundation (✅ COMPLETE)

- ✅ `.env.example` template created (no real secrets)
- ✅ `.gitignore` updated (blocks `.env` from git)
- ✅ Husky pre-commit hook installed (blocks secret patterns)
- ✅ GitHub Actions CI workflow live (build, lint, secret-scan)
- ✅ All security commits pushed to `feat/botaqi-deploy` branch
- ✅ **NEW:** Phase 0 automation scaffolding (`/deployment`)

**Verification:**
```bash
git log --oneline -3
# Should show:
# 59b7f5b (HEAD -> feat/botaqi-deploy) ci(p1): add github actions workflow...
# 31324f8 security(p0): add .env.example template...
# f3776bd chore(botaqi): finalize deployment package...
```

---

## Phase 0: Automated Preflight (run before Phase 1)

**What it does:** Verifies Node version, package manifests, env templates, git cleanliness, CLI availability, service account authenticity, OpenAI reachability, Vercel linkage, and port 8080 availability. All checks are logged and backed by the transaction-based rollback manager.

**How to run:**
```bash
cd deployment
# First time only
npm install

# Real run (requires live secrets + CLIs installed)
npm run deploy:phase0

# Dry-run for CI/local smoke test (skips networked checks)
npm run deploy:phase0 -- --mock
```

**What to expect:**
- Exit code 0 = every prerequisite satisfied (takes ~40–60s)
- Exit code 1 = missing prerequisite; log file written to `deployment/logs/`
- Rollback manager unwinds any attempted remediation automatically
- Summary table printed listing each check with message

**Troubleshooting:**
- Logs: `deployment/logs/phase0-*.log`
- Re-run with `DEBUG=1 npm run deploy:phase0` (coming in next phases for verbose mode)
- Use `npm run smoke:phase0` to validate the automation layer itself (mocked network checks)

---

## Phase 1: Secret Rotation (15–30 minutes) — 🔴 NOT STARTED

### 1.1 Rotate OpenAI API Key

**Action:** Delete old key, create new one
- [ ] Go to https://platform.openai.com/account/api-keys
- [ ] Find and **delete** the leaked key (old one in your `.env` history)
- [ ] Click **"Create new secret key"**
- [ ] **Copy the new key** to clipboard
- [ ] Paste into local `.env` under `OPENAI_API_KEY=sk-proj-...`
- [ ] Verify works locally: `npm run dev` (Vite should load without errors)

**Acceptance:** Old key revoked in OpenAI dashboard, new key loaded in local `.env`

---

### 1.2 Rotate LOGBLOCKED_API_KEY

**Action:** Generate new random 32-byte key
- [ ] Open PowerShell in botaqi-web directory
- [ ] Run:
  ```powershell
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $newKey = [Convert]::ToBase64String($bytes)
  Write-Host $newKey
  $newKey | Set-Clipboard
  ```
- [ ] Paste the output into local `.env` under `LOGBLOCKED_API_KEY=...`
- [ ] **Save and keep the key** — you'll need it for Vercel in Phase 2

**Acceptance:** New key generated, copied to clipboard, pasted in local `.env`

---

### 1.3 Local Smoke Test (Optional, Recommended)

**Action:** Verify local build with rotated keys
- [ ] Kill any running `npm run dev` server
- [ ] Run:
  ```bash
  npm run build  # Should produce dist/ with no errors
  npm run preview  # Run local preview at http://localhost:4173
  ```
- [ ] Browser check: Page loads, CSS renders, no console errors
- [ ] **Do NOT commit `.env`** — pre-commit hook will block it if you try

**Acceptance:** Build succeeds, preview runs clean, `.env` not staged

---

## Phase 2: (Optional) Purge Secrets from Git History (10–15 minutes)

**Action:** Remove `.env` commits from git history *(only for public repos)*

⚠️ **WARNING:** Force-push required; coordinate with team before doing this.

### 2.1 Create Backup Branch
- [ ] Run:
  ```bash
  git branch backup/before-bfg-purge
  git push origin backup/before-bfg-purge
  ```

### 2.2 Install BFG (Windows)
- [ ] Option A (via Chocolatey):
  ```powershell
  choco install bfg
  ```
- [ ] Option B (Manual):
  - Download from https://rtyley.github.io/bfg-repo-cleaner/
  - Extract to `C:\Program Files\bfg` or add to PATH

### 2.3 Purge `.env` from History
- [ ] Run from **repo root** (not botaqi-web):
  ```bash
  bfg --delete-files .env
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
  ```

### 2.4 Force-Push (⚠️ Destructive)
- [ ] Verify you're on `feat/botaqi-deploy`:
  ```bash
  git branch
  ```
- [ ] Run:
  ```bash
  git push origin feat/botaqi-deploy --force-with-lease
  ```

**Acceptance:** Git history cleaned of `.env`, force-push succeeds, team notified

---

## Phase 3: Provision Vercel Environment Secrets (5 minutes) — 🔴 NOT STARTED

**Action:** Add three secrets to Vercel project

### 3.1 Prepare Firebase Admin Key
- [ ] Open `botaqi-web/backend.env` or your local Firebase service account JSON
- [ ] Read the full JSON content
- [ ] Encode to Base64:
  ```powershell
  $content = Get-Content "path/to/firebase-admin-key.json" -Raw
  $base64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
  Write-Host $base64
  $base64 | Set-Clipboard
  ```
- [ ] Paste the Base64 string to clipboard

### 3.2 Add Secrets to Vercel
- [ ] Log in to https://vercel.com/dashboard
- [ ] Select **Botaqi** project
- [ ] Go **Settings** → **Environment Variables**
- [ ] Add three secrets **(Production scope only)**:

  **Secret 1: FIREBASE_ADMIN_KEY**
  - Name: `FIREBASE_ADMIN_KEY`
  - Value: [Paste Base64 Firebase admin key from clipboard]
  - Scope: Production
  - [ ] Click "Save"

  **Secret 2: LOGBLOCKED_API_KEY**
  - Name: `LOGBLOCKED_API_KEY`
  - Value: [Paste new key from Phase 1.2]
  - Scope: Production
  - [ ] Click "Save"

  **Secret 3: OPENAI_API_KEY**
  - Name: `OPENAI_API_KEY`
  - Value: [Paste new key from Phase 1.1, with `sk-proj-` prefix]
  - Scope: Production
  - [ ] Click "Save"

- [ ] Verify all three appear in the list (values masked)

**Acceptance:** All three secrets visible in Vercel dashboard with correct names

---

## Phase 4: Deploy to Vercel & Smoke Tests (15–20 minutes) — 🔴 NOT STARTED

### 4.1 Deploy
- [ ] From `botaqi-web` directory:
  ```bash
  npm install -g vercel  # If not already installed
  vercel --prod
  ```
- [ ] Follow prompts:
  - Confirm project name (should be "botaqi-web" or "botaqi")
  - Confirm production deployment
- [ ] Wait for build to complete (~2–3 minutes)
- [ ] Vercel will output a production URL: `https://your-domain.vercel.app`

**Acceptance:** Build succeeds, production URL available

### 4.2 Smoke Tests (Run 3 checks)

#### Test 1: Landing Page Loads
- [ ] Open Vercel URL in browser
- [ ] Page renders (hero section, features, CTA buttons visible)
- [ ] CSS loads (gold/blue color scheme, fonts render)
- [ ] No console errors (press F12, check Console tab)
- [ ] Check Network tab: no 4xx/5xx responses

**Acceptance:** Page loads, CSS renders, no errors

#### Test 2: Analytics Logging
- [ ] Open DevTools (F12) → Console
- [ ] Look for `logEvent("page_view", ...)` message
- [ ] Go to Firebase Console → Firestore → `landing_analytics` collection
- [ ] Verify new document with `{ event: "page_view", timestamp: ... }` exists

**Acceptance:** Analytics event logged to Firestore

#### Test 3: API Endpoints (if applicable)
- [ ] Test `/api/helloWorld` endpoint:
  ```bash
  curl -X GET "https://your-domain.vercel.app/api/helloWorld"
  ```
  Expected: 200 OK or 503 (if kill-switch active)

- [ ] Test `/api/logBlocked` endpoint:
  ```bash
  curl -X POST "https://your-domain.vercel.app/api/logBlocked" \
    -H "Content-Type: application/json" \
    -H "x-api-key: [LOGBLOCKED_API_KEY from Phase 1.2]" \
    -d '{"action": "test"}'
  ```
  Expected: 200 OK with `{ "ok": true }`

**Acceptance:** Both endpoints return expected status codes

---

## Phase 5: Prepare for Production (5–10 minutes)

### 5.1 Create Pull Request
- [ ] Push `feat/botaqi-deploy` to GitHub:
  ```bash
  git push origin feat/botaqi-deploy
  ```
- [ ] Open GitHub → Create Pull Request from `feat/botaqi-deploy` → `main`
- [ ] Title: `feat: deploy botaqi mvp with security hardening`
- [ ] Description: Reference security fixes + Vercel MVP + smoke tests passed
- [ ] Wait for GitHub Actions workflow to run (should show green checkmark)

### 5.2 Code Review & Merge
- [ ] Review workflow results:
  - [ ] ✅ Node 20 setup
  - [ ] ✅ `npm ci` install
  - [ ] ✅ `tsc` type-check
  - [ ] ✅ `npm run build` succeeds
  - [ ] ✅ Secret-scan passes (no hardcoded keys in diff)
- [ ] Approve PR
- [ ] Merge to `main` (use "Squash and merge" for clean history)

### 5.3 Monitor Production (Post-Merge)
- [ ] Vercel auto-deploys to production (watch Vercel dashboard)
- [ ] Check production URL for 30 seconds (page loads, no errors)
- [ ] Monitor Firestore logs for any write failures
- [ ] Slack: "Botaqi MVP deployed to production" 🚀

**Acceptance:** PR merged, production deployed, smoke tests pass

---

## Rollback Plan (If Things Break)

If production deployment fails:

1. **Immediate:** Revert `main` branch:
   ```bash
   git revert HEAD~1  # Or use GitHub UI to revert PR
   git push origin main
   ```

2. **Investigate:** Check Vercel logs:
   - Vercel Dashboard → Project → Deployments → [Failed Deployment] → View logs
   - Look for: build errors, environment variable issues, API key typos

3. **Fix & Retry:**
   - Fix issues locally
   - Commit to `feat/botaqi-deploy`
   - Re-test preview
   - Create new PR

---

## Final Verification Checklist

Before marking as "complete," confirm ALL items:

- [ ] ✅ Secrets rotated (OpenAI + LOGBLOCKED_API_KEY)
- [ ] ✅ `.env` not in git tracking (check `git status`)
- [ ] ✅ Vercel secrets provisioned (all 3 visible in Vercel Settings)
- [ ] ✅ Production deployment complete (Vercel shows green)
- [ ] ✅ Landing page loads (no console errors)
- [ ] ✅ Analytics events logged to Firestore
- [ ] ✅ API endpoints respond correctly
- [ ] ✅ GitHub Actions workflow passes on main
- [ ] ✅ Team notified of production deployment

---

## Post-Deployment (P2, Next Week)

- [ ] Add Sentry DSN to `.env.example` and Vercel secrets
- [ ] Integrate `@sentry/react` in `src/App.tsx`
- [ ] Add Firestore write-failure alerts
- [ ] Enable strict pre-commit hook mode (currently non-blocking)
- [ ] Add Vitest unit tests (SRS engine, Landing snapshots)
- [ ] Monitor metrics: TTL, error rate, analytics volume

---

**Questions?** Refer to [MANUAL_ACTIONS.md](docs2/MANUAL_ACTIONS.md) for detailed step-by-step guides.

---

## Appendix: Vercel configuration & quick recovery notes (2025-12-15)

- Change applied: removed unsupported `rootDirectory` from `botaqi-web/vercel.json` and added an explicit `builds` entry using `@vercel/static-build` with `dist` as the output directory to force static-build behavior for our Vite app.
- Why: Vercel's autodetection expected Next.js (caused missing .next routes-manifest errors). The `builds` entry tells Vercel exactly which builder to run and which dist folder to deploy.

Key commands (repo root):
```
# build & verify locally (in botaqi-web)
cd botaqi-web
npm ci
npm run vercel:build   # alias present -> runs vercel-build -> build

# deploy via CLI from app dir (preferred)
npx vercel --prod --yes --debug --cwd C:\Users\muzam\Projects\Gulfara\botaqi-web
```

Config notes (choice made):
- `vercel.json` now contains a `builds` entry referencing `package.json` and `use: "@vercel/static-build"` with `distDir: "dist"` so Vercel executes the Vite static build and deploys `dist/`.
- SPA fallback: routes include filesystem handle and a fallback to `/index.html` so client-side routes like `/app/dashboard` resolve.
- `package.json` contains `vercel-build` and `vercel:build` scripts to ensure both `vercel-build` and `vercel:build` invocations work.

CI / validation:
- A lightweight GitHub Actions workflow added at `.github/workflows/ci-validate-botaqi-web.yml` that checks the vercel.json configuration and runs `npm ci && npm run build` inside `botaqi-web` to catch build/detection issues before deploy.

Quick troubleshooting steps:
- If Vercel rejects config: remove unsupported keys (see error message) and prefer app-level `builds.src` pointing to `botaqi-web/package.json`.
- If routes 404: ensure SPA fallback route exists or set router `basename` (BrowserRouter) to `/app` if app is served under `/app`.
- If build fails on Vercel but passes locally: confirm all build-time env vars are set in Vercel project settings.

File references:
- Vercel config: `botaqi-web/vercel.json`
- CI workflow: `.github/workflows/ci-validate-botaqi-web.yml`
- Build scripts: `botaqi-web/package.json` (scripts `vercel-build`, `vercel:build`)

---

## Edge Function Deployment (MVP checklist)

1) Purpose: run minimal API routes (server-side logic) as Vercel Serverless functions under `/api/*` and keep static SPA served by `@vercel/static-build` from `dist/`.

2) Local verification
- Build app: run in `botaqi-web`:
```
npm ci
npm run vercel:build
```
- Start dev server for functions (interactive):
```
npx vercel dev --cwd .
```
- Test API locally: `curl -i http://127.0.0.1:3000/api/test-sentry` (returns 200 when SENTRY_DSN set, 400 when unset).

3) Production deployment
- Deploy: `npx vercel --prod --yes --cwd botaqi-web`
- If site is private / protected, obtain Vercel bypass token or temporarily set project to public to test endpoints. See Vercel docs: https://vercel.com/docs/deployment-protection

4) Production verification notes (what we did)
- Production URL: https://botaqi-pm91krfw8-botaqis-projects.vercel.app
- Observed: accessing `/api/test-sentry` returned a Vercel authentication page. This indicates project-level protection or private status. To programmatically test the endpoint you must either:
  - Add the SENTRY_DSN and other required env vars into the Vercel Project Environment, and/or
  - Use the Vercel bypass token mechanism described in the docs to access the protected endpoint for automated checks.

### Production test (bypass token example)

If the project is protected you'll need a bypass token to request endpoints programmatically. Obtain the bypass token from Vercel (see docs) and then test with a query parameter as shown:

```
# Example (replace $BYPASS with real token):
curl -i "https://botaqi-pm91krfw8-botaqis-projects.vercel.app/api/test-sentry?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=$BYPASS"

# Alternatively, include in the cookie header if required:
curl -i -H "Cookie: __vercel_bypass=$BYPASS" "https://botaqi-pm91krfw8-botaqis-projects.vercel.app/api/test-sentry"
```

Notes:
- If you prefer not to use a bypass token, add `SENTRY_DSN` (and other required env vars) to the Vercel Project Environment (Production scope) and re-deploy — the /api/test-sentry endpoint will return 200 once Sentry is initialized.
- The authentication page indicates deployment protection, not a missing function; no route changes are required if you see this page.

5) Rollback
- To rollback: revert the last commit that triggered the broken deploy and push, then run `npx vercel --prod --yes --cwd botaqi-web` to deploy the previous state.

6) Security
- Never commit `envs/` or service account files. Provide all runtime secrets through Vercel Project Environment variables or GCP Secret Manager.


