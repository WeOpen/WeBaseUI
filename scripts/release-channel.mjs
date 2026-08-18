import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const channel = process.argv.find((argument) => ['next', 'canary'].includes(argument));
const publish = process.argv.includes('--publish');

if (!channel) throw new Error('Release channel must be next or canary.');
if (publish && process.env.CI !== 'true') {
  throw new Error('Pre-release publishing is CI-only. Use the workflow_dispatch release workflow.');
}

function run(args) {
  const result = spawnSync('npx', ['changeset', ...args], { cwd: root, encoding: 'utf8', stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`npx changeset ${args.join(' ')} failed`);
}

run(['pre', 'enter', channel]);
run(['version']);

if (publish) {
  // Changesets reads the active prerelease tag from .changeset/pre.json.
  // Passing --tag in pre mode is rejected and prevents trusted CI from publishing.
  const result = spawnSync('npx', ['changeset', 'publish'], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'inherit',
    env: { ...process.env, NPM_CONFIG_PROVENANCE: 'true', NPM_CONFIG_ACCESS: 'public' }
  });
  if (result.status !== 0) throw new Error(`npx changeset publish failed for prerelease channel ${channel}`);
} else {
  console.log(`Prepared ${channel} pre-release versions. Review the versioned files, then publish from trusted CI with --publish.`);
}
