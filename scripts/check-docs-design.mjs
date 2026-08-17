import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const docsRoot = path.join(root, 'apps/docs');
const sourceRoots = [path.join(docsRoot, 'src'), path.join(docsRoot, 'index.html')];
const inspectedExtensions = new Set(['.css', '.html', '.js', '.json', '.svelte', '.ts']);
const pictographicPattern = /[\p{Extended_Pictographic}\u2190-\u2bff]/u;
const forbiddenDashPattern = /[—–]/u;
const inlineSvgPattern = /<svg\b/i;
const forbiddenIconPackagePattern = /(?:from\s+|import\s*\()['"]([^'"]*(?:icon|heroicons|phosphor|tabler|font-awesome|material-symbols)[^'"]*)['"]/i;
const allowedIconPackages = new Set(['@lucide/svelte', '@webaseui/svelte']);

function listFiles(target) {
  const entries = [];
  const stat = readdirSync;

  try {
    for (const entry of stat(target, { withFileTypes: true })) {
      const child = path.join(target, entry.name);
      if (entry.isDirectory()) entries.push(...listFiles(child));
      else if (inspectedExtensions.has(path.extname(entry.name))) entries.push(child);
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOTDIR') {
      if (inspectedExtensions.has(path.extname(target))) return [target];
    } else {
      throw error;
    }
  }

  return entries;
}

const failures = [];

for (const file of sourceRoots.flatMap(listFiles)) {
  const relativePath = path.relative(root, file);
  const source = readFileSync(file, 'utf8');

  source.split(/\r?\n/).forEach((line, index) => {
    if (pictographicPattern.test(line)) {
      failures.push(`${relativePath}:${index + 1} uses an emoji, pictographic symbol, or Unicode icon`);
    }
    if (forbiddenDashPattern.test(line)) {
      failures.push(`${relativePath}:${index + 1} uses a typographic dash that is disallowed in the site design language`);
    }
    if (inlineSvgPattern.test(line)) {
      failures.push(`${relativePath}:${index + 1} contains inline SVG; use a Lucide-backed component instead`);
    }

    const iconImport = line.match(forbiddenIconPackagePattern)?.[1];
    if (iconImport && !allowedIconPackages.has(iconImport)) {
      failures.push(`${relativePath}:${index + 1} imports ${iconImport}; documentation icons must use Lucide`);
    }
  });
}

if (failures.length > 0) {
  throw new Error(`Documentation design policy failed:\n${failures.join('\n')}`);
}

console.log('Validated documentation icon, emoji, and visual-language source policies.');
