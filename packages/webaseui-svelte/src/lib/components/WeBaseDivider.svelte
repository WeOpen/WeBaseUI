<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> { label?: string; vertical?: boolean; }
  let { label = '', vertical = false, class: className = '', ...rest }: Props = $props();
</script>

{#if vertical}
  <span class={`ds-divider ds-divider-vertical ${className}`} aria-hidden="true" {...rest}></span>
{:else}
  <div class={`ds-divider ${className}`} role="separator" {...rest}>
    {#if label}<span>{label}</span>{/if}
  </div>
{/if}

<style>
  .ds-divider { display: flex; align-items: center; min-height: var(--webase-space-10); background-image: var(--dot-rule-image); background-position: center; background-repeat: repeat-x; background-size: var(--webase-component-divider-dot-gap) var(--webase-space-1); }
  .ds-divider span { padding-inline-end: var(--webase-space-7); background: var(--paper); color: var(--brand); font-family: var(--mono); font-size: var(--webase-font-size-overline); letter-spacing: var(--webase-letter-spacing-kicker); text-transform: uppercase; }
  .ds-divider-vertical { display: inline-block; width: var(--webase-space-1); min-height: var(--webase-size-control-lg); background-image: var(--dot-rule-image); background-position: center; background-repeat: repeat-y; background-size: var(--webase-space-1) var(--webase-component-divider-dot-gap); }
</style>
