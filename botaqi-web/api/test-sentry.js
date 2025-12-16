const { initSentry, captureException, flush } = require('../src/lib/sentry.server.cjs');

// Initialize Sentry for function execution (no-op if DSN missing)
const sentryOk = initSentry();

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, reason: 'Method Not Allowed' });
  }

  if (!sentryOk) return res.status(400).json({ ok: false, reason: 'SENTRY_DSN not set' });

  try {
    // synthetic error to verify Sentry capture from serverless environment
    throw new Error('Sentry test error from Vercel function');
  } catch (err) {
    try {
      captureException(err);
      // attempt to flush before returning to increase chance events are sent
      await flush(3000);
    } catch (e) {
      // swallow flush errors — function should still respond
    }
    return res.status(200).json({ ok: true });
  }
};
// Serverless API route to validate server-side Sentry capturing.
const { initSentry, captureException, flush } = require('../src/lib/sentry.server.cjs');

module.exports = async function handler(req, res) {
  const ok = initSentry();
  if (!ok) {
    return res.status(400).json({ ok: false, reason: 'SENTRY_DSN not set' });
  }
  try {
    // Intentionally throw to validate capture and flush
    throw new Error('Botaqi test error from /api/test-sentry');
  } catch (err) {
    captureException(err);
    // flush to ensure the event is sent before returning
    try {
      await flush(3000);
    } catch (e) {
      // ignore flush errors
    }
    return res.status(200).json({ ok: true });
  }
};
