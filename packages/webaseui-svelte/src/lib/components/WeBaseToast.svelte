<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { scheduleAutoDismiss } from '../internal/timing.js';
  import WeBaseIcon from './WeBaseIcon.svelte';

  type Tone = 'success' | 'info' | 'error';
  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> { open?: boolean; title?: string; message?: string; tone?: Tone; duration?: number; dismissLabel?: string; }
  let { open = $bindable(false), title = 'Saved locally', message = 'The specimen is ready for review.', tone = 'success', duration = 0, dismissLabel = 'Dismiss notification', class: className = '', ...rest }: Props = $props();

  // Pointer or keyboard attention pauses the countdown (WCAG 2.2.1) — a notice
  // must not disappear while it is being read or its dismiss button is focused.
  let held = $state(false);

  $effect(() => {
    return scheduleAutoDismiss(
      { open, paused: held, duration },
      () => (open = false),
      {
        setTimeout: (callback, delay) => window.setTimeout(callback, delay),
        clearTimeout: (handle) => window.clearTimeout(handle)
      }
    );
  });
</script>

<!--
  The live region is permanently mounted and only its contents change. A region
  inserted together with its text is generally not announced by screen readers.
  role="status" implies aria-live="polite"; role="alert" implies assertive.
-->
<div class={`ds-toast-live ${className}`} role={tone === 'error' ? 'alert' : 'status'} {...rest}>
  {#if open}
    <aside
      class={`ds-toast ds-toast-${tone}`}
      onmouseenter={() => (held = true)}
      onmouseleave={() => (held = false)}
      onfocusin={() => (held = true)}
      onfocusout={() => (held = false)}
    >
      <span class="ds-toast-mark" aria-hidden="true">{#if tone === 'error'}<WeBaseIcon name="circle-alert" size={15} strokeWidth={1.8} />{:else if tone === 'info'}<WeBaseIcon name="info" size={15} strokeWidth={1.8} />{:else}<WeBaseIcon name="circle-check" size={15} strokeWidth={1.8} />{/if}</span>
      <span><strong>{title}</strong><small>{message}</small></span>
      <button type="button" aria-label={dismissLabel} onclick={() => (open = false)}><WeBaseIcon name="x" size={17} /></button>
    </aside>
  {/if}
</div>

<style>
  .ds-toast-live { display: grid; justify-items: end; }
  .ds-toast { --toast-color: var(--brand); display: flex; align-items: center; gap: var(--webase-space-6); width: min(var(--webase-component-toast-max-width), 100%); padding: var(--webase-component-toast-padding-block) var(--webase-space-7); border: var(--webase-border-thin) solid var(--toast-color); border-inline-start-width: var(--webase-border-accent); background: var(--surface); box-shadow: var(--webase-space-4) var(--webase-space-4) 0 color-mix(in srgb, var(--toast-color) 15%, transparent); animation: ds-toast-in var(--webase-component-toast-duration) var(--ease-out) both; }
  .ds-toast-error { --toast-color: var(--status-error); }
  .ds-toast-info { --toast-color: var(--status-info); }
  .ds-toast-mark { display: grid; width: var(--webase-component-toast-mark-size); height: var(--webase-component-toast-mark-size); place-items: center; border-radius: var(--webase-radius-circle); color: var(--paper); background: var(--toast-color); }
  .ds-toast span:nth-child(2) { display: grid; gap: var(--webase-component-toast-copy-gap); min-width: 0; flex: 1; }
  strong { color: var(--ink); font-family: var(--sans); font-size: var(--webase-font-size-label); letter-spacing: var(--webase-component-toast-title-letter-spacing); text-transform: uppercase; }
  small { color: var(--ink-muted); font-size: var(--webase-font-size-body-sm); }
  button { display: grid; width: var(--webase-space-14); height: var(--webase-space-14); place-items: center; border: 0; color: var(--ink-muted); background: transparent; cursor: pointer; }
  button:focus-visible { outline: var(--focus-ring); outline-offset: var(--webase-space-1); }
  @keyframes ds-toast-in { from { opacity: 0; transform: translateY(var(--webase-space-4)); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .ds-toast { animation: none; } }
</style>
