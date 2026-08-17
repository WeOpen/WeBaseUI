import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const indexSource = readFileSync(path.join(root, 'packages/webaseui-svelte/src/lib/index.ts'), 'utf8');
const contractSource = readFileSync(path.join(root, 'packages/webaseui-svelte/API_CONTRACT.md'), 'utf8');

const exportedComponents = [...indexSource.matchAll(/export \{ default as (WeBase\w+) \}/g)]
  .map((match) => match[1])
  .sort();
const documentedComponents = [...contractSource.matchAll(/^### (WeBase\w+)$/gm)]
  .map((match) => match[1])
  .sort();

const missing = exportedComponents.filter((component) => !documentedComponents.includes(component));
const stale = documentedComponents.filter((component) => !exportedComponents.includes(component));
const duplicates = documentedComponents.filter((component, index) => documentedComponents.indexOf(component) !== index);

if (exportedComponents.length !== 28) {
  throw new Error(`Expected 28 public component exports, found ${exportedComponents.length}.`);
}

if (missing.length || stale.length || duplicates.length) {
  throw new Error([
    'Public API contract coverage failed.',
    missing.length ? `Missing: ${missing.join(', ')}` : '',
    stale.length ? `Stale: ${stale.join(', ')}` : '',
    duplicates.length ? `Duplicates: ${[...new Set(duplicates)].join(', ')}` : ''
  ].filter(Boolean).join('\n'));
}

for (const component of documentedComponents) {
  const section = contractSource.split(`### ${component}\n`)[1]?.split('\n### ')[0] ?? '';
  for (const requiredLabel of ['Props:', 'Binding']) {
    if (!section.includes(requiredLabel)) {
      throw new Error(`${component} is missing ${requiredLabel} contract metadata.`);
    }
  }
}

console.log(`Validated public API contract coverage for ${documentedComponents.length} components.`);
