import { describe, expect, it } from 'vitest';
import { findRovingFocusIndex } from '../../packages/webaseui-svelte/src/lib/internal/roving-focus.js';

describe('findRovingFocusIndex', () => {
  const items = ['First', 'Second', 'Third'];

  it('moves and wraps horizontal collections without consuming vertical arrows', () => {
    expect(findRovingFocusIndex(items, 0, 'ArrowRight', 'horizontal')).toBe(1);
    expect(findRovingFocusIndex(items, 0, 'ArrowLeft', 'horizontal')).toBe(2);
    expect(findRovingFocusIndex(items, 0, 'ArrowDown', 'horizontal')).toBeUndefined();
  });

  it('reverses horizontal arrow meaning for right-to-left collections', () => {
    expect(findRovingFocusIndex(items, 0, 'ArrowLeft', 'horizontal', undefined, 'rtl')).toBe(1);
    expect(findRovingFocusIndex(items, 0, 'ArrowRight', 'horizontal', undefined, 'rtl')).toBe(2);
  });

  it('moves and wraps vertical collections without consuming horizontal arrows', () => {
    expect(findRovingFocusIndex(items, 2, 'ArrowDown', 'vertical')).toBe(0);
    expect(findRovingFocusIndex(items, 0, 'ArrowUp', 'vertical')).toBe(2);
    expect(findRovingFocusIndex(items, 0, 'ArrowRight', 'vertical')).toBeUndefined();
  });

  it('moves Home and End to the collection boundaries in either orientation', () => {
    expect(findRovingFocusIndex(items, 1, 'Home', 'horizontal')).toBe(0);
    expect(findRovingFocusIndex(items, 1, 'End', 'vertical')).toBe(2);
  });

  it('skips disabled items while moving, wrapping, and resolving boundaries', () => {
    const choices = [
      { label: 'First', disabled: true },
      { label: 'Second' },
      { label: 'Third', disabled: true }
    ];
    const isDisabled = (item: (typeof choices)[number]) => item.disabled === true;

    expect(findRovingFocusIndex(choices, 1, 'ArrowRight', 'horizontal', isDisabled)).toBe(1);
    expect(findRovingFocusIndex(choices, 2, 'Home', 'horizontal', isDisabled)).toBe(1);
    expect(findRovingFocusIndex(choices, 0, 'End', 'vertical', isDisabled)).toBe(1);
  });

  it('returns no target for empty or fully disabled collections', () => {
    expect(findRovingFocusIndex([], 0, 'Home', 'horizontal')).toBe(-1);
    expect(findRovingFocusIndex([{ disabled: true }], 0, 'ArrowDown', 'vertical', (item) => item.disabled)).toBe(-1);
  });

  it('uses the latest collection after items are added or removed', () => {
    const dynamicItems = ['First', 'Second'];
    expect(findRovingFocusIndex(dynamicItems, 1, 'ArrowDown', 'vertical')).toBe(0);

    dynamicItems.splice(1, 1);
    expect(findRovingFocusIndex(dynamicItems, 1, 'End', 'vertical')).toBe(0);

    dynamicItems.push('Third');
    expect(findRovingFocusIndex(dynamicItems, 0, 'End', 'vertical')).toBe(1);
  });
});
