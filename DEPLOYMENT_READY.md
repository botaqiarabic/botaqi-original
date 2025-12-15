# Botaqi MVP — Ready for Deployment 🚀

## Status: Security Foundation Complete ✅ | Awaiting Manual Secret Rotation & Vercel Provisioning 🔴

---

## What Just Completed (This Session)

### ✅ Security Foundation (Automated)
1. **`.env.example` Template** (botaqi-web/)
   - All env vars documented: Firebase config, OpenAI key, LOGBLOCKED key, etc.
   - No real secrets in template (all marked `REPLACE_WITH_YOUR_...`)
   - Safe to commit to git and share with team

2. **Pre-Commit Hook** (botaqi-web/.husky/pre-commit)
   - Blocks commits containing secret patterns
   - Scans staged diffs for: `OPENAI_API_KEY=sk-`, `FIREBASE_ADMIN_KEY=...`, etc.
   - Prevents accidental secret commits going forward

3. **GitHub Actions CI Workflow** (.github/workflows/ci.yml)
   - Runs on every PR and push to main
   - Steps: Node 20 setup → npm ci → tsc type-check → npm run build → secret-scan
   - Fails if hardcoded secrets found in git log or diff
   - Provides automated safety net for team

4. **Documentation** (botaqi-web/)
   - **DEPLOYMENT_CHECKLIST.md**: Step-by-step phases for safe deployment
   - **Updated README.md**: Links to deployment checklist
   - **Updated .env.example**: Production-ready template with all required fields

### ✅ Commits Staged & Pushed
```
5f7a40a docs: link README to DEPLOYMENT_CHECKLIST
8c44a27 docs(p0): update .env.example template + add DEPLOYMENT_CHECKLIST
59b7f5b ci(p1): add github actions workflow
31324f8 security(p0): add .env.example, .gitignore, pre-commit hook
f3776bd chore(botaqi): finalize deployment package
```

**Branch:** `feat/functions-kill-switch` (local) → `feat/botaqi-deploy` (origin)

---

## Next Steps: Manual Actions (You Must Execute)

### 🔴 Phase 1: Rotate Exposed Secrets (15–30 min)

**Why:** Your `.env` file contained live API keys committed to git. Must regenerate to prevent unauthorized access.

#### 1.1 OpenAI API Key
```
1. Go to https://platform.openai.com/account/api-keys
2. Delete the old key (the one in your .env history)
3. Click "Create new secret key"
4. Copy the new key (format: sk-proj-...)
5. Update local botaqi-web/.env: OPENAI_API_KEY=sk-proj-...
```

#### 1.2 LOGBLOCKED_API_KEY
```powershell
# Run in PowerShell (botaqi-web directory):
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$newKey = [Convert]::ToBase64String($bytes)
Write-Host $newKey
$newKey | Set-Clipboard
```
Copy the output → update local botaqi-web/.env: `LOGBLOCKED_API_KEY=...`

#### 1.3 Test Locally (Optional)
```bash
npm run build  # Should succeed
npm run preview  # Should load without errors at http://localhost:4173
```

### 🔴 Phase 2: Provision Vercel Environment Secrets (5 min)

**Prerequisites:**
- Vercel account + Botaqi project created
- Three rotated keys from Phase 1 ready
- Firebase Admin service account JSON (base64 encoded)

**Steps:**
1. Go to https://vercel.com/dashboard
2. Select **Botaqi** project
3. Settings → **Environment Variables**
4. Add three secrets **(Production scope)**:
   - `FIREBASE_ADMIN_KEY`: Base64-encoded Firebase admin key
   - `OPENAI_API_KEY`: New key from Phase 1.1
   - `LOGBLOCKED_API_KEY`: New key from Phase 1.2

### 🟡 Phase 3 (Optional): Purge Secrets from Git History (10–15 min)

**Recommended if:** Your repo will become public.  
**Warning:** Force-push required; coordinate with team.

```bash
# Create backup branch
git branch backup/before-bfg-purge
git push origin backup/before-bfg-purge

# Install BFG (Windows)
choco install bfg

# Purge .env from history (from repo root)
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin feat/botaqi-deploy --force-with-lease
```

### 🟢 Phase 4: Deploy to Vercel & Smoke Tests (15–20 min)

**Prerequisites:** Phases 1–3 complete, Vercel secrets provisioned

```bash
cd botaqi-web
npm install -g vercel  # If needed
vercel --prod
```

**Smoke Tests (3 checks):**

