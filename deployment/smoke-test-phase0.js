import { runPhase0 } from './deploy-core.js';

async function main() {
  try {
    const summary = await runPhase0({
      mockMode: true,
      skipChecks: ['git', 'cli', 'serviceAccount', 'openai', 'vercel'],
    });
    console.log('Phase 0 smoke test (mock mode) passed.');
    console.table(summary.results.map((r) => ({ id: r.id, status: r.passed ? 'ok' : 'fail', message: r.message })));
    process.exit(0);
  } catch (error) {
    console.error('Phase 0 smoke test failed:', error.message);
    if (error.details) {
      console.table(error.details.map((r) => ({ id: r.id, status: r.passed ? 'ok' : 'fail', message: r.message })));
    }
    process.exit(error.exitCode ?? 2);
  }
}

main();
