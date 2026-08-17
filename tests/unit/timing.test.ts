import { afterEach, describe, expect, it, vi } from 'vitest';
import { scheduleAutoDismiss } from '../../packages/webaseui-svelte/src/lib/internal/timing.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('scheduleAutoDismiss', () => {
  it('dismisses once after the configured duration', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const cleanup = scheduleAutoDismiss(
      { open: true, paused: false, duration: 500 },
      onDismiss,
      {
        setTimeout: (callback, delay) => globalThis.setTimeout(callback, delay),
        clearTimeout: (handle) => globalThis.clearTimeout(handle)
      }
    );

    vi.advanceTimersByTime(499);
    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it.each([
    { open: false, paused: false, duration: 500 },
    { open: true, paused: true, duration: 500 },
    { open: true, paused: false, duration: 0 },
    { open: true, paused: false, duration: -1 }
  ])('does not schedule inactive state $open/$paused/$duration', (state) => {
    const scheduler = {
      setTimeout: vi.fn(() => Symbol('timer')),
      clearTimeout: vi.fn()
    };

    const cleanup = scheduleAutoDismiss(state, vi.fn(), scheduler);

    expect(scheduler.setTimeout).not.toHaveBeenCalled();
    cleanup();
    expect(scheduler.clearTimeout).not.toHaveBeenCalled();
  });

  it('cancels a pending cycle exactly once so pause and close transitions are safe', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const clearTimeout = vi.fn((handle: ReturnType<typeof globalThis.setTimeout>) => globalThis.clearTimeout(handle));
    const cleanup = scheduleAutoDismiss(
      { open: true, paused: false, duration: 500 },
      onDismiss,
      {
        setTimeout: (callback, delay) => globalThis.setTimeout(callback, delay),
        clearTimeout
      }
    );

    cleanup();
    cleanup();
    vi.advanceTimersByTime(500);

    expect(clearTimeout).toHaveBeenCalledTimes(1);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('starts a full fresh cycle when a paused notification resumes', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const scheduler = {
      setTimeout: (callback: () => void, delay: number) => globalThis.setTimeout(callback, delay),
      clearTimeout: (handle: ReturnType<typeof globalThis.setTimeout>) => globalThis.clearTimeout(handle)
    };

    const cancelBeforePause = scheduleAutoDismiss(
      { open: true, paused: false, duration: 500 },
      onDismiss,
      scheduler
    );
    vi.advanceTimersByTime(300);
    cancelBeforePause();
    scheduleAutoDismiss({ open: true, paused: true, duration: 500 }, onDismiss, scheduler);
    vi.advanceTimersByTime(500);
    expect(onDismiss).not.toHaveBeenCalled();

    scheduleAutoDismiss({ open: true, paused: false, duration: 500 }, onDismiss, scheduler);
    vi.advanceTimersByTime(499);
    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
