#!/usr/bin/env node
import { runPhase0 } from './deploy-core.js';

function parseArgs(argv) {
  const args = { phase: '0', mockMode: false };
  argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--phase=')) args.phase = arg.split('=')[1];
    if (arg === '--mock') args.mockMode = true;
  });
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  try {
    if (args.phase === '0') {
      const summary = await runPhase0({ mockMode: args.mockMode });
      console.log(`Phase 0 completed in ${summary.durationSeconds}s on ${summary.platform.os}`);
      process.exit(0);
    }
    console.error(`Unsupported phase: ${args.phase}`);
    process.exit(4);
  } catch (error) {
    console.error(`Deployment failed: ${error.message}`);
    if (error.details) {
      console.table(error.details.map((r) => ({ id: r.id, status: r.passed ? 'ok' : 'fail', message: r.message })));
    }
    process.exit(error.exitCode ?? 2);
  }
}

main();
