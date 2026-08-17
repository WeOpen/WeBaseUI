export interface TimeoutScheduler<Handle> {
  setTimeout(callback: () => void, delay: number): Handle;
  clearTimeout(handle: Handle): void;
}

export interface AutoDismissState {
  open: boolean;
  paused: boolean;
  duration: number;
}

/**
 * Schedule one auto-dismiss cycle for a mounted notification.
 *
 * The component remains responsible for starting a fresh cycle whenever its
 * reactive state changes. Keeping that lifecycle boundary outside this helper
 * makes pause, resume, and cancellation deterministic and independently
 * testable without introducing a long-lived timer controller.
 */
export function scheduleAutoDismiss<Handle>(
  state: AutoDismissState,
  onDismiss: () => void,
  scheduler: TimeoutScheduler<Handle>
): () => void {
  if (!state.open || state.paused || state.duration <= 0) return () => {};

  const handle = scheduler.setTimeout(onDismiss, state.duration);
  let active = true;

  return () => {
    if (!active) return;
    active = false;
    scheduler.clearTimeout(handle);
  };
}