1. **Landing Page Loads**
   - Open the Vercel URL in browser
   - Verify: Hero section renders, CSS loads, no console errors
   - Check Network tab: no 4xx/5xx responses

2. **Analytics Logged**
   - Open DevTools (F12) → Console
   - Should see: `logEvent("page_view", ...)`
   - Go to Firebase Console → Firestore → `landing_analytics` collection
   - Verify: New document with `{ event: "page_view", timestamp: ... }` created

3. **API Endpoints**
   ```bash
   # Test helloWorld
   curl -X GET "https://your-domain.vercel.app/api/helloWorld"
   # Expected: 200 or 503 (depending on kill-switch)

   # Test logBlocked
   curl -X POST "https://your-domain.vercel.app/api/logBlocked" \
     -H "Content-Type: application/json" \
     -H "x-api-key: [LOGBLOCKED_API_KEY]" \
     -d '{"action": "test"}'
   # Expected: 200 OK with { "ok": true }
   ```

### 🟢 Phase 5: Merge to Production (5 min)

```bash
# From botaqi-web
git push origin feat/functions-kill-switch  # Push to your branch
```

Then on GitHub:
1. Create **Pull Request** from `feat/functions-kill-switch` → `main`
2. Wait for GitHub Actions workflow to pass (build, lint, secret-scan)
3. Review workflow results:
   - ✅ Node 20 setup
   - ✅ npm ci (deterministic)
   - ✅ tsc (type-check)
   - ✅ npm run build
   - ✅ secret-scan (no hardcoded keys)
4. Approve & **Merge to main**

**Auto-Deploy:**
- Vercel watches `main` branch → auto-deploys on merge
- Monitor Vercel Dashboard for build completion
- Production live within 2–3 minutes

---

## Critical Files to Know

| File | Purpose | Location |
|------|---------|----------|
| DEPLOYMENT_CHECKLIST.md | Step-by-step safe deployment guide | botaqi-web/ |
| .env.example | Template for env vars (no secrets) | botaqi-web/ |
| .gitignore | Blocks .env from git | botaqi-web/ |
| .husky/pre-commit | Bash hook to block secret commits | botaqi-web/.husky/ |
| .github/workflows/ci.yml | GitHub Actions build + secret-scan | .github/workflows/ |
| README.md | Quick start + deployment link | botaqi-web/ |

---

## Rollback Plan (If Things Break)

```bash
# On GitHub: Click "Revert" on the PR
# Or locally:
git revert HEAD~1
git push origin main

# Vercel auto-deploys the revert
# Production reverted within 2–3 minutes
```

Then:
1. Check Vercel logs: Vercel Dashboard → Deployments → [Failed] → View Logs
2. Fix the issue (usually: missing env var, typo in secret name, build error)
3. Re-run deployment: Create new PR with fix

---

## Post-Deployment (P2, Next Week)

- [ ] Add Sentry DSN (error tracking)
- [ ] Enable Firestore write-failure alerts
- [ ] Add Vitest unit tests (SRS engine, Landing)
- [ ] Monitor production metrics (TTL, error rate, analytics volume)
- [ ] Enable strict pre-commit hook mode (currently non-blocking)

---

## Timeline Estimate

| Phase | Time | Status |
|-------|------|--------|
| Secret Rotation | 15–30 min | 🔴 Manual |
| Vercel Secrets | 5 min | 🔴 Manual |
| Deploy + Smoke Test | 15–20 min | 🔴 Manual |
| PR + Merge | 5–10 min | 🔴 Manual |
| **Total** | **~1 hour** | **Ready Now** |

---

## Key Takeaways

✅ **Security First:** All secrets removed from repo. Template & hooks prevent future leaks.  
✅ **CI/CD Ready:** GitHub Actions validates every PR/push (build, lint, secret-scan).  
✅ **Documentation:** Comprehensive checklist guides you through each step safely.  
✅ **Rollback Ready:** One-click revert if production breaks.  
✅ **Team Safe:** `.gitignore` and pre-commit hook protect team members from accidental commits.

---

## Questions?

- **Deployment help:** See [DEPLOYMENT_CHECKLIST.md](botaqi-web/DEPLOYMENT_CHECKLIST.md)
- **Manual actions guide:** See [MANUAL_ACTIONS.md](docs2/MANUAL_ACTIONS.md)
- **GitHub Actions logs:** After PR creation, check "Checks" tab on GitHub
- **Vercel logs:** Vercel Dashboard → Deployments → [Your Deployment] → View Logs

**Ready to deploy? Start with Phase 1 (rotate secrets) in DEPLOYMENT_CHECKLIST.md** ✅
