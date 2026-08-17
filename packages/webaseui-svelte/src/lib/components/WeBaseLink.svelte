<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import WeBaseIcon, { type WeBaseIconName } from './WeBaseIcon.svelte';

  type Variant = 'inline' | 'back' | 'nav' | 'action';
  type IconPosition = 'start' | 'end';

  interface Props extends Omit<HTMLAnchorAttributes, 'children' | 'href'> {
    href: string;
    label?: string;
    variant?: Variant;
    icon?: WeBaseIconName;
    iconPosition?: IconPosition;
    children?: Snippet;
  }

  let {
    href,
    label = '',
    variant = 'inline',
    icon,
    iconPosition = variant === 'action' ? 'end' : 'start',
    children,
    class: className = '',
    ...rest
  }: Props = $props();

  const resolvedIcon = $derived(
    icon ?? (variant === 'back' ? 'arrow-left' : variant === 'action' ? 'arrow-up-right' : undefined)
  );
</script>

<a class={`ds-link ds-link-${variant} ${className}`} {href} {...rest}>
  {#if resolvedIcon && iconPosition === 'start'}
    <WeBaseIcon name={resolvedIcon} size={14} strokeWidth={1.8} />
  {/if}
  <span>{#if children}{@render children()}{:else}{label}{/if}</span>
  {#if resolvedIcon && iconPosition === 'end'}
    <WeBaseIcon name={resolvedIcon} size={14} strokeWidth={1.8} />
  {/if}
</a>

<style>
  .ds-link {
    display: inline-flex;
    align-items: center;
    gap: var(--webase-component-link-gap);
    color: inherit;
    text-decoration-thickness: var(--webase-border-thin);
    text-underline-offset: var(--webase-space-2);
    transition: color var(--duration-ui) var(--ease-out), border-color var(--duration-ui) var(--ease-out), background-color var(--duration-ui) var(--ease-out), transform var(--duration-fast) var(--ease-out);
  }
  .ds-link:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  .ds-link-inline { color: var(--brand); text-decoration-line: underline; text-decoration-color: var(--hairline-strong); }
  .ds-link-back, .ds-link-nav, .ds-link-action { font-family: var(--sans); font-size: var(--webase-font-size-overline); letter-spacing: var(--track-nav); text-transform: uppercase; }
  .ds-link-back, .ds-link-nav { min-height: var(--webase-interactive-target-min); }
  .ds-link-back { color: var(--ink-muted); text-decoration: none; }
  .ds-link-nav { color: var(--ink-muted); text-decoration: none; }
  .ds-link-action { min-height: var(--webase-size-control-sm); padding: 0 var(--webase-space-6); border: var(--webase-border-thin) solid var(--hairline-strong); background: transparent; text-decoration: none; }
  .ds-link-action:active { transform: translateY(0); }
  .ds-link > span { min-width: 0; overflow-wrap: anywhere; }
  :global([dir='rtl']) .ds-link-back :global(svg), :global([dir='rtl']) .ds-link-action :global(svg) { transform: scaleX(-1); }
  @media (hover: hover) and (pointer: fine) { .ds-link:hover { color: var(--brand); } .ds-link-inline:hover { text-decoration-color: var(--brand); } .ds-link-action:hover { border-color: var(--brand); background: var(--brand-tint); transform: translateY(var(--webase-component-link-hover-offset)); } }
  @media (prefers-reduced-motion: reduce) { .ds-link { transition: none; } }
</style>
