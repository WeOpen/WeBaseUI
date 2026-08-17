type ManualPopoverElement = HTMLElement & {
  hidePopover?: () => void;
  showPopover?: () => void;
};

function supportsPopover(element: ManualPopoverElement): boolean {
  return typeof element.showPopover === 'function' && typeof element.hidePopover === 'function';
}

function isPopoverOpen(element: ManualPopoverElement): boolean {
  try {
    return element.matches(':popover-open');
  } catch {
    return false;
  }
}

/**
 * Keep a manual popover synchronized with component state. Browsers without
 * the Popover API use the element's hidden state and fixed-position styles.
 */
export function synchronizeManualPopover(element: ManualPopoverElement, open: boolean): boolean {
  const nativePopover = supportsPopover(element);

  if (!nativePopover) {
    element.removeAttribute('popover');
    element.hidden = !open;
    return false;
  }

  if (open) {
    element.hidden = false;
    if (!isPopoverOpen(element)) {
      try {
        element.showPopover?.();
      } catch {
        // A disconnected element can reject showPopover during teardown.
      }
    }
  } else {
    if (isPopoverOpen(element)) {
      try {
        element.hidePopover?.();
      } catch {
        // The browser may already have removed the element from the top layer.
      }
    }
    element.hidden = true;
  }

  return true;
}
