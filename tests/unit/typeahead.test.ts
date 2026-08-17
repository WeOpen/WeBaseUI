import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createTypeaheadController,
  findTypeaheadMatchIndex
} from '../../packages/webaseui-svelte/src/lib/internal/typeahead.js';

afterEach(() => {
  vi.useRealTimers();
});

const options = [
  { label: 'Alpha', disabled: true },
  { label: 'Beta' },
  { label: 'Bravo' },
  { label: 'Release' }
];
const itemText = (item: (typeof options)[number]) => item.label;
const isDisabled = (item: (typeof options)[number]) => item.disabled === true;

function createController(delay = 500) {
  return createTypeaheadController(
    {
      setTimeout: (callback, timeout) => globalThis.setTimeout(callback, timeout),
      clearTimeout: (handle) => globalThis.clearTimeout(handle)
    },
    delay
  );
}

describe('findTypeaheadMatchIndex', () => {
  it('matches case-insensitively from a cyclic start while skipping disabled items', () => {
    expect(findTypeaheadMatchIndex(options, 'BR', 1, itemText, isDisabled)).toBe(2);
    expect(findTypeaheadMatchIndex(options, 'be', 2, itemText, isDisabled)).toBe(1);
    expect(findTypeaheadMatchIndex(options, 'al', 0, itemText, isDisabled)).toBe(-1);
  });

  it('returns no match for empty input, unmatched input, or an empty collection', () => {
    expect(findTypeaheadMatchIndex(options, '', 0, itemText)).toBe(-1);
    expect(findTypeaheadMatchIndex(options, 'missing', 0, itemText)).toBe(-1);
    expect(findTypeaheadMatchIndex([], 'a', 0, () => '')).toBe(-1);
  });

  it('uses the latest dynamic collection for every lookup', () => {
    const dynamicOptions = options.slice();
    expect(findTypeaheadMatchIndex(dynamicOptions, 'br', 0, itemText)).toBe(2);

    dynamicOptions.splice(2, 1);
    expect(findTypeaheadMatchIndex(dynamicOptions, 'br', 0, itemText)).toBe(-1);

    dynamicOptions.push({ label: 'Broadcast' });
    expect(findTypeaheadMatchIndex(dynamicOptions, 'br', 0, itemText)).toBe(3);
  });
});

describe('createTypeaheadController', () => {
  it('builds a multi-character query and refines from the current match', () => {
    vi.useFakeTimers();
    const controller = createController();

    expect(controller.search(options, 0, 'b', itemText, isDisabled)).toBe(1);
    expect(controller.search(options, 1, 'r', itemText, isDisabled)).toBe(2);
  });

  it('cycles repeated characters through matching enabled items', () => {
    vi.useFakeTimers();
    const controller = createController();

    expect(controller.search(options, 0, 'b', itemText, isDisabled)).toBe(1);
    expect(controller.search(options, 1, 'B', itemText, isDisabled)).toBe(2);
    expect(controller.search(options, 2, 'b', itemText, isDisabled)).toBe(1);
  });

  it('starts a new query after the reset delay expires', () => {
    vi.useFakeTimers();
    const controller = createController(500);

    expect(controller.search(options, 0, 'b', itemText, isDisabled)).toBe(1);
    vi.advanceTimersByTime(500);
    expect(controller.search(options, 1, 'r', itemText, isDisabled)).toBe(3);
  });

  it('ignores non-printable and whitespace keys without scheduling a reset', () => {
    const scheduler = {
      setTimeout: vi.fn(() => Symbol('timer')),
      clearTimeout: vi.fn()
    };
    const controller = createTypeaheadController(scheduler);

    expect(controller.search(options, 0, 'ArrowDown', itemText)).toBeUndefined();
    expect(controller.search(options, 0, ' ', itemText)).toBeUndefined();
    expect(scheduler.setTimeout).not.toHaveBeenCalled();
  });

  it('cancels a pending reset exactly once when disposed', () => {
    const scheduler = {
      setTimeout: vi.fn(() => Symbol('timer')),
      clearTimeout: vi.fn()
    };
    const controller = createTypeaheadController(scheduler);

    controller.search(options, 0, 'b', itemText);
    controller.reset();
    controller.reset();

    expect(scheduler.clearTimeout).toHaveBeenCalledTimes(1);
  });
});
