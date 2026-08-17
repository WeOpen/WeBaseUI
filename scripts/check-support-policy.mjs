import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function compareVersions(left, right) {
  const leftParts = left.split('.').map(Number);
  const rightParts = right.split('.').map(Number);
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return Math.sign(difference);
  }
  return 0;
}

const policy = readJson('docs/support-policy.json');
const rootManifest = readJson('package.json');
const svelteManifest = readJson('packages/webaseui-svelte/package.json');
const consumerManifest = readJson('examples/webaseui-svelte-consumer/package.json');
const consumerTypeScript = readJson('examples/webaseui-svelte-consumer/tsconfig.json');
const supportMatrix = read('docs/SUPPORT_MATRIX.md');
const consumerScript = read('scripts/test-webaseui-consumer.mjs');
const checkWorkflow = read('.github/workflows/check.yml');
const releaseWorkflow = read('.github/workflows/release.yml');
const compatibilityWorkflow = read('.github/workflows/compatibility.yml');

invariant(rootManifest.engines?.node === policy.node.engine, 'root Node engine must match the support policy');
invariant(svelteManifest.peerDependencies?.svelte === policy.svelte.peer, 'Svelte peer range must match the support policy');
invariant(rootManifest.devDependencies?.['@playwright/test'] === policy.browsers.playwright, 'Playwright must be pinned to the validated support-policy version');
invariant(consumerManifest.devDependencies?.['@types/node'] === rootManifest.devDependencies?.['@types/node'], 'consumer fixture must pin the repository Node declarations');
invariant(consumerTypeScript.compilerOptions?.lib?.includes('ESNext.Disposable'), 'minimum consumer must include Rollup disposable declarations');
invariant(consumerTypeScript.compilerOptions?.types?.includes('node'), 'minimum consumer must include Node declarations');
invariant(consumerTypeScript.compilerOptions?.types?.includes('vite/client'), 'consumer fixture must include Vite CSS declarations');
invariant(consumerScript.includes("docs/support-policy.json"), 'consumer checks must read the shared support policy');
invariant(!consumerScript.includes("typescript: '5.5.4'"), 'minimum TypeScript must not be duplicated in the consumer script');

const currentTypeScript = consumerManifest.devDependencies?.typescript;
invariant(typeof currentTypeScript === 'string', 'consumer fixture must declare TypeScript');
invariant(compareVersions(currentTypeScript, policy.typescript.minimum) >= 0, 'current TypeScript is older than the supported minimum');
invariant(compareVersions(currentTypeScript, policy.typescript.maximumExclusive) < 0, 'current TypeScript is outside the frozen support range');

for (const workflow of [checkWorkflow, releaseWorkflow]) {
  const versions = [...workflow.matchAll(/node-version:\s*([^\n]+)/g)].map((match) => match[1].trim());
  invariant(versions.length > 0, 'blocking workflows must select a Node release');
  invariant(versions.every((version) => version === policy.node.release), 'blocking workflows must use the frozen release Node version');
}

invariant(compatibilityWorkflow.includes(`node-version: ${policy.node.compatibility}`), 'compatibility workflow must exercise the second supported Node LTS line');
invariant(compatibilityWorkflow.includes('@playwright/test@latest'), 'compatibility workflow must warn on the latest browser toolchain');
invariant(compatibilityWorkflow.includes('npm run test:browser'), 'latest browser compatibility job must run the behavior suite');

for (const requiredText of [
  policy.node.engine,
  policy.svelte.peer,
  `>=${policy.typescript.minimum} <${policy.typescript.maximumExclusive.split('.')[0]}`,
  policy.browsers.policy,
  policy.browsers.playwright,
  policy.browsers.validated.chromium,
  policy.browsers.validated.firefox,
  policy.browsers.validated.webkit
]) {
  invariant(supportMatrix.includes(requiredText), `support matrix is missing policy value: ${requiredText}`);
}

invariant(!supportMatrix.includes('RC decision'), 'support matrix still contains an unresolved RC policy decision');

console.log(
  `Validated support policy: Node ${policy.node.engine}, Svelte ${policy.svelte.peer}, ` +
  `TypeScript >=${policy.typescript.minimum} <${policy.typescript.maximumExclusive.split('.')[0]}, ` +
  `${policy.browsers.policy}.`
);
