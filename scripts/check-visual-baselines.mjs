import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const contractPath = path.join(root, 'packages/webaseui-svelte/API_CONTRACT.md');
const casesPath = path.join(root, 'tests/browser/specs/visual-cases.ts');
const snapshotsPath = path.join(root, 'tests/browser/specs/visual.spec.ts-snapshots');

const contractNames = Array.from(readFileSync(contractPath, 'utf8').matchAll(/^### (WeBase[A-Za-z]+)\s*$/gm), (match) => match[1]);
const casesSource = readFileSync(casesPath, 'utf8');
const visualCases = Array.from(casesSource.matchAll(/\{ name: '([^']+)', slug: '([^']+)' \}/g), (match) => ({ name: match[1], slug: match[2] }));
const snapshots = new Set(readdirSync(snapshotsPath).filter((file) => file.endsWith('.png')));
const failures = [];

if (contractNames.length !== 28) {
  failures.push(`expected 28 API contract components, found ${contractNames.length}`);
}

if (visualCases.length !== 28) {
  failures.push(`expected 28 visual component cases, found ${visualCases.length}`);
}

const missingCases = contractNames.filter((name) => !visualCases.some((visualCase) => visualCase.name === name));
const extraCases = visualCases.filter(({ name }) => !contractNames.includes(name)).map(({ name }) => name);

if (missingCases.length > 0) failures.push(`missing visual cases: ${missingCases.join(', ')}`);
if (extraCases.length > 0) failures.push(`visual cases absent from the API contract: ${extraCases.join(', ')}`);

for (const { name, slug } of visualCases) {
  const expected = `${slug}-light-visual-chromium-darwin.png`;
  if (!snapshots.has(expected)) failures.push(`${name} is missing ${expected}`);
}

const requiredStateBaselines = [
  'button-dark-visual-chromium-darwin.png',
  'brand-theme-visual-chromium-darwin.png',
  'select-mobile-visual-chromium-darwin.png',
  'button-focus-visual-chromium-darwin.png',
  'select-open-visual-chromium-darwin.png',
  'dialog-open-visual-chromium-darwin.png',
  'tooltip-focus-visual-chromium-darwin.png',
  'action-state-matrix-visual-chromium-darwin.png',
  'form-error-state-matrix-visual-chromium-darwin.png',
  'form-disabled-state-matrix-visual-chromium-darwin.png',
  'selection-disabled-state-matrix-visual-chromium-darwin.png',
  'feedback-tone-state-matrix-visual-chromium-darwin.png',
  'navigation-state-matrix-visual-chromium-darwin.png',
  'tabs-hover-visual-chromium-darwin.png',
  'accordion-hover-visual-chromium-darwin.png',
  'toast-open-visual-chromium-darwin.png',
  'floating-select-collision-visual-chromium-darwin.png',
  'floating-tooltip-collision-visual-chromium-darwin.png',
  'rtl-floating-visual-chromium-darwin.png',
  'forced-colors-fixture-visual-chromium-darwin.png',
  'localized-copy-zoom-visual-chromium-darwin.png'
];

for (const expected of requiredStateBaselines) {
  if (!snapshots.has(expected)) failures.push(`missing required state baseline ${expected}`);
}

if (failures.length > 0) {
  throw new Error(`Visual baseline contract failed:\n${failures.join('\n')}`);
}

console.log(`Validated ${visualCases.length} component baselines and ${requiredStateBaselines.length} theme, viewport, or interaction baselines.`);
