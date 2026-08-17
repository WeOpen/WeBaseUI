import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { parseNpmPackOutput } from './lib/npm-pack.mjs';

const root = path.resolve(import.meta.dirname, '..');
const baselinePath = path.join(root, 'docs/package-size-baseline.json');
const fixturePath = path.join(root, 'examples/webaseui-svelte-consumer');
const writeBaseline = process.argv.includes('--write');

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe' });
  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    throw new Error(`${command} ${args.join(' ')} failed`);
  }
  return result.stdout;
}

function bytesForFile(filePath) {
  return statSync(filePath).size;
}

function gzipBytes(buffer) {
  return gzipSync(buffer, { level: 9 }).byteLength;
}

function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(target) : [target];
  });
}

function aggregateFiles(files) {
  const sorted = [...files].sort();
  const content = Buffer.concat(sorted.map((file) => readFileSync(file)));
  return {
    bytes: content.byteLength,
    gzipBytes: gzipBytes(content)
  };
}

function packMetrics(workspace) {
  const output = run('npm', ['pack', '--dry-run', '--json', '--ignore-scripts', '--workspace', workspace]);
  const pack = parseNpmPackOutput(output, workspace);
  if (typeof pack.size !== 'number' || typeof pack.unpackedSize !== 'number') {
    throw new Error(`npm pack returned incomplete size metadata for ${workspace}`);
  }
  return {
    tarballBytes: pack.size,
    unpackedBytes: pack.unpackedSize
  };
}

function ensureSvelteBuild() {
  const entry = path.join(root, 'packages/webaseui-svelte/dist/index.js');
  if (!existsSync(entry)) run('npm', ['run', 'build']);
}

function buildConsumer() {
  const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), 'webaseui-size-'));
  const outputDirectory = path.join(temporaryRoot, 'dist');

  try {
    run('npm', ['run', 'build', '--prefix', fixturePath, '--', '--outDir', outputDirectory]);
    const assets = filesUnder(outputDirectory);
    const byExtension = (extension) => assets.filter((file) => path.extname(file) === extension);
    const js = aggregateFiles(byExtension('.js'));
    const css = aggregateFiles(byExtension('.css'));
    const html = aggregateFiles(byExtension('.html'));
    return {
      jsBytes: js.bytes,
      jsGzipBytes: js.gzipBytes,
      cssBytes: css.bytes,
      cssGzipBytes: css.gzipBytes,
      htmlBytes: html.bytes,
      htmlGzipBytes: html.gzipBytes,
      totalBytes: js.bytes + css.bytes + html.bytes,
      totalGzipBytes: js.gzipBytes + css.gzipBytes + html.gzipBytes
    };
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function collectMetrics() {
  ensureSvelteBuild();

  const coreSource = path.join(root, 'packages/webaseui-core/src');
  const svelteDist = path.join(root, 'packages/webaseui-svelte/dist');
  const coreFiles = filesUnder(coreSource).filter((file) => path.extname(file) === '.css');
  const svelteFiles = filesUnder(svelteDist);
  const componentFiles = svelteFiles.filter((file) => /[\\/]components[\\/]WeBase[A-Za-z]+\.svelte$/.test(file));
  const componentMetrics = Object.fromEntries(componentFiles.sort().map((file) => {
    const name = path.basename(file, '.svelte');
    const content = readFileSync(file);
    return [name, { bytes: content.byteLength, gzipBytes: gzipBytes(content) }];
  }));
  const svelteAggregate = aggregateFiles(svelteFiles);

  return {
    schemaVersion: 1,
    platform: process.platform,
    packages: {
      core: {
        ...packMetrics('@webaseui/core'),
        css: aggregateFiles(coreFiles)
      },
      svelte: {
        ...packMetrics('@webaseui/svelte'),
        dist: svelteAggregate,
        entry: aggregateFiles(svelteFiles.filter((file) => /[\\/]index\.(js|d\.ts)$/.test(file))),
        components: componentMetrics
      }
    },
    consumer: buildConsumer()
  };
}

function compareNumber(current, baseline, label, failures) {
  if (typeof baseline !== 'number' || baseline <= 0 || current <= baseline * 1.05) return;
  failures.push(`${label} grew from ${baseline} to ${current} bytes (${((current / baseline - 1) * 100).toFixed(1)}%, limit 5%)`);
}

function compareMetrics(current, baseline) {
  const failures = [];
  const compareObject = (currentObject, baselineObject, prefix) => {
    for (const [key, value] of Object.entries(currentObject)) {
      const baselineValue = baselineObject?.[key];
      if (typeof value === 'number') compareNumber(value, baselineValue, `${prefix}.${key}`, failures);
      else if (value && typeof value === 'object') compareObject(value, baselineValue ?? {}, `${prefix}.${key}`);
    }
  };

  compareObject(current, baseline, 'size');
  return failures;
}

const current = collectMetrics();

if (writeBaseline) {
  writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`);
  console.log(`Wrote package size baseline to ${path.relative(root, baselinePath)}.`);
} else {
  if (!existsSync(baselinePath)) {
    throw new Error(`Missing ${path.relative(root, baselinePath)}. Run npm run size:update to create it.`);
  }

  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const failures = compareMetrics(current, baseline);
  if (failures.length > 0) {
    throw new Error(`Package size budget failed:\n${failures.join('\n')}\nUpdate the baseline only with an intentional, reviewed size change.`);
  }

  console.log('Package size baseline is within the 5% growth budget.');
}

const summary = [
  ['core tarball', current.packages.core.tarballBytes],
  ['svelte tarball', current.packages.svelte.tarballBytes],
  ['svelte dist', current.packages.svelte.dist.bytes],
  ['consumer JS gzip', current.consumer.jsGzipBytes],
  ['consumer CSS gzip', current.consumer.cssGzipBytes]
];
console.log(summary.map(([label, value]) => `${label}: ${value} bytes`).join(' | '));
