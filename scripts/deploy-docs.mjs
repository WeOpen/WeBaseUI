import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const preview = process.argv.includes('--preview');

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed`);
}

function capture(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    throw new Error(`${command} ${args.join(' ')} failed`);
  }
  return result.stdout.trim();
}

const branch = capture('git', ['branch', '--show-current']);
if (!branch) throw new Error('Docs deployment requires a named git branch.');

if (preview && branch === 'main') {
  throw new Error('Preview docs deploys must run from a non-main branch. Use npm run deploy:docs for production deploys from main.');
}

if (!preview) {
  if (branch !== 'main') {
    throw new Error(`Production docs deploys must run from main, not ${branch}. Use npm run deploy:docs:preview for branch previews.`);
  }

  const status = capture('git', ['status', '--porcelain']);
  if (status) throw new Error('Production docs deploys require a clean working tree.');

  run('git', ['fetch', 'origin', 'main', '--quiet']);
  const head = capture('git', ['rev-parse', 'HEAD']);
  const remoteHead = capture('git', ['rev-parse', 'origin/main']);
  if (head !== remoteHead) {
    throw new Error('Production docs deploys require local main to exactly match the latest origin/main.');
  }
}

run('npm', ['run', 'build:docs']);
run('npm', ['exec', '--', 'wrangler', 'pages', 'deploy', `--branch=${branch}`]);
