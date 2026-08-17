<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import WeBaseIcon from './WeBaseIcon.svelte';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'onclick' | 'title'> { kicker?: string; title?: string; message?: string; actionLabel?: string; onclick?: (event: MouseEvent) => void; children?: Snippet; actions?: Snippet; }
  let { kicker = 'Empty / archive', title = 'No notes in this drawer', message = 'Start a new note or adjust the current filters.', actionLabel = 'Create note', onclick, children, actions, class: className = '', ...rest }: Props = $props();
</script>

<section class={`ds-empty-state ${className}`} {...rest}>
  <span class="ds-empty-mark" aria-hidden="true"><WeBaseIcon name="archive-x" size={26} strokeWidth={1.35} /></span>
  <div class="ds-empty-content"><p class="ds-empty-kicker">{kicker}</p><h3>{title}</h3><div class="ds-empty-copy">{#if children}{@render children()}{:else}{message}{/if}</div></div>
  {#if actions}
    <div class="ds-empty-actions">{@render actions()}</div>
  {:else if onclick}
    <button type="button" {onclick}><WeBaseIcon name="plus" size={15} strokeWidth={1.8} />{actionLabel}</button>
  {/if}
</section>

<style>
  .ds-empty-state { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: var(--webase-space-9); align-items: center; min-width: 0; min-height: var(--webase-component-empty-min-height); padding: var(--webase-space-11); border: var(--webase-border-thin) dashed var(--hairline-strong); background: color-mix(in srgb, var(--brand-tint) 28%, transparent); }
  .ds-empty-content { min-width: 0; }
  .ds-empty-mark { display: grid; width: var(--webase-component-empty-mark-size); height: var(--webase-component-empty-mark-size); place-items: center; border: var(--webase-border-thin) solid var(--brand); border-radius: var(--webase-radius-circle); color: var(--brand); }
  .ds-empty-kicker { margin: 0 0 var(--webase-component-empty-kicker-gap); color: var(--brand); font-family: var(--mono); font-size: var(--webase-font-size-meta); letter-spacing: var(--webase-letter-spacing-kicker); text-transform: uppercase; }
  h3 { margin: 0 0 var(--webase-space-3); font-family: var(--font); font-size: var(--webase-font-size-title-sm); font-weight: 500; letter-spacing: var(--webase-component-empty-title-letter-spacing); overflow-wrap: anywhere; }
  .ds-empty-kicker, .ds-empty-copy { overflow-wrap: anywhere; }
  .ds-empty-copy { max-width: 40ch; margin: 0; color: var(--ink-soft); font-size: var(--webase-font-size-body-sm); line-height: var(--webase-line-height-body); }
  .ds-empty-actions { display: flex; min-width: 0; flex-wrap: wrap; align-items: center; gap: var(--webase-space-4); }
  button { display: inline-flex; max-width: 100%; min-height: var(--webase-size-control-md); align-items: center; gap: var(--webase-space-4); padding: 0 var(--webase-space-6); border: var(--webase-border-thin) solid var(--brand); color: var(--brand); background: var(--surface); cursor: pointer; font-family: var(--sans); font-size: var(--webase-font-size-overline); letter-spacing: var(--webase-letter-spacing-label); overflow-wrap: anywhere; text-transform: uppercase; white-space: normal; }
  button:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  @media (hover: hover) and (pointer: fine) { button:hover { color: var(--paper); background: var(--brand); } }
  @media (max-width: 620px) { .ds-empty-state { grid-template-columns: minmax(0, 1fr); } button, .ds-empty-actions { grid-column: auto; width: 100%; } }
</style>
