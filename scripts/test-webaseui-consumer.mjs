import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { parseNpmPackOutput } from './lib/npm-pack.mjs';

const root = path.resolve(import.meta.dirname, '..');
const fixture = path.join(root, 'examples/webaseui-svelte-consumer');
const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), 'webaseui-consumer-'));
const packs = path.join(temporaryRoot, 'packs');
const keepTemporary = process.env.WEBASEUI_KEEP_CONSUMER_FIXTURE === '1';
const includeLatest = process.argv.includes('--include-latest');

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
  const metadata = parseNpmPackOutput(output, workspace);
  if (typeof metadata.filename !== 'string' || metadata.filename.length === 0) {
    throw new Error(`npm pack returned no filename for ${workspace}`);
  }
  return path.join(packs, metadata.filename);
}

function readBuildOutput(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? [readBuildOutput(target)] : [readFileSync(target, 'utf8')];
    })
    .join('\n');
}

try {
  mkdirSync(packs);
  const coreTarball = pack('@webaseui/core');
  const svelteTarball = pack('@webaseui/svelte');
  const fixtureManifest = JSON.parse(readFileSync(path.join(fixture, 'package.json'), 'utf8'));
  const supportPolicy = JSON.parse(readFileSync(path.join(root, 'docs/support-policy.json'), 'utf8'));
  const toolchains = [
    {
      label: 'minimum',
      svelte: supportPolicy.svelte.minimum,
      vite: '6.0.11',
      plugin: '5.1.1',
      typescript: supportPolicy.typescript.minimum,
      svelteCheck: '4.0.0'
    },
    {
      label: 'current',
      svelte: fixtureManifest.dependencies.svelte,
      vite: fixtureManifest.devDependencies.vite,
      plugin: fixtureManifest.devDependencies['@sveltejs/vite-plugin-svelte'],
      typescript: fixtureManifest.devDependencies.typescript,
      svelteCheck: fixtureManifest.devDependencies['svelte-check']
    }
  ];

  if (includeLatest) {
    toolchains.push({
      label: 'ecosystem-latest',
      svelte: 'latest',
      vite: 'latest',
      plugin: 'latest',
      typescript: 'latest',
      svelteCheck: 'latest'
    });
  }

  for (const toolchain of toolchains) {
    const { label } = toolchain;
    const app = path.join(temporaryRoot, `app-${label}`);
    cpSync(fixture, app, { recursive: true });
    const manifestPath = path.join(app, 'package.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.dependencies['@webaseui/core'] = `file:${coreTarball}`;
    manifest.dependencies['@webaseui/svelte'] = `file:${svelteTarball}`;
    manifest.dependencies.svelte = toolchain.svelte;
    manifest.devDependencies.vite = toolchain.vite;
    manifest.devDependencies['@sveltejs/vite-plugin-svelte'] = toolchain.plugin;
    manifest.devDependencies.typescript = toolchain.typescript;
    manifest.devDependencies['svelte-check'] = toolchain.svelteCheck;
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], app);
    run('npm', ['run', 'typecheck'], app);
    run('npm', ['run', 'build'], app);

    const output = readBuildOutput(path.join(app, 'dist'));
    if (output.includes('ds-select')) {
      throw new Error(`${label} consumer bundle contains styles from the unused WeBaseSelect export`);
    }
    if (output.includes('ds-dialog-shell')) {
      throw new Error(`${label} consumer bundle contains code from the unused WeBaseDialog export`);
    }

    const installedPackage = realpathSync(path.join(app, 'node_modules/@webaseui/svelte'));
    if (!installedPackage.startsWith(realpathSync(app))) {
      throw new Error(`${label} consumer resolved a workspace link instead of its tarball: ${installedPackage}`);
    }

    const installedVersion = (packageName) => JSON.parse(
      readFileSync(path.join(app, 'node_modules', packageName, 'package.json'), 'utf8')
    ).version;
    console.log(
      `Validated packed artifacts with Svelte ${installedVersion('svelte')}, ` +
      `TypeScript ${installedVersion('typescript')}, Vite ${installedVersion('vite')}, ` +
      `plugin ${installedVersion('@sveltejs/vite-plugin-svelte')}, and ` +
      `svelte-check ${installedVersion('svelte-check')} (${label}).`
    );
  }

  console.log('Validated tree-shakeable WeBaseUI tarballs across the supported Svelte range.');
} finally {
  if (keepTemporary) console.log(`Kept consumer fixture at ${temporaryRoot}`);
  else rmSync(temporaryRoot, { recursive: true, force: true });
}
