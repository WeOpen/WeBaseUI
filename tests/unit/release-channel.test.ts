import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('release-channel', () => {
  it('publishes from Changesets prerelease mode without passing a custom tag', () => {
    const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), 'webaseui-release-channel-'));
    const binDirectory = path.join(temporaryRoot, 'bin');
    const logPath = path.join(temporaryRoot, 'calls.jsonl');
    const npxPath = path.join(binDirectory, 'npx');

    try {
      mkdirSync(binDirectory);
      writeFileSync(
        npxPath,
        '#!/usr/bin/env node\n' +
          "const fs = require('node:fs');\n" +
          "fs.appendFileSync(process.env.WEBASEUI_RELEASE_TEST_LOG, JSON.stringify({ args: process.argv.slice(2), provenance: process.env.NPM_CONFIG_PROVENANCE, access: process.env.NPM_CONFIG_ACCESS }) + '\\n');\n"
      );
      chmodSync(npxPath, 0o755);

      const result = spawnSync(process.execPath, ['scripts/release-channel.mjs', 'next', '--publish'], {
        cwd: path.resolve(import.meta.dirname, '../..'),
        encoding: 'utf8',
        env: {
          ...process.env,
          CI: 'true',
          PATH: binDirectory + ':' + (process.env.PATH ?? ''),
          WEBASEUI_RELEASE_TEST_LOG: logPath
        }
      });

      expect(result.status, result.stderr).toBe(0);
      const calls = readFileSync(logPath, 'utf8')
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line));
      expect(calls.map(({ args }) => args)).toEqual([
        ['changeset', 'pre', 'enter', 'next'],
        ['changeset', 'version'],
        ['changeset', 'publish']
      ]);
      expect(calls[2]).toMatchObject({ provenance: 'true', access: 'public' });
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true });
    }
  });
});
