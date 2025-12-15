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
