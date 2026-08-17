<script lang="ts">
  import type { HTMLAnchorAttributes, HTMLAttributes } from 'svelte/elements';

  type Variant = 'neutral' | 'brand' | 'outline';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
    label: string;
    href?: string;
    variant?: Variant;
    count?: number | string;
    selected?: boolean;
    target?: HTMLAnchorAttributes['target'];
    rel?: HTMLAnchorAttributes['rel'];
    download?: HTMLAnchorAttributes['download'];
    hreflang?: HTMLAnchorAttributes['hreflang'];
    referrerpolicy?: HTMLAnchorAttributes['referrerpolicy'];
  }

  let {
    label,
    href,
    variant = 'neutral',
    count,
    selected = false,
    target,
    rel,
    download,
    hreflang,
    referrerpolicy,
    class: className = '',
    ...rest
  }: Props = $props();

  const classes = $derived(`ds-tag ds-tag-${variant} ${selected ? 'selected' : ''} ${className}`);
</script>

{#if href}
  <a class={classes} {href} {target} {rel} {download} {hreflang} {referrerpolicy} aria-current={selected ? 'page' : undefined} {...rest}>
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
    min-height: var(--webase-component-tag-min-height);
    align-items: center;
    gap: var(--webase-component-tag-gap);
    padding: var(--webase-space-2) var(--webase-component-tag-padding-inline);
    border: var(--webase-border-thin) solid transparent;
    border-radius: var(--webase-radius-pill);
    font-family: var(--sans);
    font-size: var(--webase-font-size-overline);
    letter-spacing: var(--webase-letter-spacing-label);
    line-height: 1;
    text-decoration: none;
    text-transform: uppercase;
    transition: color var(--duration-ui) var(--ease-out), border-color var(--duration-ui) var(--ease-out), background-color var(--duration-ui) var(--ease-out);
  }
  .ds-tag-neutral { color: var(--ink-soft); background: var(--surface-muted); }
  .ds-tag-brand { color: var(--brand); background: var(--brand-tint); }
  .ds-tag-outline { border-color: var(--hairline-strong); color: var(--ink-soft); background: transparent; }
  .ds-tag.selected { border-color: var(--brand); color: var(--brand); background: var(--brand-tint); }
  a.ds-tag:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  small { color: currentColor; font-family: var(--mono); font-size: var(--webase-font-size-meta); opacity: 1; }
  @media (hover: hover) and (pointer: fine) { a.ds-tag:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-tint); } }
  @media (forced-colors: active) {.ds-tag.selected {forced-color-adjust:none;border-color:Highlight;color:CanvasText;background:Canvas}}
  @media (prefers-reduced-motion: reduce) { .ds-tag { transition: none; } }
</style>
