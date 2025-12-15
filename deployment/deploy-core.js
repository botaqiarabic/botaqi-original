import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { exec as execCb } from 'child_process';
import crypto from 'crypto';
import { GoogleAuth } from 'google-auth-library';
import { detectPlatform, commandExists } from './platform-detector.js';

const exec = promisify(execCb);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const frontendRoot = path.join(workspaceRoot, 'botaqi-web');
const logDir = path.join(__dirname, 'logs');

function ensureLogDir() {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

export class DeploymentError extends Error {
  constructor(message, exitCode = 2, details) {
    super(message);
    this.name = 'DeploymentError';
    this.exitCode = exitCode;
    this.details = details;
  }
}

export class RollbackManager {
  constructor(label = 'phase0') {
    ensureLogDir();
    this.label = label;
    this.stack = [];
    this.logFile = path.join(logDir, `${label}-${Date.now()}.log`);
    this.append(`RollbackManager initialized for ${label}`);
  }

  append(message) {
    fs.appendFileSync(this.logFile, `[${new Date().toISOString()}] ${message}\n`);
  }

  register(operation, rollback) {
    this.append(`Registered operation: ${operation}`);
    this.stack.push({ operation, rollback });
  }

  async safeExec(operation, fn, rollback = async () => {}) {
    this.register(operation, rollback);
    try {
      const result = await fn();
      this.append(`Operation succeeded: ${operation}`);
      return result;
    } catch (error) {
      this.append(`Operation failed: ${operation} -> ${error.message}`);
      await this.rollback(`Failure during ${operation}`);
      throw error;
    }
  }

  async rollback(reason = 'requested') {
    this.append(`Rollback initiated: ${reason}`);
    while (this.stack.length) {
      const { operation, rollback } = this.stack.pop();
      try {
        await rollback();
        this.append(`Rolled back: ${operation}`);
      } catch (error) {
        this.append(`Rollback error (${operation}): ${error.message}`);
      }
    }
  }
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function checkNodeVersion(minVersion = '18.18.0') {
  const current = process.versions.node;
  const ok = compareVersions(current, minVersion) >= 0;
  return { passed: ok, message: ok ? `Node version ${current}` : `Node ${current} < ${minVersion}` };
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

async function checkPackageManifest() {
  const pkgPath = path.join(frontendRoot, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return { passed: false, message: `Missing package.json at ${pkgPath}` };
  }
  const pkg = readJSON(pkgPath);
  const requiredScripts = ['build', 'dev'];
  const missing = requiredScripts.filter((script) => !pkg.scripts?.[script]);
  if (missing.length) {
    return { passed: false, message: `Missing scripts: ${missing.join(', ')}` };
  }
  return { passed: true, message: 'package.json present with build/dev scripts' };
}

async function checkCliAvailability() {
  const binaries = ['firebase', 'vercel', 'sentry-cli'];
  const missing = binaries.filter((bin) => !commandExists(bin));
  if (missing.length) {
    return { passed: false, message: `Missing CLI tool(s): ${missing.join(', ')}` };
  }
  return { passed: true, message: 'Firebase/Vercel/Sentry CLI detected' };
}

async function verifyServiceAccount(mockMode = false) {
  const key = process.env.FIREBASE_ADMIN_KEY;
  if (!key) {
    return { passed: false, message: 'FIREBASE_ADMIN_KEY env missing' };
  }
  let json;
  try {
    json = JSON.parse(Buffer.from(key, 'base64').toString('utf8'));
  } catch (error) {
    return { passed: false, message: `Unable to decode FIREBASE_ADMIN_KEY: ${error.message}` };
  }
  const required = ['client_email', 'private_key', 'project_id'];
  const missing = required.filter((field) => !json[field]);
  if (missing.length) {
    return { passed: false, message: `Service account missing fields: ${missing.join(', ')}` };
  }
  if (mockMode) {
    return { passed: true, message: 'Service account decoded (mock mode)' };
  }
  try {
    const auth = new GoogleAuth({
      credentials: json,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    await client.request({ url: 'https://firestore.googleapis.com/v1/projects' });
    return { passed: true, message: 'Service account authenticated via Google API' };
  } catch (error) {
    return { passed: false, message: `Service account auth failed: ${error.message}` };
  }
}

async function verifyOpenAIKey(mockMode = false) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { passed: false, message: 'OPENAI_API_KEY env missing' };
  if (!key.startsWith('sk-')) {
    return { passed: false, message: 'OPENAI_API_KEY format invalid' };
  }
  if (mockMode) {
    return { passed: true, message: 'OpenAI key format validated (mock mode)' };
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('https://api.openai.com/v1/models?limit=1', {
      headers: { Authorization: `Bearer ${key}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return { passed: false, message: `OpenAI API responded ${res.status}` };
    }
    return { passed: true, message: 'OpenAI API reachable' };
  } catch (error) {
    return { passed: false, message: `OpenAI connectivity failed: ${error.message}` };
  }
}

async function verifyVercelLink(mockMode = false) {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_NAME;
  if (!token) return { passed: false, message: 'VERCEL_TOKEN env missing' };
  if (!projectId) return { passed: false, message: 'VERCEL_PROJECT_ID (or NAME) env missing' };
  if (mockMode) {
    return { passed: true, message: `Vercel credentials present for ${projectId} (mock mode)` };
  }
  try {
    const { default: VercelClient } = await import('@vercel/client');
    const client = new VercelClient({ token });
    const project = await client.fetch(`/v9/projects/${projectId}`);
    if (project?.id || project?.name) {
      return { passed: true, message: `Vercel project verified (${project.name || project.id})` };
    }
    return { passed: false, message: 'Vercel API call succeeded but project missing' };
  } catch (error) {
    return { passed: false, message: `Vercel verification failed: ${error.message}` };
  }
}

async function verifyGitState() {
  try {
    const { stdout } = await exec('git status --short', { cwd: workspaceRoot });
    const dirty = stdout.split('\n').some((line) => line && !line.trim().startsWith('??'));
    return dirty
      ? { passed: false, message: 'Git worktree dirty. Commit or stash changes.' }
      : { passed: true, message: 'Git worktree clean.' };
  } catch (error) {
    return { passed: false, message: `Git status failed: ${error.message}` };
  }
}

async function verifyPortAvailability(port = 8080) {
  if (process.platform === 'win32') {
    try {
      const { stdout } = await exec(`netstat -ano | findstr :${port}`);
      if (stdout.trim()) {
        return { passed: false, message: `Port ${port} busy. Stop emulator/process first.` };
      }
      return { passed: true, message: `Port ${port} available.` };
    } catch {
      return { passed: true, message: `Port ${port} available.` };
    }
  }
  try {
    await exec(`lsof -i :${port}`);
    return { passed: false, message: `Port ${port} busy.` };
  } catch {
    return { passed: true, message: `Port ${port} available.` };
  }
}

async function checkEnvTemplates() {
  const samplePath = path.join(frontendRoot, '.env.example');
  const envPath = path.join(frontendRoot, '.env');
  if (!fs.existsSync(samplePath)) {
    return { passed: false, message: '.env.example missing in botaqi-web' };
  }
  if (!fs.existsSync(envPath)) {
    return { passed: false, message: '.env missing in botaqi-web (copy template)' };
  }
  return { passed: true, message: '.env and template present' };
}

const checks = [
  { id: 'node', run: () => checkNodeVersion(), exitCode: 1 },
  { id: 'package', run: () => checkPackageManifest(), exitCode: 1 },
  { id: 'envTemplates', run: () => checkEnvTemplates(), exitCode: 1 },
  { id: 'git', run: () => verifyGitState(), exitCode: 1 },
  { id: 'cli', run: () => checkCliAvailability(), exitCode: 1 },
  { id: 'serviceAccount', run: (ctx) => verifyServiceAccount(ctx.mockMode), exitCode: 1 },
  { id: 'openai', run: (ctx) => verifyOpenAIKey(ctx.mockMode), exitCode: 1 },
  { id: 'vercel', run: (ctx) => verifyVercelLink(ctx.mockMode), exitCode: 1 },
  { id: 'port8080', run: () => verifyPortAvailability(8080), exitCode: 1 },
];

export async function runPhase0(options = {}) {
  const started = Date.now();
  const platform = detectPlatform();
  const rollbackManager = new RollbackManager('phase0');
  const context = { mockMode: options.mockMode ?? false, platform };
  const skipSet = new Set(options.skipChecks || []);
  const results = [];

  for (const check of checks) {
    if (skipSet.has(check.id)) {
      results.push({ id: check.id, passed: true, message: 'skipped via override' });
      continue;
    }
    const outcome = await check.run(context);
    results.push({ id: check.id, ...outcome });
    if (!outcome.passed) {
      rollbackManager.append(`Check failed: ${check.id} -> ${outcome.message}`);
      await rollbackManager.rollback(`Prerequisite ${check.id} failed`);
      throw new DeploymentError(`Phase 0 failed during ${check.id}: ${outcome.message}`, check.exitCode, results);
    }
  }

  const duration = ((Date.now() - started) / 1000).toFixed(1);
  rollbackManager.append(`Phase 0 succeeded in ${duration}s`);
  return { durationSeconds: Number(duration), platform, results };
}
