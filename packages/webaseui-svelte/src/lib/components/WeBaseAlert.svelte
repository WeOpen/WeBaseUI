<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import WeBaseIcon from './WeBaseIcon.svelte';

  type Tone = 'info' | 'success' | 'warning' | 'error';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
    title: string;
    message?: string;
    tone?: Tone;
    dismissible?: boolean;
    dismissLabel?: string;
    open?: boolean;
    children?: Snippet;
    actions?: Snippet;
  }

  let { title, message = '', tone = 'info', dismissible = false, dismissLabel = 'Dismiss alert', open = $bindable(true), children, actions, class: className = '', ...rest }: Props = $props();
</script>

{#if open}
  <div class={`ds-alert ds-alert-${tone} ${className}`} role={tone === 'error' ? 'alert' : 'status'} {...rest}>
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
          <button class="ds-alert-dismiss" type="button" aria-label={dismissLabel} onclick={() => (open = false)}><WeBaseIcon name="x" size={17} /></button>
        {/if}
      </span>
    {/if}
  </div>
{/if}

<style>
  .ds-alert { --alert-color: var(--brand); display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: var(--webase-component-alert-gap); align-items: start; min-width: 0; min-height: var(--webase-component-alert-min-height); padding: var(--webase-component-alert-padding-block) var(--webase-component-alert-padding-inline); border: var(--webase-border-thin) solid color-mix(in srgb, var(--alert-color) 62%, var(--hairline)); border-inline-start-width: var(--webase-border-accent); color: var(--ink); background: color-mix(in srgb, var(--alert-color) 7%, var(--surface)); }
  .ds-alert-success { --alert-color: var(--status-success); }
  .ds-alert-warning { --alert-color: var(--status-warning); }
  .ds-alert-error { --alert-color: var(--status-error); }
  .ds-alert-icon { display: grid; width: var(--webase-component-alert-icon-size); height: var(--webase-component-alert-icon-size); place-items: center; border: var(--webase-border-thin) solid color-mix(in srgb, var(--alert-color) 42%, transparent); border-radius: var(--webase-radius-circle); color: var(--alert-color); }
  .ds-alert-copy { display: grid; gap: var(--webase-space-2); min-width: 0; }
  strong { color: var(--ink); font-family: var(--sans); font-size: var(--webase-font-size-label); letter-spacing: var(--webase-component-alert-title-letter-spacing); line-height: var(--webase-line-height-meta); text-transform: uppercase; }
  .ds-alert-message { color: var(--ink-soft); font-size: var(--webase-font-size-body-sm); line-height: var(--webase-line-height-body); }
  .ds-alert-actions { display: flex; min-width: 0; flex-wrap: wrap; align-items: center; gap: var(--webase-space-4); }
  .ds-alert-dismiss { display: grid; width: var(--webase-component-alert-dismiss-size); height: var(--webase-component-alert-dismiss-size); place-items: center; border: 0; color: var(--ink-muted); background: transparent; cursor: pointer; }
  .ds-alert-dismiss:focus-visible { outline: var(--focus-ring); outline-offset: var(--webase-space-1); }
  @media (hover: hover) and (pointer: fine) { .ds-alert-dismiss:hover { color: var(--alert-color); } }
</style>
