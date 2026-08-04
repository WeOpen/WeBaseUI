<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import XueIcon from './XueIcon.svelte';

  type Tone = 'success' | 'info' | 'error';
  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> { open?: boolean; title?: string; message?: string; tone?: Tone; duration?: number; }
  let { open = $bindable(false), title = 'Saved locally', message = 'The specimen is ready for review.', tone = 'success', duration = 0, class: className = '', ...rest }: Props = $props();

  // Pointer or keyboard attention pauses the countdown (WCAG 2.2.1) — a notice
  // must not disappear while it is being read or its dismiss button is focused.
  let held = $state(false);

  $effect(() => {
    if (!open || duration <= 0 || held) return;
    const timer = window.setTimeout(() => (open = false), duration);
    return () => window.clearTimeout(timer);
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
      <span class="ds-toast-mark" aria-hidden="true">{#if tone === 'error'}<XueIcon name="circle-alert" size={15} strokeWidth={1.8} />{:else if tone === 'info'}<XueIcon name="info" size={15} strokeWidth={1.8} />{:else}<XueIcon name="circle-check" size={15} strokeWidth={1.8} />{/if}</span>
      <span><strong>{title}</strong><small>{message}</small></span>
      <button type="button" aria-label="Dismiss notification" onclick={() => (open = false)}><XueIcon name="x" size={17} /></button>
    </aside>
  {/if}
</div>

<style>
  .ds-toast-live { display: grid; justify-items: end; }
  .ds-toast { --toast-color: var(--brand); display: flex; align-items: center; gap: 12px; width: min(380px, 100%); padding: 13px 14px; border: 1px solid var(--toast-color); border-left-width: 3px; background: var(--surface); box-shadow: 8px 8px 0 color-mix(in srgb, var(--toast-color) 15%, transparent); animation: ds-toast-in 220ms var(--ease-out) both; }
  .ds-toast-error { --toast-color: var(--status-error); }
  .ds-toast-info { --toast-color: var(--status-info); }
  .ds-toast-mark { display: grid; width: 26px; height: 26px; place-items: center; border-radius: 50%; color: var(--paper); background: var(--toast-color); }
  .ds-toast span:nth-child(2) { display: grid; gap: 3px; min-width: 0; flex: 1; }
  strong { color: var(--ink); font-family: var(--sans); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; }
  small { color: var(--ink-muted); font-size: 13px; }
  button { display: grid; width: 32px; height: 32px; place-items: center; border: 0; color: var(--ink-muted); background: transparent; cursor: pointer; }
  button:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }
  @keyframes ds-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .ds-toast { animation: none; } }
</style>
