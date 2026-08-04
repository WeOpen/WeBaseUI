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

const coreManifest = readJson('packages/xueui-core/package.json');
const svelteManifest = readJson('packages/xueui-svelte/package.json');
const coreFiles = dryRunPack('@xueui/core');
const svelteFiles = dryRunPack('@xueui/svelte');
const publicIndex = readFileSync(
  path.join(root, 'packages/xueui-svelte/src/lib/index.ts'),
  'utf8'
);
const publicComponents = [
  ...publicIndex.matchAll(/export \{ default as (Xue[A-Za-z]+) \}/g)
].map((match) => match[1]);

invariant(coreManifest.exports['./theme.css'], '@xueui/core must export theme.css');
invariant(coreManifest.exports['./tokens.css'], '@xueui/core must export tokens.css');
invariant(coreFiles.has('src/theme.css'), '@xueui/core tarball is missing theme.css');
invariant(coreFiles.has('src/tokens.css'), '@xueui/core tarball is missing tokens.css');

invariant(svelteManifest.exports['.'], '@xueui/svelte must expose a package-root entry');
invariant(!svelteManifest.exports['./components/*'], 'component deep imports must stay private');
invariant(svelteFiles.has('dist/index.js'), '@xueui/svelte tarball is missing dist/index.js');
invariant(svelteFiles.has('dist/index.d.ts'), '@xueui/svelte tarball is missing dist/index.d.ts');
invariant(svelteFiles.has('CHANGELOG.md'), '@xueui/svelte tarball is missing its changelog');
invariant(svelteFiles.has('VERSIONING.md'), '@xueui/svelte tarball is missing its versioning policy');
invariant(publicComponents.length === 26, `expected 26 public components, found ${publicComponents.length}`);

for (const component of publicComponents) {
  invariant(
    svelteFiles.has(`dist/components/${component}.svelte`),
    `@xueui/svelte tarball is missing ${component}.svelte`
  );
  invariant(
    svelteFiles.has(`dist/components/${component}.svelte.d.ts`),
    `@xueui/svelte tarball is missing ${component} declarations`
  );
}

console.log(
  `Validated XueUI package artifacts: ${publicComponents.length} components, root exports, CSS tokens, and declarations.`
);
