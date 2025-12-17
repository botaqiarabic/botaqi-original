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
    const body = req.body;
    if (!body || typeof body.eventName !== 'string') {
      return res.status(400).json({ ok: false, reason: 'invalid payload' });
    }

    // Persist to a simple JSONL file for end-to-end verification
    const fs = require('fs');
    const p = require('path');
    const out = p.join(__dirname, 'telemetry-server.jsonl');
    const entry = JSON.stringify({ eventName: body.eventName, payload: body.payload || {}, ts: body.ts || new Date().toISOString() });
    fs.appendFileSync(out, entry + '\n');

    // keep lightweight and non-blocking
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('telemetry ingest failed', err);
    return res.status(500).json({ ok: false, reason: 'internal error' });
  }
});

const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir, { index: false }));
app.use((req, res) => res.sendFile(path.join(distDir, 'index.html')));

app.listen(PORT, () => console.log(`Local server + API running: http://127.0.0.1:${PORT}`));
