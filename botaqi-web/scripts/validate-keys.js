const fs = require('fs');
const path = require('path');

function parseEnv(content) {
  const lines = content.split(/\r?\n/);
  const res = {};
  for (const l of lines) {
    const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) res[m[1]] = m[2];
  }
  return res;
}

function checkBase64(s) {
  return /^[A-Za-z0-9+/=]+$/.test(s) && s.length >= 40;
}

function main() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env not found at', envPath);
    process.exit(2);
  }
  const raw = fs.readFileSync(envPath, 'utf8');
  const env = parseEnv(raw);

  const results = [];

  // OPENAI_API_KEY
  const openai = env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY || env.OPENAI_KEY;
  if (!openai) {
    results.push(['OPENAI_API_KEY', false, 'missing']);
  } else if (!/^sk-/.test(openai)) {
    results.push(['OPENAI_API_KEY', false, 'invalid format (does not start with sk-)']);
  } else {
    results.push(['OPENAI_API_KEY', true, `found (length ${openai.length})`]);
  }

  // LOGBLOCKED_API_KEY
  const logKey = env.LOGBLOCKED_API_KEY || env.LOG_BLOCKED_API_KEY || env.LOGBLOCKED_KEY;
  if (!logKey) {
    results.push(['LOGBLOCKED_API_KEY', false, 'missing']);
  } else if (!/^[A-Za-z0-9+/=]{16,}$/.test(logKey)) {
    results.push(['LOGBLOCKED_API_KEY', false, 'invalid format']);
  } else {
    results.push(['LOGBLOCKED_API_KEY', true, `found (length ${logKey.length})`]);
  }

  // FIREBASE_ADMIN_KEY (base64)
  const fbAdmin = env.FIREBASE_ADMIN_KEY || env.FIREBASE_ADMIN || env.FIREBASE_SERVICE_ACCOUNT;
  if (!fbAdmin) {
    results.push(['FIREBASE_ADMIN_KEY', false, 'missing']);
  } else if (!checkBase64(fbAdmin)) {
    results.push(['FIREBASE_ADMIN_KEY', false, 'invalid base64 or too short']);
  } else {
    results.push(['FIREBASE_ADMIN_KEY', true, `found (base64 length ${fbAdmin.length})`]);
  }

  // Print summary
  console.log('Validation results for', envPath);
  let ok = true;
  for (const [key, passed, msg] of results) {
    console.log(`${passed ? '✓' : '✗'} ${key}: ${msg}`);
    if (!passed) ok = false;
  }

  if (!ok) {
    console.error('\nOne or more checks failed. Follow DEPLOYMENT_CHECKLIST.md Phase 1 instructions to rotate and place keys into .env (local).');
    process.exit(3);
  }

  console.log('\nAll Phase 1 key presence & format checks passed. Local testing (network calls) is still recommended as next step.');
  process.exit(0);
}

main();
