<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import WeBaseIcon from './WeBaseIcon.svelte';

  type Tone = 'info' | 'success' | 'warning' | 'error';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
    title: string;
    message?: string;
    tone?: Tone;
    dismissible?: boolean;
    open?: boolean;
    children?: Snippet;
    actions?: Snippet;
  }

  let { title, message = '', tone = 'info', dismissible = false, open = $bindable(true), children, actions, class: className = '', ...rest }: Props = $props();
</script>

{#if open}
  <aside class={`ds-alert ds-alert-${tone} ${className}`} role={tone === 'error' ? 'alert' : 'status'} {...rest}>
    <span class="ds-alert-icon" aria-hidden="true">
      {#if tone === 'success'}
        <WeBaseIcon name="circle-check" size={19} />
      {:else if tone === 'warning'}
        <WeBaseIcon name="triangle-alert" size={19} />
      {:else if tone === 'error'}
        <WeBaseIcon name="circle-alert" size={19} />
      {:else}
        <WeBaseIcon name="info" size={19} />
      {/if}
    </span>
    <span class="ds-alert-copy">
      <strong>{title}</strong>
      <span class="ds-alert-message">{#if children}{@render children()}{:else}{message}{/if}</span>
    </span>
    {#if actions || dismissible}
      <span class="ds-alert-actions">
        {#if actions}{@render actions()}{/if}
        {#if dismissible}
          <button class="ds-alert-dismiss" type="button" aria-label="Dismiss alert" onclick={() => (open = false)}><WeBaseIcon name="x" size={17} /></button>
        {/if}
      </span>
    {/if}
  </aside>
{/if}

<style>
  .ds-alert { --alert-color: var(--brand); display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: start; min-height: 72px; padding: 15px 16px; border: 1px solid color-mix(in srgb, var(--alert-color) 62%, var(--hairline)); border-left-width: 3px; color: var(--ink); background: color-mix(in srgb, var(--alert-color) 7%, var(--surface)); }
  .ds-alert-success { --alert-color: var(--status-success); }
  .ds-alert-warning { --alert-color: var(--status-warning); }
  .ds-alert-error { --alert-color: var(--status-error); }
  .ds-alert-icon { display: grid; width: 28px; height: 28px; place-items: center; border: 1px solid color-mix(in srgb, var(--alert-color) 42%, transparent); border-radius: 50%; color: var(--alert-color); }
  .ds-alert-copy { display: grid; gap: 4px; min-width: 0; }
  strong { color: var(--ink); font-family: var(--sans); font-size: 11px; letter-spacing: .07em; line-height: 1.35; text-transform: uppercase; }
  .ds-alert-message { color: var(--ink-soft); font-size: 13px; line-height: 1.45; }
  .ds-alert-actions { display: flex; align-items: center; gap: 8px; }
  .ds-alert-dismiss { display: grid; width: 32px; height: 32px; place-items: center; border: 0; color: var(--ink-muted); background: transparent; cursor: pointer; }
  .ds-alert-dismiss:hover { color: var(--alert-color); }
  .ds-alert-dismiss:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }
</style>
