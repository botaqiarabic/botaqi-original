
# Service Account Setup & Phase‑1 Dry‑Run (botaqi‑web)


# 1) Put service-account.json into botaqi-web (adjust source path if needed)
Copy-Item "C:\path\to\service-account.json" "C:\Users\muzam\Projects\Gulfara\botaqi-web\service-account.json"

# 2) Encode service-account.json to base64 and set for current session
cd C:\Users\muzam\Projects\Gulfara\botaqi-web
$b64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content .\service-account.json -Raw)))
$env:FIREBASE_ADMIN_KEY = $b64

# (optional) persist persistently for new shells (use with caution)
#setx FIREBASE_ADMIN_KEY $b64

# 3) Set other required env vars in this shell (replace placeholders)
$env:VERCEL_TOKEN = "<YOUR_VERCEL_TOKEN>"
$env:VERCEL_PROJECT_ID = "<YOUR_VERCEL_PROJECT_ID>"
$env:SENTRY_AUTH_TOKEN = "<YOUR_SENTRY_AUTH_TOKEN>"
$env:SENTRY_ORG = "<YOUR_SENTRY_ORG_SLUG>"
$env:SENTRY_PROJECT = "<YOUR_SENTRY_PROJECT_SLUG>"

# 4) Run Phase‑1 dry-run (from deployment folder)
cd ..\deployment
npm install --no-audit --no-fund
npm run deploy:phase1 -- --dry-run

# 5) If dry-run passes, run the real deploy:
# npm run deploy:phase1

# 6) Cleanup sensitive vars in current session after use
Remove-Item Env:\FIREBASE_ADMIN_KEY -ErrorAction SilentlyContinue
Remove-Item Env:\VERCEL_TOKEN -ErrorAction SilentlyContinue
Remove-Item Env:\SENTRY_AUTH_TOKEN -ErrorAction SilentlyContinue

# (optional) remove persistent setx value if you used it:
#setx FIREBASE_ADMIN_KEY ""