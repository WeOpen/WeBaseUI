interface ScrollLockDocument {
  body: {
    style: {
      overflow: string;
    };
  };
}

interface ScrollLockState {
  count: number;
  previousOverflow: string;
}

interface PointerOutsideDocument {
  addEventListener(type: 'pointerdown', listener: (event: PointerEvent) => void): void;
  removeEventListener(type: 'pointerdown', listener: (event: PointerEvent) => void): void;
}

interface PointerOutsideRoot {
  ownerDocument: PointerOutsideDocument;
  contains(target: Node | null): boolean;
}

const scrollLocks = new WeakMap<object, ScrollLockState>();

/**
 * Lock body scrolling with reference counting so nested overlays restore the
 * consumer's original inline overflow value only after the final release.
 */
export function acquireBodyScrollLock(targetDocument: ScrollLockDocument): () => void {
  const documentKey = targetDocument as object;
  const existing = scrollLocks.get(documentKey);

  if (existing) {
    existing.count += 1;
  } else {
    scrollLocks.set(documentKey, {
      count: 1,
      previousOverflow: targetDocument.body.style.overflow
    });
    targetDocument.body.style.overflow = 'hidden';
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;

    const current = scrollLocks.get(documentKey);
    if (!current) return;
    current.count -= 1;

    if (current.count === 0) {
      targetDocument.body.style.overflow = current.previousOverflow;
      scrollLocks.delete(documentKey);
    }
  };
}

/** Register one pointer listener and dismiss only when the target is outside. */
export function listenForPointerOutside(root: PointerOutsideRoot, onOutside: (event: PointerEvent) => void): () => void {
  const handlePointerDown = (event: PointerEvent) => {
    if (!root.contains(event.target as Node | null)) onOutside(event);
  };

  root.ownerDocument.addEventListener('pointerdown', handlePointerDown);
  return () => root.ownerDocument.removeEventListener('pointerdown', handlePointerDown);
}
