import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDialogLifecycle } from '../../packages/webaseui-svelte/src/lib/internal/dialog-lifecycle.js';

afterEach(() => {
  vi.useRealTimers();
});

function createDialog(open: boolean, overflow = 'clip') {
  const body = { style: { overflow } };
  const trigger = {
    isConnected: true,
    focus: vi.fn()
  };
  const ownerDocument = {
    body,
    activeElement: trigger as unknown,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  };
  trigger.focus.mockImplementation(() => {
    ownerDocument.activeElement = trigger;
  });

  const dialog = {
    open,
    ownerDocument,
    close: vi.fn(() => {
      dialog.open = false;
      ownerDocument.activeElement = body;
    }),
    contains: vi.fn((target: Node | null) => target as unknown === dialog),
    showModal: vi.fn(() => {
      dialog.open = true;
      ownerDocument.activeElement = dialog;
    })
  };
  return { body, dialog, ownerDocument, trigger };
}

describe('createDialogLifecycle', () => {
  it('leaves an already closed dialog unchanged', () => {
    const { dialog } = createDialog(false);
    const lifecycle = createDialogLifecycle();

    expect(lifecycle.synchronize(dialog, false)).toBeUndefined();
    expect(dialog.close).not.toHaveBeenCalled();
    expect(dialog.showModal).not.toHaveBeenCalled();
    expect(dialog.ownerDocument.body.style.overflow).toBe('clip');
  });

  it('closes a native dialog when controlled state becomes false', () => {
    const { dialog } = createDialog(true);
    const lifecycle = createDialogLifecycle();

    expect(lifecycle.synchronize(dialog, false)).toBeUndefined();
    expect(dialog.close).toHaveBeenCalledTimes(1);
    expect(dialog.open).toBe(false);
  });

  it('opens a closed dialog, locks scrolling, and restores the prior overflow on cleanup', () => {
    const { dialog } = createDialog(false);
    const lifecycle = createDialogLifecycle();

    const cleanup = lifecycle.synchronize(dialog, true);

    expect(dialog.showModal).toHaveBeenCalledTimes(1);
    expect(dialog.open).toBe(true);
    expect(dialog.ownerDocument.body.style.overflow).toBe('hidden');

    cleanup?.();
    expect(dialog.ownerDocument.body.style.overflow).toBe('clip');
  });

  it('does not call showModal again for an already open native dialog', () => {
    const { dialog } = createDialog(true, 'auto');
    const lifecycle = createDialogLifecycle();

    const cleanup = lifecycle.synchronize(dialog, true);

    expect(dialog.showModal).not.toHaveBeenCalled();
    expect(dialog.ownerDocument.body.style.overflow).toBe('hidden');

    cleanup?.();
    expect(dialog.ownerDocument.body.style.overflow).toBe('auto');
  });

  it('restores the opening focus target after native close settles', () => {
    const scheduled: Array<() => void> = [];
    const { dialog, trigger } = createDialog(false);
    const lifecycle = createDialogLifecycle((callback) => scheduled.push(callback));

    lifecycle.synchronize(dialog, true);
    dialog.close();
    lifecycle.restoreFocus();

    expect(trigger.focus).not.toHaveBeenCalled();
    expect(scheduled).toHaveLength(1);
    scheduled[0]?.();
    expect(trigger.focus).toHaveBeenCalledTimes(1);
  });

  it('uses the opening click target when WebKit leaves activeElement on body', () => {
    const scheduled: Array<() => void> = [];
    const { body, dialog, ownerDocument, trigger } = createDialog(false);
    const lifecycle = createDialogLifecycle((callback) => scheduled.push(callback));
    let clickListener: ((event: MouseEvent) => void) | undefined;
    ownerDocument.addEventListener.mockImplementation((_type, listener) => {
      clickListener = listener;
    });

    const stop = lifecycle.listenForInteractionTarget(ownerDocument);
    clickListener?.({ target: body } as unknown as MouseEvent);
    ownerDocument.activeElement = body;
    clickListener?.({ target: trigger } as unknown as MouseEvent);
    lifecycle.synchronize(dialog, true);
    dialog.close();
    lifecycle.restoreFocus();
    scheduled.forEach((callback) => callback());

    expect(trigger.focus).toHaveBeenCalledTimes(1);
    stop();
    expect(ownerDocument.removeEventListener).toHaveBeenCalledWith('click', clickListener, true);
  });

  it('does not reuse a stale click target for a later programmatic open', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    const scheduled: Array<() => void> = [];
    const { body, dialog, ownerDocument, trigger } = createDialog(false);
    const lifecycle = createDialogLifecycle((callback) => scheduled.push(callback));
    let clickListener: ((event: MouseEvent) => void) | undefined;
    ownerDocument.addEventListener.mockImplementation((_type, listener) => {
      clickListener = listener;
    });

    lifecycle.listenForInteractionTarget(ownerDocument);
    clickListener?.({ target: trigger } as unknown as MouseEvent);
    vi.setSystemTime(2_001);
    ownerDocument.activeElement = body;
    lifecycle.synchronize(dialog, true);
    dialog.close();
    lifecycle.restoreFocus();

    expect(scheduled).toHaveLength(0);
  });

  it('falls back to the current click when activeElement is not focusable', () => {
    const scheduled: Array<() => void> = [];
    const { dialog, ownerDocument, trigger } = createDialog(false);
    const lifecycle = createDialogLifecycle((callback) => scheduled.push(callback));
    let clickListener: ((event: MouseEvent) => void) | undefined;
    ownerDocument.addEventListener.mockImplementation((_type, listener) => {
      clickListener = listener;
    });

    lifecycle.listenForInteractionTarget(ownerDocument);
    clickListener?.({ target: trigger } as unknown as MouseEvent);
    ownerDocument.activeElement = {};
    lifecycle.synchronize(dialog, true);
    dialog.close();
    lifecycle.restoreFocus();
    scheduled.forEach((callback) => callback());

    expect(trigger.focus).toHaveBeenCalledTimes(1);
  });

  it.each([null, 'body', {}, { focus: 'not-a-function' }])(
    'ignores a non-focusable active element %#',
    (activeElement) => {
      const scheduled: Array<() => void> = [];
      const { dialog, ownerDocument } = createDialog(false);
      const lifecycle = createDialogLifecycle((callback) => scheduled.push(callback));
      ownerDocument.activeElement = activeElement;

      lifecycle.synchronize(dialog, true);
      dialog.close();
      lifecycle.restoreFocus();

      expect(scheduled).toHaveLength(0);
    }
  );

  it('uses a microtask by default so native close can settle before restoration', async () => {
    const { dialog, trigger } = createDialog(false);
    const lifecycle = createDialogLifecycle();

    lifecycle.synchronize(dialog, true);
    dialog.close();
    lifecycle.restoreFocus();

    expect(trigger.focus).not.toHaveBeenCalled();
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    expect(trigger.focus).toHaveBeenCalledTimes(1);
  });

  it('treats missing or non-focusable opening targets as a restoration no-op', () => {
    const scheduled: Array<() => void> = [];
    const lifecycle = createDialogLifecycle((callback) => scheduled.push(callback));
    lifecycle.restoreFocus();

    const { body, dialog, ownerDocument } = createDialog(false);
    ownerDocument.activeElement = body;
    lifecycle.synchronize(dialog, true);
    dialog.close();
    lifecycle.restoreFocus();

    expect(scheduled).toHaveLength(0);
  });

  it('does not override focus explicitly moved by a close callback', () => {
    const scheduled: Array<() => void> = [];
    const { dialog, ownerDocument, trigger } = createDialog(false);
    const consumerTarget = { focus: vi.fn() };
    const lifecycle = createDialogLifecycle((callback) => scheduled.push(callback));

    lifecycle.synchronize(dialog, true);
    dialog.close();
    ownerDocument.activeElement = consumerTarget;
    lifecycle.restoreFocus();
    scheduled[0]?.();

    expect(trigger.focus).not.toHaveBeenCalled();
  });

  it('restores when WebKit leaves focus inside the closed dialog', () => {
    const scheduled: Array<() => void> = [];
    const { dialog, ownerDocument, trigger } = createDialog(false);
    const dialogControl = {} as Node;
    const lifecycle = createDialogLifecycle((callback) => scheduled.push(callback));

    lifecycle.synchronize(dialog, true);
    dialog.close();
    ownerDocument.activeElement = dialogControl;
    dialog.contains.mockImplementation((target) => target === dialogControl);
    lifecycle.restoreFocus();
    scheduled[0]?.();

    expect(trigger.focus).toHaveBeenCalledTimes(1);
  });

  it('skips a trigger removed before or during deferred restoration', () => {
    const scheduled: Array<() => void> = [];
    const first = createDialog(false);
    const lifecycle = createDialogLifecycle((callback) => scheduled.push(callback));

    lifecycle.synchronize(first.dialog, true);
    first.trigger.isConnected = false;
    lifecycle.restoreFocus();
    expect(scheduled).toHaveLength(0);

    const second = createDialog(false);
    lifecycle.synchronize(second.dialog, true);
    lifecycle.restoreFocus();
    second.trigger.isConnected = false;
    scheduled[0]?.();
    expect(second.trigger.focus).not.toHaveBeenCalled();
  });
});
