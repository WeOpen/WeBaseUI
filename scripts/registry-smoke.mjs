import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { hasSlsaProvenance, parseRegistryVersion, retryRegistryLookup } from './lib/registry.mjs';

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

function retryNotice(label) {
  return ({ attempt, attempts, delayMs, error }) => {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Registry lookup for ${label} failed (${attempt}/${attempts}): ${message}. Retrying in ${delayMs}ms.`);
  };
}

async function registryVersion(packageName) {
  const packageSpec = `${packageName}@${tag}`;
  return retryRegistryLookup(
    () => parseRegistryVersion(run('npm', ['view', packageSpec, 'version', '--json']), packageSpec),
    { onRetry: retryNotice(packageSpec) }
  );
}

async function assertRegistryProvenance(packageName, version) {
  const packageSpec = `${packageName}@${version}`;
  await retryRegistryLookup(
    () => {
      const raw = run('npm', ['view', packageSpec, 'dist.attestations', '--json']);
      if (!hasSlsaProvenance(raw)) {
        throw new Error(`Registry package ${packageSpec} has no SLSA provenance attestation.`);
      }
    },
    { onRetry: retryNotice(`${packageSpec} provenance`) }
  );
}

try {
  const coreVersion = await registryVersion('@webaseui/core');
  const svelteVersion = await registryVersion('@webaseui/svelte');
  if (requireProvenance) {
    for (const [packageName, version] of [['@webaseui/core', coreVersion], ['@webaseui/svelte', svelteVersion]]) {
      await assertRegistryProvenance(packageName, version);
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
