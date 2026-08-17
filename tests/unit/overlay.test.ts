import { describe, expect, it, vi } from 'vitest';
import { acquireBodyScrollLock, listenForPointerOutside } from '../../packages/webaseui-svelte/src/lib/internal/overlay.js';

describe('acquireBodyScrollLock', () => {
  it('restores the original overflow value after the last nested release', () => {
    const targetDocument = { body: { style: { overflow: 'clip' } } };
    const releaseFirst = acquireBodyScrollLock(targetDocument);
    const releaseSecond = acquireBodyScrollLock(targetDocument);

    expect(targetDocument.body.style.overflow).toBe('hidden');
    releaseFirst();
    expect(targetDocument.body.style.overflow).toBe('hidden');
    releaseSecond();
    expect(targetDocument.body.style.overflow).toBe('clip');
  });

  it('makes each release callback idempotent', () => {
    const targetDocument = { body: { style: { overflow: '' } } };
    const release = acquireBodyScrollLock(targetDocument);

    release();
    release();
    expect(targetDocument.body.style.overflow).toBe('');
  });
});

describe('listenForPointerOutside', () => {
  it('ignores contained targets, reports outside targets, and unregisters', () => {
    const inside = {} as Node;
    const outside = {} as Node;
    let listener: ((event: PointerEvent) => void) | undefined;
    const ownerDocument = {
      addEventListener: vi.fn((_type: 'pointerdown', nextListener: (event: PointerEvent) => void) => {
        listener = nextListener;
      }),
      removeEventListener: vi.fn()
    };
    const root = {
      ownerDocument,
      contains: (target: Node | null) => target === inside
    };
    const onOutside = vi.fn();

    const stop = listenForPointerOutside(root, onOutside);
    listener?.({ target: inside } as unknown as PointerEvent);
    listener?.({ target: outside } as unknown as PointerEvent);

    expect(onOutside).toHaveBeenCalledTimes(1);
    stop();
    expect(ownerDocument.removeEventListener).toHaveBeenCalledWith('pointerdown', listener);
  });
});
