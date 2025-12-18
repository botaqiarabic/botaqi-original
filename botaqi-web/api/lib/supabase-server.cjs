// Server-safe Supabase helper used by Vercel APIs to read the service-role key from process.env.
const { createClient } = require('@supabase/supabase-js');

function createServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined for server Supabase client.');
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

module.exports = { createServerClient };
