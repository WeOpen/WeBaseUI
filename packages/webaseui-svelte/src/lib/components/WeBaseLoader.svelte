<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> { label?: string; }
  let { label = 'Loading', class: className = '', ...rest }: Props = $props();
</script>

<div class={`ds-loader ${className}`} role="status" aria-label={label} {...rest}><span></span><span></span><span></span><em>{label}</em></div>

<style>
  .ds-loader { display: inline-flex; align-items: center; gap: var(--webase-component-loader-gap); color: var(--ink-muted); font-family: var(--mono); font-size: var(--webase-font-size-overline); letter-spacing: var(--webase-letter-spacing-meta); text-transform: uppercase; }
  .ds-loader span { width: var(--webase-space-3); height: var(--webase-space-3); border-radius: var(--webase-radius-circle); background: var(--brand); animation: ds-loader-pulse var(--webase-component-loader-duration) var(--ease-in-out) infinite alternate; }
  .ds-loader span:nth-child(2) { animation-delay: var(--webase-component-loader-delay-step); }
  .ds-loader span:nth-child(3) { animation-delay: calc(var(--webase-component-loader-delay-step) * 2); }
  em { margin-inline-start: var(--webase-component-loader-label-gap); font-style: normal; }
  @keyframes ds-loader-pulse { from { opacity: .3; transform: translateY(var(--webase-space-1)); } to { opacity: 1; transform: translateY(calc(-1 * var(--webase-space-1))); } }
  @media (prefers-reduced-motion: reduce) { .ds-loader span { animation: none; opacity: 1; } }
</style>
