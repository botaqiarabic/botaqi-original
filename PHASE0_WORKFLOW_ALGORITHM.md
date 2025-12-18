# Phase 0 MVP Workflow Algorithm

## Core User Journey (Study Session Flow)

```
USER → Auth (Clerk) → Dashboard → Select Deck 
  ↓
Load Cards from DB (Supabase/Firebase)
  ↓
SRS Filter: Get due cards (nextReview ≤ now)
  ↓
Practice Loop:
  1. Display card front (question)
  2. User flips → Display card back (answer)
  3. User rates quality (0-5 scale)
  4. SRS Engine:
     - Calculate new ease factor (SM-2 formula)
     - Calculate new interval (next review date)
     - Update repetitions count
  5. Emit telemetry: reviewed_card event
  6. Save review state to DB
  7. Load next card or end session
  ↓
Session End:
  - Emit telemetry: session_started event (with stats)
  - Update user streak/XP
  ↓
Voucher Flow (Optional):
  - User claims voucher from rewards page
  - Emit telemetry: voucher_redeemed event
  - Update user balance
```

## Critical Code Paths (botaqi-web)

### 1. SRS Engine (`src/services/srsEngine.ts`)
- `calculateNextReview(srsData, quality)` → deterministic SM-2 calculation
- `getDueCards(allCards)` → filter by nextReview ≤ now
- Input: prior ease, interval, repetitions, quality (0-5)
- Output: new ease, interval, nextReview date
- **MUST BE**: deterministic (same seed → same output)

### 2. Review Submission (`src/pages/Practice.tsx` or `/api/review`)
- Accept: cardId, quality, sessionId
- Call SRS Engine
- Validate quality ∈ [0, 5]
- Persist to DB
- Emit telemetry

### 3. Session Start
- Create sessionId (UUID)
- Fetch user's deck cards
- Filter due cards via SRS
- Emit session_started telemetry

### 4. Telemetry Events
- Schema: {type, userId, sessionId, timestamp, ...context}
- Events: reviewed_card, session_started, voucher_redeemed
- Destination: POST /api/events (or external service)

## Gaps vs Requirements

| Requirement | Status | Gap | Severity |
|-------------|--------|-----|----------|
| Strict TS (tsconfig) | ✅ Already true | None | - |
| SRS Unit Tests | ❌ Missing | No `srsEngine.test.ts` | P0 |
| SRS Property Tests | ❌ Missing | No fast-check tests | P0 |
| E2E Auth Fixture | ❌ Missing | No Playwright login helper | P1 |
| E2E Study Flow | ❌ Missing | No study-session.spec.ts | P1 |
| Telemetry Service | ❌ Missing | No `lib/telemetry.ts` | P1 |
| Telemetry Emission | ❌ Missing | No calls in Practice/Rewards | P1 |
| CI Gates | ⚠️ Unclear | No .github/workflows/ci.yml | P1 |

## MVP Deployment Checklist

- [ ] npm install succeeds (clean node_modules)
- [ ] `npm run build` succeeds (strict TS, no errors)
- [ ] SRS unit tests pass (>=80% coverage)
- [ ] Manual smoke test: login → deck select → card review → quality submit → next card
- [ ] Telemetry: reviewed_card event emitted to console
- [ ] E2E (optional for MVP): study-session.spec.ts passes locally
- [ ] Deploy to Vercel: `npm run build && npm run vercel-build`
- [ ] Health check: /api/test-sentry returns 200

## Implementation Order (RAD - Parallel Workstreams)

### Stream A (Testing): SRS Tests (30 min)
1. `tests/unit/srsEngine.test.ts` (unit + determinism)
2. `tests/unit/srsEngine.property.test.ts` (fast-check)
3. Run `npm run test:unit` — verify >=80% coverage

### Stream B (Observability): Telemetry (20 min)
1. `src/lib/telemetry.ts` (event service + schema)
2. Wire into Practice.tsx (reviewed_card)
3. Wire into session start (session_started)
4. Test in dev console

### Stream C (CI): GitHub Actions (10 min)
1. `.github/workflows/ci.yml`
2. Gate: lint + test:unit + test:smoke
3. Enable branch protection

### Stream D (Smoke): Manual E2E (15 min)
1. Start dev server: `npm run dev`
2. Login → select deck → review 3 cards → submit quality
3. Verify SRS state updated in DB
4. Check browser console for telemetry events

**Total Time**: 75 min (can parallelize A + B + C, then verify D)

## Rollback Scenarios

- npm install fails: `rm -r node_modules && npm cache clean && npm install --legacy-peer-deps`
- TS build fails: revert tsconfig changes (already strict: true, so skip)
- Test failures: debug with `npm run test:unit -- --reporter=verbose`
- Telemetry spam: disable emit in dev via `if (env.NODE_ENV === 'production') telemetry.emit(...)`
- E2E fails: check auth token, verify Playwright browser installed
