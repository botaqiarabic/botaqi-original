// Verifies critical server secrets for builds and API smoke checks.
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SENTRY_DSN'
];

const optional = [
  'OPENAI_API_KEY',
  'FIREBASE_ADMIN_KEY',
  'LOGBLOCKED_API_KEY'
];

const missingRequired = required.filter((key) => !process.env[key]?.trim());
const missingOptional = optional.filter((key) => !process.env[key]?.trim());

if (missingRequired.length) {
  console.error('Missing required environment variables:', missingRequired.join(', '));
  console.error('Set them via .env.local for local runs or provision them in production secrets.');
  process.exit(1);
}

if (missingOptional.length) {
  console.warn('Optional secrets not set:', missingOptional.join(', '));
  console.warn('These help keep server routes (logBlocked, Sentry) functional when deployed.');
}

console.log('Environment verification succeeded; required secrets are present.');
