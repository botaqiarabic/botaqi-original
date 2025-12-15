# Deployment Guide (Botaqi)

## 1. Prerequisites
*   Vercel CLI installed: `npm i -g vercel`
*   Firebase project set up (see `docs/auth-setup.md`)

## 2. One-Line Deploy
Run this from the `botaqi-web` directory:

```bash
vercel --prod
```

## 3. Environment Variables (Vercel)
Add these in Vercel Project Settings > Environment Variables:

*   `VITE_FIREBASE_API_KEY`
*   `VITE_FIREBASE_AUTH_DOMAIN`
*   `VITE_FIREBASE_PROJECT_ID`
*   `VITE_FIREBASE_STORAGE_BUCKET`
*   `VITE_FIREBASE_MESSAGING_SENDER_ID`
*   `VITE_FIREBASE_APP_ID`
*   `VITE_FIREBASE_MEASUREMENT_ID`

## 4. Post-Deploy Verification
1.  Visit the production URL.
2.  Check console for "Analytics initialized".
3.  Click "Login" -> Verify Google Auth popup appears.
4.  Check Firestore `landing_analytics` collection for new `page_view` event.
