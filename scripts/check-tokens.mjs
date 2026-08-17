import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const tokenPath = path.join(root, 'packages/webaseui-core/src/tokens.css');
const themePath = path.join(root, 'packages/webaseui-core/src/theme.css');
const brandThemePath = path.join(root, 'packages/webaseui-core/src/brand-theme.css');
const componentDirectory = path.join(root, 'packages/webaseui-svelte/src/lib/components');
const componentLiteralBaselinePath = path.join(root, 'docs/component-style-literal-baseline.json');
const coreManifest = JSON.parse(readFileSync(path.join(root, 'packages/webaseui-core/package.json'), 'utf8'));
const componentLiteralBaseline = JSON.parse(readFileSync(componentLiteralBaselinePath, 'utf8'));
const tokenSource = readFileSync(tokenPath, 'utf8');
const themeSource = readFileSync(themePath, 'utf8');
const brandThemeSource = readFileSync(brandThemePath, 'utf8');

const requiredLayers = {
  primitive: [
    '--webase-palette-canvas',
    '--webase-palette-surface',
    '--webase-space-1',
    '--webase-space-8',
    '--webase-size-control-sm',
    '--webase-size-control-lg',
    '--webase-size-target-min',
    '--webase-radius-sm',
    '--webase-font-size-overline',
    '--webase-font-size-control',
    '--webase-z-dialog',
    '--webase-duration-fast'
  ],
  semantic: [
    '--webase-color-canvas',
    '--webase-color-surface',
    '--webase-color-ink',
    '--webase-color-brand',
    '--webase-color-border-strong',
    '--webase-focus-ring',
    '--webase-interactive-target-min'
  ],
  component: [
    '--webase-component-control-height',
    '--webase-component-control-padding-inline',
    '--webase-component-button-height',
    '--webase-component-button-height-sm',
    '--webase-component-icon-button-size',
    '--webase-component-switch-width',
    '--webase-component-select-menu-max-height',
    '--webase-component-dialog-width',
    '--webase-component-overlay-z-index',
    '--webase-component-overlay-viewport-padding',
    '--webase-component-alert-min-height',
    '--webase-component-toast-max-width',
    '--webase-component-slider-track-height',
    '--webase-component-tabs-trigger-height',
    '--webase-component-accordion-trigger-height',
    '--webase-component-card-min-height',
    '--webase-component-empty-min-height',
    '--webase-component-section-header-title-min-size',
    '--webase-component-skeleton-media-size'
  ]
};

function fail(message) {
  throw new Error(`Token contract failed: ${message}`);
}

const definitions = new Set(
  [...tokenSource.matchAll(/(--webase-[a-z0-9-]+)\s*:/g)].map(([, name]) => name)
);
const missing = Object.values(requiredLayers).flat().filter((name) => !definitions.has(name));
if (missing.length) fail(`missing definitions: ${missing.join(', ')}`);

const references = [...tokenSource.matchAll(/var\((--webase-[a-z0-9-]+)/g)].map(([, name]) => name);
const undefinedReferences = [...new Set(references.filter((name) => !definitions.has(name)))];
if (undefinedReferences.length) fail(`undefined references: ${undefinedReferences.join(', ')}`);

if (!themeSource.includes("@import './tokens.css';")) {
  fail('theme.css must import tokens.css');
}

if (coreManifest.exports?.['./brand-theme.css'] !== './src/brand-theme.css') {
  fail('core package must export the example brand theme');
}

for (const name of ['--webase-color-brand', '--webase-color-canvas', '--webase-color-surface']) {
  if (!brandThemeSource.includes(`${name}:`)) fail(`brand theme must override ${name}`);
}

const darkTheme = tokenSource.match(/:root\[data-theme=['"]dark['"]\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
for (const name of ['--webase-palette-canvas', '--webase-palette-surface', '--webase-palette-ink', '--webase-palette-brand']) {
  if (!darkTheme.includes(`${name}:`)) fail(`dark theme must override ${name}`);
}

const componentLayer = tokenSource.match(/\/\* Component tokens \*\/([\s\S]*?)\/\* Compatibility aliases \*\//)?.[1] ?? '';
if (!componentLayer.trim()) fail('component token layer is empty');

const componentFiles = readdirSync(componentDirectory).filter((name) => name.endsWith('.svelte')).sort();
const baselineFiles = Object.keys(componentLiteralBaseline.components).sort();
if (componentFiles.join('\n') !== baselineFiles.join('\n')) {
  fail('component literal baseline must list every public component exactly once');
}

const literalPattern = /(?<![\w-])-?(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|ms|s|deg)\b/g;
const componentStyles = Object.fromEntries(componentFiles.map((name) => {
  const source = readFileSync(path.join(componentDirectory, name), 'utf8');
  const style = source.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';
  return [name, style];
}));
const animatedComponents = componentFiles.filter((name) => /\b(?:animation|transition)\s*:/.test(componentStyles[name]));
const missingReducedMotion = animatedComponents.filter((name) => !/prefers-reduced-motion\s*:\s*reduce/.test(componentStyles[name]));
if (missingReducedMotion.length) {
  fail(`animated components must define a reduced-motion fallback: ${missingReducedMotion.join(', ')}`);
}
const mediaQueryPattern = /@media\s*\(([^)]*)\)/g;
const mediaQueryLiterals = Object.fromEntries(componentFiles.flatMap((name) => {
  const literals = [...componentStyles[name].matchAll(mediaQueryPattern)]
    .flatMap(([, condition]) => [...condition.matchAll(literalPattern)].map(([value]) => value));
  return literals.length ? [[name, literals]] : [];
}));
if (JSON.stringify(mediaQueryLiterals) !== JSON.stringify(componentLiteralBaseline.mediaQueries)) {
  fail(`media query literal baseline changed: expected ${JSON.stringify(componentLiteralBaseline.mediaQueries)}, received ${JSON.stringify(mediaQueryLiterals)}`);
}

const literalCounts = Object.fromEntries(componentFiles.map((name) => {
  const declarations = componentStyles[name].replace(mediaQueryPattern, '@media');
  return [name, [...declarations.matchAll(literalPattern)].length];
}));
const changedBudgets = componentFiles.filter(
  (name) => literalCounts[name] !== componentLiteralBaseline.components[name]
);
if (changedBudgets.length) {
  fail(`component style literal baseline changed: ${changedBudgets.map((name) => (
    `${name} expected ${componentLiteralBaseline.components[name]}, received ${literalCounts[name]}`
  )).join('; ')}`);
}

const literalTotal = Object.values(literalCounts).reduce((total, count) => total + count, 0);
if (literalTotal !== componentLiteralBaseline.total) {
  fail(`component style literal total expected ${componentLiteralBaseline.total}, received ${literalTotal}`);
}

console.log(`Validated three-layer token contract and ${literalTotal}-literal component style baseline.`);
