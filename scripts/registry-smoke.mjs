import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const fixture = path.join(root, 'examples/webaseui-svelte-consumer');
const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), 'webaseui-registry-'));
const tag = process.argv.find((argument) => argument.startsWith('--tag='))?.slice('--tag='.length) ?? 'latest';
const requireProvenance = process.argv.includes('--require-provenance');
const keepTemporary = process.env.WEBASEUI_KEEP_REGISTRY_FIXTURE === '1';

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe' });
  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    throw new Error(`${command} ${args.join(' ')} failed`);
  }
  return result.stdout.trim();
}

function registryVersion(packageName) {
  const raw = run('npm', ['view', `${packageName}@${tag}`, 'version', '--json']);
  const parsed = JSON.parse(raw);
  const version = Array.isArray(parsed) ? parsed.at(-1) : parsed;
  if (typeof version !== 'string' || version.length === 0) {
    throw new Error(`Registry did not return a version for ${packageName}@${tag}`);
  }
  return version;
}

function registryHasProvenance(packageName, version) {
  const raw = run('npm', ['view', `${packageName}@${version}`, 'dist.attestations', '--json']);
  const parsed = raw ? JSON.parse(raw) : null;
  const metadata = Array.isArray(parsed) ? parsed.at(-1) : parsed;
  return metadata?.provenance?.predicateType === 'https://slsa.dev/provenance/v1';
}

try {
  const coreVersion = registryVersion('@webaseui/core');
  const svelteVersion = registryVersion('@webaseui/svelte');
  if (requireProvenance) {
    for (const [packageName, version] of [['@webaseui/core', coreVersion], ['@webaseui/svelte', svelteVersion]]) {
      if (!registryHasProvenance(packageName, version)) {
        throw new Error(`Registry package ${packageName}@${version} has no SLSA provenance attestation.`);
      }
    }
    console.log(`Registry provenance verified for @webaseui/core@${coreVersion} and @webaseui/svelte@${svelteVersion}.`);
  }
  const app = path.join(temporaryRoot, 'app');
  cpSync(fixture, app, { recursive: true });

  const manifestPath = path.join(app, 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.dependencies['@webaseui/core'] = coreVersion;
  manifest.dependencies['@webaseui/svelte'] = svelteVersion;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], app);
  run('npm', ['run', 'build'], app);

  const installedCore = realpathSync(path.join(app, 'node_modules/@webaseui/core'));
  const installedSvelte = realpathSync(path.join(app, 'node_modules/@webaseui/svelte'));
  if (installedCore.startsWith(root) || installedSvelte.startsWith(root)) {
    throw new Error('Registry smoke test resolved a workspace package instead of a registry artifact.');
  }

  console.log(`Registry smoke passed for @webaseui/core@${coreVersion} and @webaseui/svelte@${svelteVersion} (${tag}).`);
} finally {
  if (keepTemporary) console.log(`Kept registry fixture at ${temporaryRoot}`);
  else rmSync(temporaryRoot, { recursive: true, force: true });
}
