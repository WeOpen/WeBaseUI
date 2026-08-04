<script lang="ts">
  import type { HTMLDialogAttributes } from 'svelte/elements';
  import XueIcon from './XueIcon.svelte';

  interface Props extends Omit<HTMLDialogAttributes, 'children' | 'id' | 'open' | 'title'> { open?: boolean; title?: string; message?: string; id?: string; confirmLabel?: string; }
  const uid = $props.id();
  let { open = $bindable(false), title = 'A quiet confirmation', message = 'Dialogs keep consequential actions in focus.', id = uid, confirmLabel = 'Confirm', class: className = '', ...rest }: Props = $props();
  let dialog = $state<HTMLDialogElement>();

  // showModal() gives the focus trap, background inertness, Escape handling, and
  // focus restoration natively. Only the background scroll lock has to be manual.
  $effect(() => {
    if (!dialog) return;

    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }

    if (!dialog.open) dialog.showModal();

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previousOverflow;
    };
  });
</script>

<dialog
  bind:this={dialog}
  class={`ds-dialog-shell ${className}`}
  {...rest}
  aria-labelledby={`${id}-title`}
  aria-describedby={`${id}-message`}
  onclose={() => (open = false)}
  onclick={(event) => event.target === dialog && dialog.close()}
>
  <div class="ds-dialog">
    <button class="ds-dialog-close" type="button" aria-label="Close dialog" onclick={() => dialog?.close()}><XueIcon name="x" size={19} /></button>
    <p class="ds-dialog-kicker">Dialog / modal</p>
    <h3 id={`${id}-title`}>{title}</h3>
    <p id={`${id}-message`}>{message}</p>
    <div class="ds-dialog-actions"><button class="quiet" type="button" onclick={() => dialog?.close()}>Cancel</button><button type="button" onclick={() => dialog?.close()}>{confirmLabel}</button></div>
  </div>
</dialog>

<style>
  .ds-dialog-shell { display: none; width: 100%; height: 100%; max-width: none; max-height: none; padding: 24px; overflow: hidden; border: 0; background: transparent; }
  .ds-dialog-shell[open] { display: grid; place-items: center; }
  .ds-dialog-shell::backdrop { background: rgb(20 20 19 / 45%); backdrop-filter: blur(3px); animation: ds-dialog-scrim-in var(--duration-fast) var(--ease-out) both; }
  .ds-dialog { position: relative; width: min(460px, 100%); padding: 30px; border: 1px solid var(--hairline-strong); color: var(--ink); background: var(--paper); box-shadow: 12px 12px 0 var(--shadow-offset); animation: ds-dialog-in var(--duration-ui) var(--ease-out) both; }
  .ds-dialog-close { position: absolute; top: 14px; right: 14px; display: grid; width: 36px; height: 36px; place-items: center; border: 0; color: var(--ink-muted); background: transparent; cursor: pointer; }
  .ds-dialog-kicker { margin: 0 0 16px; color: var(--brand); font-family: var(--mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; }
  h3 { margin: 0 0 12px; font-family: var(--font); font-size: 34px; font-weight: 500; letter-spacing: -.04em; line-height: .98; }
  .ds-dialog p:not(.ds-dialog-kicker) { margin: 0; color: var(--ink-muted); line-height: 1.5; }
  .ds-dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 28px; }
  .ds-dialog-actions button { min-height: 40px; padding: 0 14px; border: 1px solid var(--brand); color: var(--paper); background: var(--brand); cursor: pointer; font-family: var(--sans); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
  .ds-dialog-actions button.quiet { color: var(--ink-muted); border-color: transparent; background: transparent; }
  .ds-dialog button:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  @keyframes ds-dialog-scrim-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes ds-dialog-in { from { opacity: 0; transform: translateY(12px) rotate(-.4deg); } to { opacity: 1; transform: translateY(0) rotate(0); } }
  @media (prefers-reduced-motion: reduce) { .ds-dialog-shell::backdrop, .ds-dialog { animation: none; } }
</style>
