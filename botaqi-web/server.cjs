const path = require('path');
const express = require('express');
const { initSentry, captureException, flush } = require('./src/lib/sentry.server.cjs');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4173;

// Initialize Sentry server-side only if DSN provided
const sentryOk = initSentry();
if (sentryOk) console.log('Sentry initialized for local server');

app.get('/api/test-sentry', async (req, res) => {
  if (!sentryOk) return res.status(400).json({ ok: false, reason: 'SENTRY_DSN not set' });
  try {
    throw new Error('Sentry test error from local server');
  } catch (err) {
    captureException(err);
    try {
      await flush(3000);
    } catch (e) {
      // ignore flush errors
    }
    return res.status(200).json({ ok: true });
  }
});

// Minimal telemetry ingestion endpoint for Phase 3 validation
app.post('/api/telemetry', async (req, res) => {
  try {
    const body = req.body || {};
    // Accept either `eventName` or `type` from clients
    const eventName = typeof body.eventName === 'string' ? body.eventName : (typeof body.type === 'string' ? body.type : null);
    if (!eventName) {
      return res.status(400).json({ ok: false, reason: 'invalid payload' });
    }

    // Persist to a simple JSONL file for end-to-end verification
    const fs = require('fs');
    const p = require('path');
    const out = p.join(__dirname, 'telemetry-server.jsonl');
    const normalized = {
      eventName,
      type: body.type ?? eventName,
      payload: body.payload || {},
      ts: body.ts || new Date().toISOString(),
    };
    fs.appendFileSync(out, JSON.stringify(normalized) + '\n');

    // keep lightweight and non-blocking
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('telemetry ingest failed', err);
    return res.status(500).json({ ok: false, reason: 'internal error' });
  }
});

// Lightweight status endpoint: checks Supabase auth env and DB reachability
app.get('/api/status', async (req, res) => {
  const result = {
    ok: true,
    auth: { ok: false, reason: null },
    db: { ok: false, reason: null },
    sentry: { ok: false, reason: null }
  };

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;

  if (!supabaseUrl || !supabaseKey) {
    result.auth.ok = false;
    result.auth.reason = 'missing_env';
  } else {
    // try a simple fetch to the Supabase base URL to verify network reachability
    try {
      if (typeof fetch === 'function') {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000);
        const r = await fetch(supabaseUrl, {
          method: 'GET',
          headers: { Authorization: `Bearer ${supabaseKey}`, apikey: supabaseKey },
          signal: controller.signal
        });
        clearTimeout(id);
        // If we got any response, mark auth/network reachable. 401/403 likely indicate auth issues
        if (r.status >= 200 && r.status < 400) {
          result.auth.ok = true;
        } else if (r.status === 401 || r.status === 403) {
          result.auth.ok = false;
          result.auth.reason = `unauthorized:${r.status}`;
        } else {
          result.auth.ok = true; // reachable but unexpected status
        }
      } else {
        // no fetch available in this runtime; report env presence only
        result.auth.ok = true;
      }
    } catch (e) {
      result.auth.ok = false;
      result.auth.reason = 'network_error';
    }
  }

  // Sentry diagnostic (initialized earlier)
  try {
    if (sentryOk) {
      result.sentry.ok = true;
    } else {
      result.sentry.ok = false;
      result.sentry.reason = 'dsn_missing';
    }
  } catch (e) {
    result.sentry.ok = false;
    result.sentry.reason = 'error_checking_sentry';
  }

  // DB check: prefer doing a simple SELECT using `pg` if installed; otherwise fall back to TCP connect
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.SUPABASE_DB_CONN || null;
  if (!dbUrl) {
    result.db.ok = false;
    result.db.reason = 'no_db_env';
  } else {
    let didCheck = false;
    // Try SQL SELECT using pg
    try {
      const { Client } = require('pg');
      const client = new Client({ connectionString: dbUrl, statement_timeout: 2000, connectionTimeoutMillis: 2000 });
      await client.connect();
      const rr = await client.query('SELECT 1 as ok');
      await client.end();
      if (rr && rr.rows && rr.rows.length > 0) {
        result.db.ok = true;
        didCheck = true;
      }
    } catch (e) {
      // pg not installed or query failed — we'll fallback to TCP probe
      didCheck = false;
    }

    if (!didCheck) {
      try {
        const { URL } = require('url');
        const u = new URL(dbUrl);
        const net = require('net');
        const host = u.hostname;
        const port = parseInt(u.port || '5432', 10);
        await new Promise((resolve, reject) => {
          const s = new net.Socket();
          const to = setTimeout(() => {
            s.destroy();
            reject(new Error('timeout'));
          }, 1500);
          s.once('error', (err) => {
            clearTimeout(to);
            reject(err);
          });
          s.connect(port, host, () => {
            clearTimeout(to);
            s.end();
            resolve();
          });
        });
        result.db.ok = true;
      } catch (e) {
        result.db.ok = false;
        result.db.reason = 'unreachable';
      }
    }
  }

  // overall ok if either auth or db are OK; keep compatibility with simple clients
  result.ok = (result.auth.ok || result.db.ok);
  return res.status(200).json(result);
});

const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir, { index: false }));
app.use((req, res) => res.sendFile(path.join(distDir, 'index.html')));

app.listen(PORT, () => console.log(`Local server + API running: http://127.0.0.1:${PORT}`));
