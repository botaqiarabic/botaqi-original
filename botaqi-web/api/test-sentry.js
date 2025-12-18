const { initSentry, captureException, flush } = require('../src/lib/sentry.server.cjs');
const { createServerClient } = require('./lib/supabase-server.cjs');

const sentryOk = initSentry();
const TEST_ERROR_MESSAGE = 'Sentry test error from Vercel /api/test-sentry';

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, reason: 'Method Not Allowed' });
  }

  if (!sentryOk) {
    return res.status(400).json({ ok: false, reason: 'SENTRY_DSN not set' });
  }

  try {
    const supabase = createServerClient();
    const { error: supabaseError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (supabaseError) {
      throw supabaseError;
    }

    captureException(new Error(TEST_ERROR_MESSAGE));
    await flush(3000);
    return res.status(200).json({ ok: true, supabase: 'reachable' });
  } catch (error) {
    captureException(error);
    try {
      await flush(3000);
    } catch (flushError) {
      console.warn('flush failed', flushError);
    }
    return res.status(500).json({ ok: false, reason: error.message || 'internal error' });
  }
};
