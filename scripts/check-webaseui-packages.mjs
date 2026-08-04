import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), 'utf8'));
}

function dryRunPack(workspace) {
  const result = spawnSync(
    'npm',
    ['pack', '--dry-run', '--json', '--ignore-scripts', '--workspace', workspace],
    { cwd: root, encoding: 'utf8' }
  );

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    throw new Error(`npm pack failed for ${workspace}`);
  }

  const [pack] = JSON.parse(result.stdout);
  return new Set(pack.files.map((file) => file.path));
}

const coreManifest = readJson('packages/webaseui-core/package.json');
const svelteManifest = readJson('packages/webaseui-svelte/package.json');
const coreFiles = dryRunPack('@webaseui/core');
const svelteFiles = dryRunPack('@webaseui/svelte');
const publicIndex = readFileSync(
  path.join(root, 'packages/webaseui-svelte/src/lib/index.ts'),
  'utf8'
);
const publicComponents = [
  ...publicIndex.matchAll(/export \{ default as (Xue[A-Za-z]+) \}/g)
].map((match) => match[1]);

invariant(coreManifest.name === '@webaseui/core', 'core package must use the @webaseui scope');
invariant(
  coreManifest.repository?.url === 'git+https://github.com/WeOpen/WeBaseUI.git',
  '@webaseui/core must reference the canonical GitHub repository'
);
invariant(svelteManifest.name === '@webaseui/svelte', 'Svelte package must use the @webaseui scope');
invariant(
  svelteManifest.repository?.url === 'git+https://github.com/WeOpen/WeBaseUI.git',
  '@webaseui/svelte must reference the canonical GitHub repository'
);

invariant(coreManifest.exports['./theme.css'], '@webaseui/core must export theme.css');
invariant(coreManifest.exports['./tokens.css'], '@webaseui/core must export tokens.css');
invariant(coreFiles.has('src/theme.css'), '@webaseui/core tarball is missing theme.css');
invariant(coreFiles.has('src/tokens.css'), '@webaseui/core tarball is missing tokens.css');

invariant(svelteManifest.exports['.'], '@webaseui/svelte must expose a package-root entry');
invariant(!svelteManifest.exports['./components/*'], 'component deep imports must stay private');
invariant(svelteFiles.has('dist/index.js'), '@webaseui/svelte tarball is missing dist/index.js');
invariant(svelteFiles.has('dist/index.d.ts'), '@webaseui/svelte tarball is missing dist/index.d.ts');
invariant(svelteFiles.has('CHANGELOG.md'), '@webaseui/svelte tarball is missing its changelog');
invariant(svelteFiles.has('VERSIONING.md'), '@webaseui/svelte tarball is missing its versioning policy');
invariant(publicComponents.length === 26, `expected 26 public components, found ${publicComponents.length}`);

for (const component of publicComponents) {
  invariant(
    svelteFiles.has(`dist/components/${component}.svelte`),
    `@webaseui/svelte tarball is missing ${component}.svelte`
  );
  invariant(
    svelteFiles.has(`dist/components/${component}.svelte.d.ts`),
    `@webaseui/svelte tarball is missing ${component} declarations`
  );
}

console.log(
  `Validated WeBaseUI package artifacts: ${publicComponents.length} components, root exports, CSS tokens, and declarations.`
);
