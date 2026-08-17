<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { WeBaseNumberFormatter, WeBasePageLabel } from '../types.js';
  import WeBaseIcon from './WeBaseIcon.svelte';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
    total?: number;
    page?: number;
    label?: string;
    previousLabel?: string;
    nextLabel?: string;
    getPageLabel?: WeBasePageLabel;
    formatPage?: WeBaseNumberFormatter;
  }
  let {
    total = 5,
    page = $bindable(1),
    label = 'Pagination',
    previousLabel = 'Previous page',
    nextLabel = 'Next page',
    getPageLabel = (item) => `Page ${item}`,
    formatPage = (item) => String(item).padStart(2, '0'),
    class: className = '',
    ...rest
  }: Props = $props();
  const pageCount = $derived(Number.isFinite(total) ? Math.max(1, Math.floor(total)) : 1);
  const pages = $derived(Array.from({ length: pageCount }, (_, index) => index + 1));

  $effect(() => {
    const nextPage = Number.isFinite(page) ? Math.min(pageCount, Math.max(1, Math.floor(page))) : 1;
    if (page !== nextPage) page = nextPage;
  });
</script>

<nav class={`ds-pagination ${className}`} aria-label={label} {...rest}>
  <button type="button" aria-label={previousLabel} disabled={page <= 1} onclick={() => (page = Math.max(1, page - 1))}><WeBaseIcon name="arrow-left" size={16} /></button>
  <span class="ds-pagination-pages">
    {#each pages as item (item)}
      <button type="button" class:active={page === item} aria-label={getPageLabel(item)} aria-current={page === item ? 'page' : undefined} onclick={() => (page = item)}>{formatPage(item)}</button>
    {/each}
  </span>
  <button type="button" aria-label={nextLabel} disabled={page >= pageCount} onclick={() => (page = Math.min(pageCount, page + 1))}><WeBaseIcon name="arrow-right" size={16} /></button>
</nav>

<style>
  .ds-pagination, .ds-pagination-pages { display: inline-flex; align-items: center; gap: var(--webase-component-pagination-gap); }
  button { display: inline-grid; min-width: var(--webase-size-control-md); height: var(--webase-size-control-md); place-items: center; padding: 0 var(--webase-space-4); border: var(--webase-border-thin) solid var(--hairline); color: var(--ink-muted); background: var(--surface); cursor: pointer; font-family: var(--mono); font-size: var(--webase-font-size-overline); transition: border-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), background-color var(--duration-fast) var(--ease-out); }
  button.active { border-color: var(--brand); color: var(--brand); background: var(--brand-tint); }
  button.active { color: var(--paper); background: var(--brand); }
  button:focus-visible { outline: var(--focus-ring); outline-offset: var(--webase-space-1); }
  button:disabled { cursor: not-allowed; opacity: .35; }
  :global([dir='rtl']) .ds-pagination > button :global(svg) { transform: scaleX(-1); }
  @media (hover: hover) and (pointer: fine) { button:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-tint); } }
  @media (prefers-reduced-motion: reduce) { button { transition: none; } }
  @media (max-width: 480px) { .ds-pagination { max-width: 100%; flex-wrap: wrap; } .ds-pagination-pages { min-width: 0; flex: 1 1 auto; flex-wrap: wrap; } .ds-pagination-pages button:not(.active) { display: none; } }
</style>
