import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const fixture = path.join(root, 'examples/xueui-svelte-consumer');
const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), 'xueui-consumer-'));
const app = path.join(temporaryRoot, 'app');
const packs = path.join(temporaryRoot, 'packs');

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe' });
  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    throw new Error(`${command} ${args.join(' ')} failed`);
  }
  return result.stdout;
}

function pack(workspace) {
  const output = run('npm', [
    'pack',
    '--json',
    '--ignore-scripts',
    '--pack-destination',
    packs,
    '--workspace',
    workspace
  ]);
  return path.join(packs, JSON.parse(output)[0].filename);
}

try {
  mkdirSync(packs);
  cpSync(fixture, app, { recursive: true });
  const coreTarball = pack('@xueui/core');
  const svelteTarball = pack('@xueui/svelte');
  const manifestPath = path.join(app, 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.dependencies['@xueui/core'] = `file:${coreTarball}`;
  manifest.dependencies['@xueui/svelte'] = `file:${svelteTarball}`;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], app);
  run('npm', ['run', 'build'], app);

  const installedPackage = realpathSync(path.join(app, 'node_modules/@xueui/svelte'));
  if (!installedPackage.startsWith(realpathSync(app))) {
    throw new Error(`consumer resolved a workspace link instead of its tarball: ${installedPackage}`);
  }

  console.log('Validated XueUI from packed tarballs in an isolated Svelte consumer build.');
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
