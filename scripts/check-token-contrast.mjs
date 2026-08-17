import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const tokenSource = readFileSync(path.join(root, 'packages/webaseui-core/src/tokens.css'), 'utf8');
const brandSource = readFileSync(path.join(root, 'packages/webaseui-core/src/brand-theme.css'), 'utf8');

function ruleBody(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = source.match(new RegExp(`^${escaped}\\s*\\{([\\s\\S]*?)^\\}`, 'm'))?.[1];
  if (!body) throw new Error(`Missing token rule: ${selector}`);
  return body;
}

function declarations(body) {
  return Object.fromEntries(
    [...body.matchAll(/^\s*(--webase-[a-z0-9-]+):\s*([^;]+);/gm)]
      .map(([, name, value]) => [name, value.trim()])
  );
}

function resolveColor(tokens, name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`Circular color token reference: ${[...seen, name].join(' -> ')}`);
  const value = tokens[name];
  if (!value) throw new Error(`Missing color token: ${name}`);
  const hex = value.match(/^#([0-9a-f]{6})$/i)?.[1];
  if (hex) return hex;
  const reference = value.match(/^var\((--webase-[a-z0-9-]+)\)$/)?.[1];
  if (!reference) throw new Error(`${name} does not resolve to a six-digit hex color: ${value}`);
  return resolveColor(tokens, reference, new Set([...seen, name]));
}

function relativeLuminance(hex) {
  const channels = [0, 2, 4]
    .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((channel) => channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(first, second) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  return (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05);
}

const base = declarations(ruleBody(tokenSource, ':root'));
const themes = {
  light: base,
  dark: { ...base, ...declarations(ruleBody(tokenSource, ":root[data-theme='dark']")) },
  brand: { ...base, ...declarations(ruleBody(brandSource, ":root[data-theme='brand']")) }
};

const textPairs = [
  ['--webase-color-ink', '--webase-color-canvas'],
  ['--webase-color-ink', '--webase-color-surface'],
  ['--webase-color-ink-soft', '--webase-color-canvas'],
  ['--webase-color-ink-soft', '--webase-color-surface'],
  ['--webase-color-ink-muted', '--webase-color-canvas'],
  ['--webase-color-ink-muted', '--webase-color-surface'],
  ['--webase-color-brand', '--webase-color-canvas'],
  ['--webase-color-brand', '--webase-color-surface'],
  ['--webase-color-brand-light', '--webase-color-canvas'],
  ['--webase-color-brand-light', '--webase-color-surface'],
  ['--webase-color-error', '--webase-color-canvas'],
  ['--webase-color-error', '--webase-color-surface'],
  ['--webase-color-warning', '--webase-color-warning-field']
];

const graphicalPairs = [
  ['--webase-color-info', '--webase-color-canvas'],
  ['--webase-color-info', '--webase-color-surface'],
  ['--webase-color-success', '--webase-color-canvas'],
  ['--webase-color-success', '--webase-color-surface'],
  ['--webase-color-warning', '--webase-color-canvas'],
  ['--webase-color-warning', '--webase-color-surface'],
  ['--webase-color-canvas', '--webase-color-info'],
  ['--webase-color-canvas', '--webase-color-success'],
  ['--webase-color-canvas', '--webase-color-warning'],
  ['--webase-color-canvas', '--webase-color-error']
];

const failures = [];
for (const [themeName, tokens] of Object.entries(themes)) {
  for (const [pairs, minimum, role] of [[textPairs, 4.5, 'text'], [graphicalPairs, 3, 'graphical']]) {
    for (const [foreground, background] of pairs) {
      const ratio = contrastRatio(resolveColor(tokens, foreground), resolveColor(tokens, background));
      if (ratio + Number.EPSILON < minimum) {
        failures.push(`${themeName} ${role}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1; expected ${minimum}:1`);
      }
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Token contrast gate failed:\n${failures.join('\n')}`);
}

console.log(`Validated ${textPairs.length + graphicalPairs.length} accessible color pairs across light, dark, and brand themes.`);
