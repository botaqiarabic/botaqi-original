# 🚀 QUICK START - botaqi-web DEPLOYMENT

## ⚡ TL;DR (Do This Now)

### Option 1: One-Command Deploy (RECOMMENDED)
```bash
cd botaqi-web
npx vercel deploy --prod --prebuilt
```
✅ **Time**: 2 minutes | Uses existing dist/

---

### Option 2: Fresh Build Deploy
```bash
cd botaqi-web
npm install --legacy-peer-deps
npm run build
npm run vercel-build
```
✅ **Time**: 5-10 minutes | Full rebuild

---

### Option 3: Auto Deploy via Git
```bash
git push origin main
```
✅ **Time**: 5 minutes (automated) | GitHub Actions handles it

---

## ✅ What's Included

| Item | Status |
|------|--------|
| Strict TypeScript | ✅ Enforced |
| SRS Algorithm | ✅ Deterministic |
| Unit Tests | ✅ Passing (gulfara) |
| CI/CD Pipeline | ✅ Active |
| Pre-built dist/ | ✅ Ready |
| Vercel Config | ✅ Ready |

---

## 📋 Pre-Deploy Checklist

```bash
# 1. Verify build exists
ls botaqi-web/dist/index.html  # Should exist

# 2. Type check (optional)
cd botaqi-web && npx tsc -b --noEmit  # Should pass

# 3. Ready to deploy? YES ✅
```

---

## 🎯 After Deploy

1. **Wait 2-3 minutes** for Vercel build
2. **Check deployment**: Vercel dashboard
3. **Test manually**: 
   - Open https://your-vercel-domain/
   - Login → Practice → Flip card → Submit quality
4. **Verify health**: Sentry dashboard (check for errors)

---

## 🔥 If Something Goes Wrong

### Rollback (Instant)
```bash
cd botaqi-web
vercel rollback
```

### Check Logs
- Vercel: https://vercel.com/dashboard/botaqi-web/deployments
- Sentry: https://sentry.io/organizations/yourorg/

### Nuclear Option
```bash
git revert <bad-commit>
git push origin main
# CI automatically redeploys
```

---

## 📚 Documentation

- **Full Deployment Guide**: `DEPLOYMENT_INSTRUCTIONS.md`
- **Status & Architecture**: `PHASE0_MVP_DEPLOYMENT_STATUS.md`
- **Workflow Algorithm**: `PHASE0_WORKFLOW_ALGORITHM.md`
- **Completion Summary**: `PHASE0_COMPLETION_SUMMARY.md`

---

**Go Deploy! 🚀**
