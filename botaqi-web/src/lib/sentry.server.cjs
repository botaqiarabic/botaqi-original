/* Server-only Sentry initializer (CommonJS)
   Use from serverless API routes only. No client bundling.
*/
const Sentry = require('@sentry/node');
let ProfilingIntegration;
try {
  ProfilingIntegration = require('@sentry/profiling-node').ProfilingIntegration;
} catch (e) {
  ProfilingIntegration = null;
}

let _initialized = false;

function initSentry(opts = {}) {
  if (_initialized) return true;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return false; // caller should handle absence
  const integrations = [];
  if (ProfilingIntegration) integrations.push(new ProfilingIntegration());
  Sentry.init(Object.assign({
    dsn,
    integrations,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
    profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE || 0.1),
  }, opts));
  _initialized = true;
  return true;
}

function captureException(err) {
  if (!_initialized) return false;
  return Sentry.captureException(err);
}

function flush(timeout = 2000) {
  if (!_initialized) return Promise.resolve(true);
  return Sentry.flush(timeout);
}

module.exports = { initSentry, captureException, flush };
