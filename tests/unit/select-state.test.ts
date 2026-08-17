import { describe, expect, it } from 'vitest';
import { findSelectedOptionIndex } from '../../packages/webaseui-svelte/src/lib/internal/select-state.js';
import type { WeBaseSelectOption } from '../../packages/webaseui-svelte/src/lib/types.js';

const options: WeBaseSelectOption[] = [
  { label: 'Alpha', value: 'alpha', disabled: true },
  { label: 'Beta', value: 'beta' },
  { label: 'Gamma', value: 'gamma' }
];

describe('findSelectedOptionIndex', () => {
  it('keeps an enabled controlled value and falls back from missing or disabled values', () => {
    expect(findSelectedOptionIndex(options, 'gamma')).toBe(2);
    expect(findSelectedOptionIndex(options, 'alpha')).toBe(1);
    expect(findSelectedOptionIndex(options, 'missing')).toBe(1);
  });

  it('returns -1 for empty and fully disabled option sets', () => {
    expect(findSelectedOptionIndex([], 'missing')).toBe(-1);
    expect(findSelectedOptionIndex([{ label: 'Locked', value: 'locked', disabled: true }], 'locked')).toBe(-1);
  });

  it('re-resolves the controlled value after options are added or removed', () => {
    const dynamicOptions = options.slice();
    expect(findSelectedOptionIndex(dynamicOptions, 'gamma')).toBe(2);

    dynamicOptions.splice(2, 1);
    expect(findSelectedOptionIndex(dynamicOptions, 'gamma')).toBe(1);

    dynamicOptions.unshift({ label: 'Available', value: 'available' });
    expect(findSelectedOptionIndex(dynamicOptions, 'available')).toBe(0);
  });
});
