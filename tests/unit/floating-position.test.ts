import { describe, expect, it, vi } from 'vitest';
import {
  autoUpdateFloatingPosition,
  computeFloatingPosition,
  positionFloatingElement,
  readCssPixel
} from '../../packages/webaseui-svelte/src/lib/internal/floating-position.js';

const viewport = { x: 0, y: 0, width: 320, height: 240 };

describe('computeFloatingPosition', () => {
  it('uses stable defaults when no placement options are provided', () => {
    expect(computeFloatingPosition(
      { top: 10, right: 60, bottom: 30, left: 10, width: 50, height: 20 },
      { width: 40, height: 30 },
      viewport
    )).toEqual({
      x: 10,
      y: 30,
      width: undefined,
      maxWidth: 320,
      maxHeight: 210,
      side: 'bottom',
      align: 'start'
    });
  });

  it('places a start-aligned anchor-width overlay on its preferred side', () => {
    expect(computeFloatingPosition(
      { top: 40, right: 140, bottom: 80, left: 40, width: 100, height: 40 },
      { width: 60, height: 80 },
      viewport,
      { offset: 8, viewportPadding: 10, matchAnchorWidth: true, maxHeight: 120 }
    )).toEqual({
      x: 40,
      y: 88,
      width: 100,
      maxWidth: 300,
      maxHeight: 120,
      side: 'bottom',
      align: 'start'
    });
  });

  it('flips to the roomier side and shifts centered content inside the viewport', () => {
    const result = computeFloatingPosition(
      { top: 190, right: 316, bottom: 230, left: 276, width: 40, height: 40 },
      { width: 180, height: 100 },
      viewport,
      { side: 'bottom', align: 'center', offset: 6, viewportPadding: 8, maxWidth: 200 }
    );

    expect(result).toMatchObject({ x: 132, y: 84, side: 'top', align: 'center', maxHeight: 176 });
    expect(result.width).toBeUndefined();
  });

  it('supports end alignment and constrains height when neither side fully fits', () => {
    const result = computeFloatingPosition(
      { top: 96, right: 180, bottom: 152, left: 120, width: 60, height: 56 },
      { width: 90, height: 200 },
      viewport,
      { side: 'top', align: 'end', offset: 4, viewportPadding: 8, maxHeight: 180 }
    );

    expect(result).toMatchObject({ x: 90, y: 8, side: 'top', maxHeight: 84, maxWidth: 304 });
  });

  it('treats start and end as logical alignments in right-to-left layouts', () => {
    const anchor = { top: 40, right: 180, bottom: 80, left: 100, width: 80, height: 40 };
    const floating = { width: 50, height: 40 };
    const start = computeFloatingPosition(anchor, floating, viewport, { align: 'start', direction: 'rtl' });
    const end = computeFloatingPosition(anchor, floating, viewport, { align: 'end', direction: 'rtl' });

    expect(start.x).toBe(130);
    expect(end.x).toBe(100);
  });
});

function createPositionFixture() {
  const style = { width: '', maxWidth: '', maxHeight: '', left: '', top: '' };
  const visualViewport = { offsetLeft: 12, offsetTop: 18, width: 280, height: 180 };
  const view = {
    visualViewport,
    innerWidth: 320,
    innerHeight: 240,
    getComputedStyle: vi.fn(() => ({ getPropertyValue: () => '11.5px' }))
  };
  const ownerDocument = {
    defaultView: view,
    documentElement: { clientWidth: 320, clientHeight: 240 }
  };
  const anchor = {
    ownerDocument,
    getBoundingClientRect: () => ({ top: 130, right: 282, bottom: 160, left: 202, width: 80, height: 30 })
  };
  const floating = {
    ownerDocument,
    style,
    dataset: {} as Record<string, string>,
    clientHeight: 60,
    scrollHeight: 100,
    getBoundingClientRect: () => ({ top: 0, right: 0, bottom: 0, left: 0, width: 80, height: 62 })
  };
  return { anchor, floating, style };
}

