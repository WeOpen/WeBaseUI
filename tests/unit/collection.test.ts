import { describe, expect, it } from 'vitest';
import { findEnabledIndex, normalizeIndex, wrapIndex } from '../../packages/webaseui-svelte/src/lib/utils/collection.js';

describe('findEnabledIndex', () => {
  const items = [
    { disabled: true },
    { disabled: false },
    {},
    { disabled: true }
  ];

  it('finds the first enabled item in the requested direction', () => {
    expect(findEnabledIndex(items, 0, 1)).toBe(1);
    expect(findEnabledIndex(items, 3, -1)).toBe(2);
  });

  it('wraps starts that fall outside the collection', () => {
    expect(findEnabledIndex(items, 6, 1)).toBe(2);
    expect(findEnabledIndex(items, -1, 1)).toBe(1);
  });

  it('returns -1 for empty or fully disabled collections', () => {
    expect(findEnabledIndex([], 0, 1)).toBe(-1);
    expect(findEnabledIndex([{ disabled: true }], 0, -1)).toBe(-1);
  });

  it('uses the latest collection after enabled items are added or removed', () => {
    const dynamicItems = [{ disabled: true }, { disabled: false }];
    expect(findEnabledIndex(dynamicItems, 0, 1)).toBe(1);

    dynamicItems.splice(1, 1);
    expect(findEnabledIndex(dynamicItems, 0, 1)).toBe(-1);

    dynamicItems.push({ disabled: false });
    expect(findEnabledIndex(dynamicItems, 0, 1)).toBe(1);
  });
});

describe('normalizeIndex', () => {
  it('preserves a valid controlled index', () => {
    expect(normalizeIndex(2, 4)).toBe(2);
  });

  it('uses the fallback for fractional, negative, and overflowing values', () => {
    expect(normalizeIndex(1.5, 4)).toBe(0);
    expect(normalizeIndex(-1, 4, 2)).toBe(2);
    expect(normalizeIndex(8, 4, 2)).toBe(2);
  });

  it('clamps the fallback and returns -1 for an empty collection', () => {
    expect(normalizeIndex(Number.NaN, 4, 99)).toBe(3);
    expect(normalizeIndex(0, 0)).toBe(-1);
  });

  it('re-normalizes a stale controlled index after the collection shrinks', () => {
    expect(normalizeIndex(3, 4, 1)).toBe(3);
    expect(normalizeIndex(3, 2, 1)).toBe(1);
  });
});

describe('wrapIndex', () => {
  it('moves in both directions and wraps across either boundary', () => {
    expect(wrapIndex(2, 3, 1)).toBe(0);
    expect(wrapIndex(0, 3, -1)).toBe(2);
  });

  it('returns -1 for an empty collection', () => {
    expect(wrapIndex(0, 0, 1)).toBe(-1);
  });
});
