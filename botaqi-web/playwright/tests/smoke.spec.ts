import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __testDir = path.dirname(fileURLToPath(import.meta.url));

test('practice emits telemetry events', async ({ page }) => {
  // Ensure feature flag for metrics is enabled in the test environment
  await page.addInitScript(() => {
    (window as any).__FEATURE_FLAGS__ = Object.assign({}, (window as any).__FEATURE_FLAGS__ || {}, { 'metrics-collection': true });
  });

  await page.goto('/');

  // Client-side navigate to /practice (avoid server 404 by using history API)
  await page.evaluate(() => {
    history.pushState({}, '', '/practice');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

  // Wait for the practice UI to render by waiting for the Correct button
  // Use the green button class to avoid ambiguous matches in localized UI
  const correctBtn = page.locator('button.bg-green-100');
  await expect(correctBtn.first()).toBeVisible({ timeout: 10000 });

  // small delay to allow session_started to fire
  await page.waitForTimeout(300);

  // Click the correct button to trigger a reviewed_card
  await correctBtn.first().click();

  // Wait a short while for the server to ingest telemetry
  await page.waitForTimeout(500);

  // Read server-side telemetry file written by server.cjs
  const candidates = [
    path.join(process.cwd(), 'telemetry-server.jsonl'),
    path.join(process.cwd(), 'botaqi-web', 'telemetry-server.jsonl'),
    path.join(process.cwd(), '..', 'botaqi-web', 'telemetry-server.jsonl'),
    path.join(__testDir, '..', '..', 'telemetry-server.jsonl'),
  ];

  let lines: string[] = [];
  const start = Date.now();
  while (Date.now() - start < 5000) {
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        const content = fs.readFileSync(candidate, 'utf8').trim();
        if (content) {
          lines = content.split(/\r?\n/).filter(Boolean);
          break;
        }
      }
    }
    if (lines.length) break;
    await new Promise(r => setTimeout(r, 100));
  }

  expect(lines.length).toBeGreaterThanOrEqual(2);
  const events = lines.map(l => JSON.parse(l));
  const names = events.map(e => e.eventName || e.type).filter(Boolean).sort();
  expect(names).toContain('session_started');
  expect(names).toContain('reviewed_card');

  // Persist telemetry events as a test artifact for verification
  try {
    const outDir = path.join(process.cwd(), 'test-results');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'telemetry-events.json'), JSON.stringify(telemetryEvents, null, 2));
  } catch (e) {
    // ignore artifact write failures
  }
});
