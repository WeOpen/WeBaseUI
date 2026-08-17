import { describe, expect, it, vi } from 'vitest';
import { synchronizeManualPopover } from '../../packages/webaseui-svelte/src/lib/internal/popover.js';

function createPopover(native = true) {
  let open = false;
  const element = {
    hidden: true,
    matches: vi.fn(() => open),
    removeAttribute: vi.fn(),
    showPopover: native ? vi.fn(() => { open = true; }) : undefined,
    hidePopover: native ? vi.fn(() => { open = false; }) : undefined
  };
  return element;
}

describe('synchronizeManualPopover', () => {
  it('uses hidden-state fallback and removes unsupported popover semantics', () => {
    const element = createPopover(false);

    expect(synchronizeManualPopover(element as unknown as HTMLElement, true)).toBe(false);
    expect(element.hidden).toBe(false);
    expect(element.removeAttribute).toHaveBeenCalledWith('popover');

    synchronizeManualPopover(element as unknown as HTMLElement, false);
    expect(element.hidden).toBe(true);
  });

  it('opens and closes a native manual popover idempotently', () => {
    const element = createPopover();

    expect(synchronizeManualPopover(element as unknown as HTMLElement, true)).toBe(true);
    synchronizeManualPopover(element as unknown as HTMLElement, true);
    expect(element.showPopover).toHaveBeenCalledTimes(1);
    expect(element.hidden).toBe(false);

    synchronizeManualPopover(element as unknown as HTMLElement, false);
    synchronizeManualPopover(element as unknown as HTMLElement, false);
    expect(element.hidePopover).toHaveBeenCalledTimes(1);
    expect(element.hidden).toBe(true);
  });

  it('tolerates selector and native method races during teardown', () => {
    const element = createPopover();
    element.matches.mockImplementation(() => { throw new Error('detached'); });
    element.showPopover?.mockImplementation(() => { throw new Error('detached'); });

    expect(() => synchronizeManualPopover(element as unknown as HTMLElement, true)).not.toThrow();
    expect(() => synchronizeManualPopover(element as unknown as HTMLElement, false)).not.toThrow();
    expect(element.hidden).toBe(true);
  });
});
