# Botaqi — Quick Start Guide

## Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   Opens on http://localhost:5173

3. **Build for Production:**
   ```bash
   npm run build
   ```
   Output: `dist/`

## Deployment (Vercel)

**⚠️ CRITICAL BEFORE DEPLOYING:**  
Read and follow [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) to safely rotate secrets, provision Vercel env vars, and run smoke tests.

### Quick Reference
1. **Rotate secrets** (OpenAI key + LOGBLOCKED_API_KEY) — 15 min
2. **Provision Vercel secrets** (3 env vars: Firebase Admin, OpenAI, LOGBLOCKED) — 5 min
3. **Deploy:** `vercel --prod` — 3 min
4. **Smoke test:** Verify landing page + analytics + API endpoints — 5 min

For detailed step-by-step guide, see **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** (covers all phases: secret rotation, history purge, Vercel setup, testing, rollback)

## Project Structure

```
botaqi-web/
├── src/
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── client.ts      (Firebase initialization)
│   │   │   ├── auth.ts        (useAuth hook)
│   │   │   └── analytics.ts   (logEvent wrapper)
│   │   └── srsEngine.ts       (SM-2 algorithm)
│   ├── pages/                 (Routes: Dashboard, Profile, etc.)
│   ├── components/            (Reusable UI components)
│   ├── Landing.tsx            (Landing page)
│   └── App.tsx                (Main router)
├── docs/
│   └── auth-setup.md          (Firebase setup guide)
├── package.json
├── .nvmrc                     (Node version: 20)
└── vercel.json               (Vercel routing config)
```

## Key Technologies

- **Frontend:** React 18, Vite, TypeScript
- **Database:** Firebase (Firestore)
- **Auth:** Firebase Authentication
- **Deployment:** Vercel Serverless Functions
- **Styling:** Tailwind CSS v4, Radix UI components

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint checks |
| `npm run preview` | Preview production build locally |
| `npm test` | Run tests (pending) |

## Support & Documentation

- [Firebase Setup](./docs/auth-setup.md) — Configure authentication & Firestore
- [SRS Algorithm](./src/lib/srsEngine.ts) — Spaced repetition system
- [Deployment](./DEPLOY.md) — One-line Vercel deploy

## Next Steps

1. ✅ Install & build locally (`npm install && npm run build`)
2. ✅ Set up Firebase project
3. ⏳ Deploy to Vercel (`vercel --prod`)
4. ⏳ Configure analytics & monitoring
5. ⏳ Add user feedback loop

---

**Node Version:** >= 20 (see `.nvmrc`)  
**Last Updated:** Dec 15, 2025
