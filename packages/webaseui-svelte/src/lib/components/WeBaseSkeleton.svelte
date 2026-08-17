<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> { rows?: number; media?: boolean; label?: string; }
  let { rows = 3, media = true, label = 'Loading content', class: className = '', ...rest }: Props = $props();
</script>

<div class={`ds-skeleton ${className}`} role="status" aria-label={label} {...rest}>
  {#if media}<span class="ds-skeleton-media"></span>{/if}
  <span class="ds-skeleton-copy">
    {#each Array.from({ length: rows }) as _, index (index)}
      <span class="ds-skeleton-line" class:is-last={index === rows - 1}></span>
    {/each}
  </span>
</div>

<style>
  .ds-skeleton { display: grid; grid-template-columns: var(--webase-component-skeleton-media-size) 1fr; gap: var(--webase-space-8); align-items: center; padding: var(--webase-space-8); border: var(--webase-border-thin) solid var(--hairline); background: var(--surface); }
  .ds-skeleton-media, .ds-skeleton-line { position: relative; display: block; overflow: hidden; background: var(--surface-muted); }
  .ds-skeleton-media { width: var(--webase-component-skeleton-media-size); height: var(--webase-component-skeleton-media-size); }
  .ds-skeleton-copy { display: grid; gap: var(--webase-space-5); }
  .ds-skeleton-line { height: var(--webase-space-5); }
  .ds-skeleton-line.is-last { width: 62%; }
  .ds-skeleton-media::after, .ds-skeleton-line::after { position: absolute; inset: 0; background: linear-gradient(var(--webase-component-skeleton-shimmer-angle), transparent 20%, color-mix(in srgb, var(--surface) 80%, transparent) 50%, transparent 80%); content: ''; transform: translateX(-100%); animation: ds-skeleton-shimmer var(--webase-component-skeleton-shimmer-duration) var(--ease-in-out) infinite; }
  @keyframes ds-skeleton-shimmer { to { transform: translateX(100%); } }
  @media (prefers-reduced-motion: reduce) { .ds-skeleton-media::after, .ds-skeleton-line::after { display: none; animation: none; } }
</style>
