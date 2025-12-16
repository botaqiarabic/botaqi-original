# Supabase Setup Guide for Botaqi

**Objective:** Provision Supabase PostgreSQL database and apply schema so the app can store and serve user data, flashcards, and learning analytics.

---

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **New Project**
4. Fill in:
   - **Project name:** `botaqi-prod` (or similar)
   - **Database password:** Generate a strong password (save it securely)
   - **Region:** Choose closest to your users (e.g., `us-east-1`)
5. Click **Create new project** and wait ~2 minutes for provisioning

---

## 2. Retrieve Credentials

Once the project is ready:

1. Navigate to **Project Settings** → **API**
2. Copy and save these three values (keep them private):
   - **Project URL**: `https://xxxxxxxxxxxx.supabase.co`
   - **anon key** (public, safe for client): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key** (secret, server-only): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 3. Apply Database Schema

### Option A: Using Supabase SQL Editor (Easiest)

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of [db/supabase-schema.sql](../db/supabase-schema.sql)
4. Paste into the query editor
5. Click **Run** (green button, top-right)
6. Verify success: all tables created without errors

**Next steps:** Skip to Section 4 (Seed Data).

### Option B: Using `psql` CLI (Advanced)

If you have PostgreSQL installed locally:

```bash
# Get your Supabase connection string from Project Settings → Database
# Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

psql postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres < botaqi-web/db/supabase-schema.sql
```

---

## 4. Seed Flashcard Data

### Core Tables Setup

1. **Create a Deck (optional)**
   - Go to **Table Editor** → **decks**
   - Click **Insert row**
   - Add:
     - `slug`: `core-arabic`
     - `title`: `Core Arabic Flashcards`
     - `description`: `Essential vocabulary for Arabic learners`

2. **Add Flashcard Categories**
   - Go to **Table Editor** → cards
   - For each category in [src/content/flashcards.json](../src/content/flashcards.json), insert rows with:
     - `deck_id`: ID from step 1 (or use `1` if auto-assigned)
     - `front`: Arabic word/phrase
     - `back`: English translation
     - `example`: Example sentence
     - `hint`: Learning hint (optional)

**Alternative:** Use a bulk insert script (if you have Node.js):
```bash
cd botaqi-web
npm run seed  # (if seed script exists in package.json)
```

---

## 5. Enable Row Level Security (RLS)

For production, enable RLS to ensure users can only access their own data:

1. Go to **SQL Editor**
2. Click **New Query**
3. Paste the RLS policy block from [db/supabase-schema.sql](../db/supabase-schema.sql) (search for "Row Level Security")
4. Click **Run**

This ensures:
- Users can only view their own SRS data
- Users cannot access other users' progress
- Public tables (decks, cards) remain readable

---

## 6. Verify Schema Integrity

**In Supabase Table Editor:**

Confirm these tables exist:
- [ ] `users` — Clerk-mapped user records
- [ ] `decks` — Flashcard collections
- [ ] `cards` — Individual flashcards
- [ ] `srs_data` — Spaced-repetition data per user/card
- [ ] `user_progress` — User points, level, badges
- [ ] `user_api_usage` — API cost tracking
- [ ] `vouchers` — Reward system (optional)

---

## 7. Add Supabase Envs to Vercel

Once schema is applied and verified:

1. **In Vercel project dashboard:**
   - Go to **Settings** → **Environment Variables**
   - Click **Add new** for each:

| Key | Value | Scope |
|-----|-------|-------|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Production |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (anon key) | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (service_role key) | Production |

2. Also add existing secrets (if not already present):
   - `SENTRY_DSN`
   - `FIREBASE_ADMIN_KEY`
   - `OPENAI_API_KEY`
   - `LOGBLOCKED_API_KEY`

3. Click **Save** and redeploy

---

## 8. Test Connectivity

After redeploying, test Supabase connectivity:

```bash
# Optional: Run a quick health check
curl -H "Authorization: Bearer <VITE_SUPABASE_ANON_KEY>" \
  https://your-vercel-url/api/check-supabase

# Or test via CLI (if you have Node):
npm run test:db
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Password authentication failed" | Double-check DB password and connection string in Supabase settings |
| "relation 'users' does not exist" | Schema not applied. Re-run `supabase-schema.sql` in SQL Editor |
| "permission denied for schema public" | Check RLS policies; ensure auth role has correct permissions |
| Vercel build fails with "SUPABASE_URL undefined" | Verify env vars in Vercel **Production** scope (not Preview) |

---

## Next Steps

- **Deploy:** Run `npx vercel --prod --yes --cwd botaqi-web` from root
- **Validate:** Test `/api/test-sentry`, `/api/check-env`, SPA routes
- **Monitor:** Check Vercel function logs for errors
- **Edge Functions:** Once core deployment is stable, add Edge Functions for backend features (user auth, card generation, etc.)

---

**Questions?** Refer to [Supabase docs](https://supabase.com/docs) or [botaqi-web README](../README.md).
