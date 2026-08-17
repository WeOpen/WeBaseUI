import { describe, expect, it } from 'vitest';
import { parseNpmPackOutput } from '../../scripts/lib/npm-pack.mjs';

const pack = {
  name: '@webaseui/svelte',
  size: 10,
  unpackedSize: 20,
  files: [{ path: 'dist/index.js' }]
};

describe('parseNpmPackOutput', () => {
  it('accepts the legacy array format', () => {
    expect(parseNpmPackOutput(JSON.stringify([pack]), pack.name)).toEqual(pack);
  });

  it('accepts the workspace-keyed object format', () => {
    expect(parseNpmPackOutput(JSON.stringify({ [pack.name]: pack }), pack.name)).toEqual(pack);
  });

  it('rejects invalid JSON and empty payloads with workspace context', () => {
    expect(() => parseNpmPackOutput('{', pack.name)).toThrow(pack.name);
    expect(() => parseNpmPackOutput('{}', pack.name)).toThrow(pack.name);
  });
});
