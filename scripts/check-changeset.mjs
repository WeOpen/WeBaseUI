import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const requestedBase = process.argv.find((argument) => argument.startsWith('--base='))?.slice('--base='.length);
const baseRef = requestedBase ?? (process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'origin/main');

function git(args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    throw new Error(`git ${args.join(' ')} failed`);
  }
  return result.stdout.trim();
}

const diffBase = git(['merge-base', baseRef, 'HEAD']);
const changedFiles = new Set([
  ...git(['diff', '--name-only', diffBase]).split('\n').filter(Boolean),
  ...git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean)
]);
const publishablePackages = new Map([
  ['packages/webaseui-core/', '@webaseui/core'],
  ['packages/webaseui-svelte/', '@webaseui/svelte']
]);
const changedPackages = new Set();

for (const changedFile of changedFiles) {
  for (const [directory, packageName] of publishablePackages) {
    if (changedFile.startsWith(directory)) changedPackages.add(packageName);
  }
}

if (changedPackages.size === 0) {
  console.log('No publishable package changes detected; no changeset required.');
  process.exit(0);
}

const changesetFiles = [...changedFiles].filter((file) => /^\.changeset\/(?!README\.md$).+\.md$/.test(file));
if (changesetFiles.length === 0) {
  throw new Error(`Missing changeset for: ${[...changedPackages].join(', ')}`);
}

const coveredPackages = new Set();
for (const changesetFile of changesetFiles) {
  const source = readFileSync(path.join(root, changesetFile), 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  for (const line of frontmatter.split('\n')) {
    const packageName = line.match(/^["']?(@webaseui\/[A-Za-z0-9_-]+)["']?:\s+(?:major|minor|patch)\s*$/)?.[1];
    if (packageName) coveredPackages.add(packageName);
  }
}

const missingPackages = [...changedPackages].filter((packageName) => !coveredPackages.has(packageName));
if (missingPackages.length > 0) {
  throw new Error(`Changeset does not cover: ${missingPackages.join(', ')}`);
}

console.log(`Changeset coverage validated for: ${[...changedPackages].join(', ')}`);
