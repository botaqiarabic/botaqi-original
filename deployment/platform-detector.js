import os from 'os';
import { execSync } from 'child_process';

export function detectPlatform() {
  const platform = process.platform;
  const isWindows = platform === 'win32';
  const shell = isWindows ? 'powershell' : (process.env.SHELL || '/bin/bash');
  return {
    os: platform,
    isWindows,
    shell,
    cores: os.cpus().length,
    arch: process.arch,
  };
}

export function commandExists(command) {
  try {
    const probe = process.platform === 'win32'
      ? `Get-Command ${command}`
      : `command -v ${command}`;
    execSync(probe, { stdio: 'ignore', shell: process.platform === 'win32' ? 'powershell' : undefined });
    return true;
  } catch {
    return false;
  }
}
