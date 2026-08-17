import { acquireBodyScrollLock } from './overlay.js';

interface FocusTarget extends Element {
  focus(): void;
}

type ScheduleFocusRestore = (callback: () => void) => void;

function asFocusTarget(value: unknown): FocusTarget | undefined {
  if (!value || typeof value !== 'object' || !('focus' in value)) return;
  return typeof value.focus === 'function' ? value as FocusTarget : undefined;
}

export function createDialogLifecycle(
  scheduleFocusRestore: ScheduleFocusRestore = queueMicrotask
) {
  let focusTarget: FocusTarget | undefined;
  let focusDocument: Document | undefined;
  let activeDialog: HTMLDialogElement | undefined;
  let lastInteractionTarget: FocusTarget | undefined;
  let lastInteractionAt = 0;

  function listenForInteractionTarget(targetDocument: Document): () => void {
    const handleClick = (event: MouseEvent) => {
      lastInteractionTarget = event.target === targetDocument.body ? undefined : asFocusTarget(event.target);
      lastInteractionAt = lastInteractionTarget ? Date.now() : 0;
    };

    targetDocument.addEventListener('click', handleClick, true);
    return () => targetDocument.removeEventListener('click', handleClick, true);
  }

  function synchronize(dialog: HTMLDialogElement, requestedOpen: boolean): (() => void) | undefined {
    if (!requestedOpen) {
      if (dialog.open) dialog.close();
      return;
    }

    if (!dialog.open) {
      const activeElement = dialog.ownerDocument.activeElement;
      const recentInteractionTarget = lastInteractionTarget && Date.now() - lastInteractionAt <= 1_000
        ? lastInteractionTarget
        : undefined;
      focusTarget = activeElement === dialog.ownerDocument.body
        ? recentInteractionTarget
        : asFocusTarget(activeElement) ?? recentInteractionTarget;
      lastInteractionTarget = undefined;
      lastInteractionAt = 0;
      focusDocument = dialog.ownerDocument;
      activeDialog = dialog;
      dialog.showModal();
    }

    return acquireBodyScrollLock(dialog.ownerDocument);
  }

  function restoreFocus() {
    const target = focusTarget;
    const targetDocument = focusDocument;
    const dialog = activeDialog;
    focusTarget = undefined;
    focusDocument = undefined;
    activeDialog = undefined;

    if (!target || !targetDocument || target.isConnected === false) return;
    scheduleFocusRestore(() => {
      if (target.isConnected === false) return;
      const current = targetDocument.activeElement;
      if (
        !current || current === targetDocument.body || current === dialog || current === target || dialog?.contains(current)
      ) target.focus();
    });
  }

  return { listenForInteractionTarget, restoreFocus, synchronize };
}
