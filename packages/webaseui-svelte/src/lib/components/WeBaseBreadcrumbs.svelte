<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { WeBaseBreadcrumbItem } from '../types.js';
  import WeBaseIcon from './WeBaseIcon.svelte';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> { items: WeBaseBreadcrumbItem[]; label?: string; }

  let { items, label = 'Breadcrumb', class: className = '', ...rest }: Props = $props();
</script>

<nav class={`ds-breadcrumbs ${className}`} aria-label={label} {...rest}>
  <ol>
    {#each items as item, index (item.label)}
      <li>
        {#if index > 0}<WeBaseIcon name="chevron-right" size={13} />{/if}
        {#if item.href && index < items.length - 1}
          <a href={item.href}>{#if index === 0}<WeBaseIcon name="house" size={14} />{/if}<span>{item.label}</span></a>
        {:else}
          <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  ol { display: flex; flex-wrap: wrap; align-items: center; gap: var(--webase-component-breadcrumb-gap); margin: 0; padding: 0; list-style: none; }
  li, a { display: inline-flex; align-items: center; gap: var(--webase-component-breadcrumb-gap); }
  li { color: var(--ink-muted); font-family: var(--sans); font-size: var(--webase-font-size-overline); letter-spacing: var(--webase-letter-spacing-label); text-transform: uppercase; }
  a { min-height: var(--webase-interactive-target-min); color: var(--brand); text-decoration: none; }
  a:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  [aria-current='page'] { color: var(--ink); }
  li > :global(svg) { color: var(--hairline-strong); }
  :global([dir='rtl']) li > :global(svg) { transform: scaleX(-1); }
  @media (hover: hover) and (pointer: fine) { a:hover span { text-decoration: underline; text-underline-offset: var(--webase-space-2); } }
</style>
