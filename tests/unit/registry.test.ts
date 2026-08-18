import { describe, expect, it, vi } from 'vitest';
import { hasSlsaProvenance, parseRegistryVersion, retryRegistryLookup } from '../../scripts/lib/registry.mjs';

describe('registry helpers', () => {
  it('parses scalar and npm array version responses', () => {
    expect(parseRegistryVersion('"0.4.0-next.0"', '@webaseui/svelte@next')).toBe('0.4.0-next.0');
    expect(parseRegistryVersion('["0.3.2","0.4.0-next.0"]', '@webaseui/svelte@next')).toBe('0.4.0-next.0');
    expect(() => parseRegistryVersion('{}', '@webaseui/svelte@next')).toThrow('@webaseui/svelte@next');
  });

  it('recognizes only SLSA v1 provenance metadata', () => {
    expect(hasSlsaProvenance(JSON.stringify({ provenance: { predicateType: 'https://slsa.dev/provenance/v1' } }))).toBe(true);
    expect(hasSlsaProvenance(JSON.stringify({ provenance: { predicateType: 'https://example.com/predicate' } }))).toBe(false);
    expect(hasSlsaProvenance('')).toBe(false);
  });

  it('retries transient registry failures before returning a result', async () => {
    const lookup = vi.fn()
      .mockRejectedValueOnce(new Error('E404'))
      .mockRejectedValueOnce(new Error('E404'))
      .mockResolvedValue('0.4.0-next.0');
    const sleep = vi.fn().mockResolvedValue(undefined);
    const onRetry = vi.fn();

    await expect(retryRegistryLookup(lookup, { attempts: 4, delayMs: 10, sleep, onRetry }))
      .resolves.toBe('0.4.0-next.0');
    expect(lookup).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(10);
    expect(onRetry).toHaveBeenNthCalledWith(1, expect.objectContaining({ attempt: 1, attempts: 4, delayMs: 10 }));
    expect(onRetry).toHaveBeenNthCalledWith(2, expect.objectContaining({ attempt: 2, attempts: 4, delayMs: 10 }));
  });

  it('fails after the configured retry limit', async () => {
    const failure = new Error('registry unavailable');
    const lookup = vi.fn().mockRejectedValue(failure);
    const sleep = vi.fn().mockResolvedValue(undefined);

    await expect(retryRegistryLookup(lookup, { attempts: 3, delayMs: 0, sleep })).rejects.toBe(failure);
    expect(lookup).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });
});
