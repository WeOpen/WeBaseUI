<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import XueIcon from './XueIcon.svelte';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'onclick' | 'title'> { title?: string; message?: string; actionLabel?: string; onclick?: (event: MouseEvent) => void; children?: Snippet; actions?: Snippet; }
  let { title = 'No notes in this drawer', message = 'Start a new note or adjust the current filters.', actionLabel = 'Create note', onclick, children, actions, class: className = '', ...rest }: Props = $props();
</script>

<section class={`ds-empty-state ${className}`} {...rest}>
  <span class="ds-empty-mark" aria-hidden="true"><XueIcon name="archive-x" size={26} strokeWidth={1.35} /></span>
  <div><p class="ds-empty-kicker">Empty / archive</p><h3>{title}</h3><div class="ds-empty-copy">{#if children}{@render children()}{:else}{message}{/if}</div></div>
  {#if actions}
    <div class="ds-empty-actions">{@render actions()}</div>
  {:else}
    <button type="button" {onclick}><XueIcon name="plus" size={15} strokeWidth={1.8} />{actionLabel}</button>
  {/if}
</section>

<style>
  .ds-empty-state { display: grid; grid-template-columns: auto 1fr auto; gap: 18px; align-items: center; min-height: 150px; padding: 24px; border: 1px dashed var(--hairline-strong); background: color-mix(in srgb, var(--brand-tint) 28%, transparent); }
  .ds-empty-mark { display: grid; width: 54px; height: 54px; place-items: center; border: 1px solid var(--brand); border-radius: 50%; color: var(--brand); }
  .ds-empty-kicker { margin: 0 0 7px; color: var(--brand); font-family: var(--mono); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
  h3 { margin: 0 0 6px; font-family: var(--font); font-size: 24px; font-weight: 500; letter-spacing: -.03em; }
  .ds-empty-copy { max-width: 40ch; margin: 0; color: var(--ink-soft); font-size: 13px; line-height: 1.45; }
  .ds-empty-actions { display: flex; align-items: center; gap: 8px; }
  button { display: inline-flex; min-height: 40px; align-items: center; gap: 8px; padding: 0 12px; border: 1px solid var(--brand); color: var(--brand); background: var(--surface); cursor: pointer; font-family: var(--sans); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
  button:hover { color: var(--paper); background: var(--brand); }
  button:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  @media (max-width: 620px) { .ds-empty-state { grid-template-columns: auto 1fr; } button, .ds-empty-actions { grid-column: 2; width: max-content; } }
</style>
