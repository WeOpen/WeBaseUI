<script lang="ts">
  import type { HTMLDialogAttributes } from 'svelte/elements';
  import { createDialogLifecycle } from '../internal/dialog-lifecycle.js';
  import WeBaseIcon from './WeBaseIcon.svelte';

  interface Props extends Omit<HTMLDialogAttributes, 'children' | 'id' | 'onclick' | 'onclose' | 'oncancel' | 'open' | 'title'> {
    open?: boolean;
    title?: string;
    message?: string;
    id?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    closeLabel?: string;
    kicker?: string;
    onconfirm?: (event: MouseEvent) => void;
    oncancel?: (event: Event) => void;
    onclick?: (event: MouseEvent) => void;
    onclose?: (event: Event) => void;
  }
  const uid = $props.id();
  const dialogLifecycle = createDialogLifecycle();
  let { open = $bindable(false), title = 'A quiet confirmation', message = 'Dialogs keep consequential actions in focus.', id = uid, confirmLabel = 'Confirm', cancelLabel = 'Cancel', closeLabel = 'Close dialog', kicker = 'Dialog / modal', onconfirm, oncancel, onclick, onclose, class: className = '', ...rest }: Props = $props();
  let dialog = $state<HTMLDialogElement>();

  function cancelDialog(event: Event) {
    oncancel?.(event);
    if (!event.defaultPrevented && dialog?.open) dialog.close('cancel');
  }

  function confirmDialog(event: MouseEvent) {
    onconfirm?.(event);
    if (!event.defaultPrevented && dialog?.open) dialog.close('confirm');
  }

  function handleClose(event: Event) {
    onclose?.(event);
    open = false;
    dialogLifecycle.restoreFocus();
  }

  function handleDialogClick(event: MouseEvent) {
    onclick?.(event);
    if (!event.defaultPrevented && event.target === dialog) cancelDialog(event);
  }

  // showModal() gives the focus trap, background inertness, and Escape handling.
  // The lifecycle helper adds scroll locking and a WebKit focus-restore fallback.
  $effect(() => {
    if (!dialog) return;
    return dialogLifecycle.listenForInteractionTarget(dialog.ownerDocument);
  });

  $effect(() => {
    if (!dialog) return;
    return dialogLifecycle.synchronize(dialog, open);
  });
</script>

<dialog
  bind:this={dialog}
  class={`ds-dialog-shell ${className}`}
  {...rest}
  aria-labelledby={`${id}-title`}
  aria-describedby={`${id}-message`}
  onclose={handleClose}
  oncancel={(event) => oncancel?.(event)}
  onclick={handleDialogClick}
>
  <div class="ds-dialog">
    <button class="ds-dialog-close" type="button" aria-label={closeLabel} onclick={cancelDialog}><WeBaseIcon name="x" size={19} /></button>
    {#if kicker}<p class="ds-dialog-kicker">{kicker}</p>{/if}
    <h3 id={`${id}-title`}>{title}</h3>
    <p id={`${id}-message`}>{message}</p>
    <div class="ds-dialog-actions"><button class="quiet" type="button" onclick={cancelDialog}>{cancelLabel}</button><button type="button" onclick={confirmDialog}>{confirmLabel}</button></div>
  </div>
</dialog>

<style>
  .ds-dialog-shell { display: none; width: 100%; height: 100%; max-width: none; max-height: none; padding: var(--webase-component-dialog-shell-padding); overflow: hidden; border: 0; background: transparent; }
  .ds-dialog-shell[open] { display: grid; place-items: center; }
  .ds-dialog-shell::backdrop { background: rgb(20 20 19 / 45%); backdrop-filter: blur(var(--webase-component-dialog-backdrop-blur)); animation: ds-dialog-scrim-in var(--duration-fast) var(--ease-out) both; }
  .ds-dialog { position: relative; width: min(var(--webase-component-dialog-width), 100%); padding: var(--webase-component-dialog-padding); border: var(--webase-component-control-border-width) solid var(--hairline-strong); color: var(--ink); background: var(--paper); box-shadow: var(--webase-component-dialog-shadow-offset) var(--webase-component-dialog-shadow-offset) 0 var(--shadow-offset); animation: ds-dialog-in var(--duration-ui) var(--ease-out) both; }
  .ds-dialog-close { position: absolute; top: var(--webase-space-7); inset-inline-end: var(--webase-space-7); display: grid; width: var(--webase-component-dialog-close-size); height: var(--webase-component-dialog-close-size); place-items: center; border: 0; color: var(--ink-muted); background: transparent; cursor: pointer; }
  .ds-dialog-kicker { margin: 0 0 var(--webase-space-8); color: var(--brand); font-family: var(--mono); font-size: var(--webase-font-size-overline); letter-spacing: var(--webase-letter-spacing-kicker); text-transform: uppercase; }
  h3 { margin: 0 0 var(--webase-space-6); font-family: var(--font); font-size: var(--webase-font-size-dialog); font-weight: 500; letter-spacing: var(--webase-component-dialog-title-letter-spacing); line-height: var(--webase-line-height-tight); }
  .ds-dialog p:not(.ds-dialog-kicker) { margin: 0; color: var(--ink-muted); line-height: var(--webase-line-height-reading); }
  .ds-dialog-actions { display: flex; justify-content: flex-end; gap: var(--webase-space-4); margin-top: var(--webase-space-12); }
  .ds-dialog-actions button { min-height: var(--webase-component-dialog-action-height); padding: 0 var(--webase-space-7); border: var(--webase-component-control-border-width) solid var(--brand); color: var(--paper); background: var(--brand); cursor: pointer; font-family: var(--sans); font-size: var(--webase-font-size-label); letter-spacing: var(--webase-letter-spacing-label); text-transform: uppercase; }
  .ds-dialog-actions button.quiet { color: var(--ink-muted); border-color: transparent; background: transparent; }
  .ds-dialog button:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  @keyframes ds-dialog-scrim-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes ds-dialog-in { from { opacity: 0; transform: translateY(var(--webase-component-dialog-enter-offset)) rotate(var(--webase-component-dialog-enter-rotation)); } to { opacity: 1; transform: translateY(0) rotate(0); } }
  @media (prefers-reduced-motion: reduce) { .ds-dialog-shell::backdrop, .ds-dialog { animation: none; } }
</style>
