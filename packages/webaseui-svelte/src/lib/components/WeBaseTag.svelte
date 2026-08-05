<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  type Variant = 'neutral' | 'brand' | 'outline';

  interface Props extends Omit<HTMLAnchorAttributes, 'children' | 'href'> {
    label: string;
    href?: string;
    variant?: Variant;
    count?: number | string;
    selected?: boolean;
  }

  let {
    label,
    href,
    variant = 'neutral',
    count,
    selected = false,
    class: className = '',
    ...rest
  }: Props = $props();

  const classes = $derived(`ds-tag ds-tag-${variant} ${selected ? 'selected' : ''} ${className}`);
</script>

{#if href}
  <a class={classes} {href} aria-current={selected ? 'page' : undefined} {...rest}>
    <span>{label}</span>{#if count !== undefined}<small>{count}</small>{/if}
  </a>
{:else}
  <span class={classes} aria-current={selected ? 'true' : undefined} {...rest}>
    <span>{label}</span>{#if count !== undefined}<small>{count}</small>{/if}
  </span>
{/if}

<style>
  .ds-tag {
    display: inline-flex;
    min-height: 26px;
    align-items: center;
    gap: 7px;
    padding: 4px 9px;
    border: 1px solid transparent;
    border-radius: 999px;
    font-family: var(--sans);
    font-size: 10px;
    letter-spacing: .08em;
    line-height: 1;
    text-decoration: none;
    text-transform: uppercase;
    transition: color var(--duration-ui) var(--ease-out), border-color var(--duration-ui) var(--ease-out), background-color var(--duration-ui) var(--ease-out);
  }
  .ds-tag-neutral { color: var(--ink-muted); background: var(--surface-muted); }
  .ds-tag-brand { color: var(--brand); background: var(--brand-tint); }
  .ds-tag-outline { border-color: var(--hairline-strong); color: var(--ink-soft); background: transparent; }
  a.ds-tag:hover, .ds-tag.selected { border-color: var(--brand); color: var(--brand); background: var(--brand-tint); }
  a.ds-tag:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  small { color: currentColor; font-family: var(--mono); font-size: 9px; opacity: .75; }
  @media (prefers-reduced-motion: reduce) { .ds-tag { transition: none; } }
</style>
