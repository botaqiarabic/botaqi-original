# 🚀 PHASE 0 MVP DEPLOYMENT CHECKLIST

## ✅ Status: READY TO DEPLOY

**botaqi-web** is fully functional and ready for production deployment.

---

## 📋 Pre-Flight Checks (Complete These)

### 1. Local Build Verification (2 min)
```bash
cd botaqi-web

# Check if dist/ exists with assets
ls dist/index.html dist/assets/

# Expected output:
# dist/index.html
# dist/assets/index-*.js
# dist/assets/index-*.css
```

✅ **Status**: `dist/` exists with compiled assets

---

### 2. Type Check (1 min)
```bash
cd botaqi-web
npx tsc -b --noEmit 2>&1
```

✅ **Expected**: No errors (strict mode enabled)

---

### 3. Code Review
- ✅ SRS Engine: `src/services/srsEngine.ts` (SM-2 algorithm, deterministic)
- ✅ Practice Flow: `src/pages/Practice.tsx` (card review, quality submit)
- ✅ Auth: Clerk integration ready
- ✅ Styles: Tailwind CSS configured

---

## 🚀 DEPLOYMENT OPTIONS

### **Option A: Fast Deploy Using Existing Build (RECOMMENDED)**
```bash
cd botaqi-web

# Method 1: Vercel CLI
npx vercel deploy --prod --prebuilt

# Method 2: Vercel Dashboard
# 1. Go to https://vercel.com/dashboard
# 2. Select "botaqi-web" project
# 3. Click "Deploy" → select main branch
# 4. Trigger manual deploy
```

**Time**: 2 minutes | **Risk**: Very Low

---

### **Option B: Fresh Build + Deploy (If Changes Made)**
```bash
cd botaqi-web

# Install dependencies (may timeout on Windows - use legacy-peer-deps)
npm install --legacy-peer-deps --no-audit

# Build fresh
npm run build

# Deploy
npm run vercel-build
# or
npx vercel deploy --prod
```

**Time**: 5-10 minutes | **Risk**: Medium (npm install can fail)

---

### **Option C: CI/CD Automatic (Recommended Long-Term)**
```bash
# Simply push to main branch
git add .
git commit -m "Phase 0 MVP: Ready for production"
git push origin main

# GitHub Actions ci.yml will:
# 1. Run lint checks
# 2. Run TS type check
# 3. Build dist/
# 4. Deploy to Vercel automatically
# 5. Run health check
```

**Time**: 5 minutes (automated) | **Risk**: Low

---

## ✅ Post-Deployment Validation

### 1. Health Check
```bash
# Replace DOMAIN with your Vercel domain
curl -I https://botaqi-web-git-main-yourorg.vercel.app/
# Expected: HTTP 200

curl https://botaqi-web-git-main-yourorg.vercel.app/api/test-sentry
# Expected: response with Sentry info
```

### 2. Functional Test (Manual)
1. Open https://botaqi-web-...vercel.app/
2. Login with test account
3. Select a deck
4. Click "Practice"
5. Flip a card (should show answer)
6. Click quality rating (0-5)
7. Verify next card loads
8. ✅ If all work → **DEPLOYMENT SUCCESSFUL**

### 3. Monitor Sentry
- Go to https://sentry.io/organizations/yourorg/
- Check for errors in last 30 min
- Expected: 0 critical errors

---

## 📊 What's Deployed

| Component | Status |
|-----------|--------|
| Frontend UI | ✅ React + TypeScript (strict) |
| SRS Engine | ✅ Deterministic SM-2 algorithm |
| Practice Workflow | ✅ Complete (flip, rate, save) |
| Auth Integration | ✅ Clerk configured |
| API Integration | ✅ Supabase/Firebase ready |
| Error Tracking | ✅ Sentry instrumented |
| Build Optimization | ✅ Vite bundled, minified |
| CSS Framework | ✅ Tailwind CSS v4 |

---

## 🔧 Rollback Instructions (If Needed)

### Rollback to Previous Deploy
```bash
# Method 1: Vercel CLI
cd botaqi-web
vercel rollback

# Method 2: Vercel Dashboard
# 1. Go to Deployments tab
# 2. Find previous stable deployment
# 3. Click "Promote to Production"
```

### Immediate Fallback
- Revert last commit: `git revert <commit-hash>`
- Push to main → CI/CD redeploys automatically

---

## 📞 Support

### If Build Fails
```bash
# Check logs
cd botaqi-web
npm run build

# Common fix: clear cache
rm -rf .next .vercel dist/
npm cache clean --force
npm install --legacy-peer-deps
npm run build
```

### If Deploy Fails
1. Check Vercel logs: https://vercel.com/dashboard/botaqi-web/deployments
2. Verify env vars are set (if using API)
3. Check bandwidth/quotas
4. Contact Vercel support

### If Functional Test Fails
1. Check browser console for errors (F12)
2. Check Sentry dashboard for crash reports
3. Verify auth token (try logout/login)
4. Check database connectivity (check Supabase/Firebase dashboard)

---

## ✨ Next Steps (Post-MVP)

1. **Phase 1**: Add unit tests + E2E tests to botaqi-web
2. **Phase 1**: Wire telemetry events (reviewed_card, session_started)
3. **Phase 1**: Set up SLO dashboards + alerts
4. **Phase 2**: Implement canary rollout strategy
5. **Phase 2**: Add chaos/resilience tests

---

## 🎯 Success Criteria

- ✅ Deployment completes without errors
- ✅ Health check returns 200
- ✅ Login → Practice → Review workflow works end-to-end
- ✅ No errors in Sentry dashboard
- ✅ Latency p95 < 300ms (Vercel analytics)

---

**🎉 Phase 0 Complete. Ready for Deployment.**

*For questions: See PHASE0_MVP_DEPLOYMENT_STATUS.md or IMPLEMENTATION_PLAN_SRS_TS.md*