describe('positionFloatingElement', () => {
  it('uses visual viewport offsets, intrinsic scroll height, and applies styles', () => {
    const { anchor, floating, style } = createPositionFixture();
    const result = positionFloatingElement(
      anchor as unknown as HTMLElement,
      floating as unknown as HTMLElement,
      { side: 'bottom', align: 'end', offset: 4, viewportPadding: 8, matchAnchorWidth: true, maxHeight: 120 }
    );

    expect(result.side).toBe('top');
    expect(result.x).toBe(202);
    expect(style).toMatchObject({ left: '202px', top: '26px', width: '80px', maxHeight: '100px' });
    expect(floating.dataset).toEqual({ side: 'top', align: 'end' });
  });

  it('reads resolved CSS pixels and falls back for non-numeric values', () => {
    const { anchor } = createPositionFixture();
    expect(readCssPixel(anchor as unknown as HTMLElement, '--offset')).toBe(11.5);

    anchor.ownerDocument.defaultView = {
      ...anchor.ownerDocument.defaultView,
      getComputedStyle: vi.fn(() => ({ getPropertyValue: () => 'auto' }))
    };
    expect(readCssPixel(anchor as unknown as HTMLElement, '--offset', 7)).toBe(7);
  });

  it('uses layout viewport and document fallbacks without forcing a width', () => {
    const style = { width: 'old', maxWidth: '', maxHeight: 'old', left: '', top: '' };
    const documentElement = { clientWidth: 240, clientHeight: 180 };
    const ownerDocument = {
      defaultView: null as null | { innerWidth: number; innerHeight: number },
      documentElement
    };
    const anchor = {
      ownerDocument,
      getBoundingClientRect: () => ({ top: 20, right: 80, bottom: 50, left: 20, width: 60, height: 30 })
    };
    const floating = {
      ownerDocument,
      style,
      dataset: {} as Record<string, string>,
      clientHeight: 42,
      scrollHeight: 40,
      getBoundingClientRect: () => ({ top: 0, right: 0, bottom: 0, left: 0, width: 100, height: 40 })
    };

    const first = positionFloatingElement(anchor as unknown as HTMLElement, floating as unknown as HTMLElement);
    expect(first).toMatchObject({ x: 20, y: 50, maxWidth: 240, maxHeight: 130 });
    expect(style.width).toBe('');
    expect(readCssPixel(anchor as unknown as HTMLElement, '--missing', 3)).toBe(3);

    ownerDocument.defaultView = { innerWidth: 260, innerHeight: 200 };
    const second = positionFloatingElement(anchor as unknown as HTMLElement, floating as unknown as HTMLElement, {
      side: 'top',
      maxWidth: 90
    });
    expect(second).toMatchObject({ side: 'bottom', maxWidth: 90 });
  });
});

describe('autoUpdateFloatingPosition', () => {
  it('observes scroll, resize, visual viewport, and both elements with batched updates', () => {
    const listeners = new Map<string, () => void>();
    const visualListeners = new Map<string, () => void>();
    const frames = new Map<number, () => void>();
    let frameId = 0;
    const observe = vi.fn();
    const disconnect = vi.fn();
    class ResizeObserverMock {
      constructor(_callback: ResizeObserverCallback) {}
      observe = observe;
      disconnect = disconnect;
    }
    const view = {
      addEventListener: vi.fn((type: string, listener: () => void) => listeners.set(type, listener)),
      removeEventListener: vi.fn(),
      requestAnimationFrame: vi.fn((callback: () => void) => {
        frameId += 1;
        frames.set(frameId, callback);
        return frameId;
      }),
      cancelAnimationFrame: vi.fn((id: number) => frames.delete(id)),
      visualViewport: {
        addEventListener: vi.fn((type: string, listener: () => void) => visualListeners.set(type, listener)),
        removeEventListener: vi.fn()
      },
      ResizeObserver: ResizeObserverMock
    };
    const anchor = { ownerDocument: { defaultView: view } } as unknown as HTMLElement;
    const floating = {} as HTMLElement;
    const update = vi.fn();

    const stop = autoUpdateFloatingPosition(anchor, floating, update);
    expect(update).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledTimes(2);

    listeners.get('scroll')?.();
    visualListeners.get('resize')?.();
    expect(view.requestAnimationFrame).toHaveBeenCalledTimes(1);
    frames.get(1)?.();
    expect(update).toHaveBeenCalledTimes(2);

    listeners.get('resize')?.();
    const stoppedFrame = frames.get(2);
    stop();
    stop();
    expect(view.cancelAnimationFrame).toHaveBeenCalledWith(2);
    expect(disconnect).toHaveBeenCalledTimes(1);
    stoppedFrame?.();
    expect(update).toHaveBeenCalledTimes(2);
  });

  it('updates synchronously without animation frames and works without a window', () => {
    const update = vi.fn();
    const view = {
      addEventListener: vi.fn((_type: string, listener: () => void) => listener()),
      removeEventListener: vi.fn()
    };
    const anchor = { ownerDocument: { defaultView: view } } as unknown as HTMLElement;
    const stop = autoUpdateFloatingPosition(anchor, {} as HTMLElement, update);
    expect(update.mock.calls.length).toBeGreaterThan(1);
    stop();

    const windowlessUpdate = vi.fn();
    const stopWindowless = autoUpdateFloatingPosition(
      { ownerDocument: { defaultView: null } } as unknown as HTMLElement,
      {} as HTMLElement,
      windowlessUpdate
    );
    expect(windowlessUpdate).toHaveBeenCalledTimes(1);
    stopWindowless();
  });
});
