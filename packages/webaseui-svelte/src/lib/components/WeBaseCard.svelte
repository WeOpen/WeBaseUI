<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import WeBaseIcon from './WeBaseIcon.svelte';

  type Variant = 'paper' | 'ink' | 'outline';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
    eyebrow?: string;
    title: string;
    body?: string;
    variant?: Variant;
    meta?: string;
    action?: string;
    onaction?: (event: MouseEvent) => void;
    children?: Snippet;
    footer?: Snippet;
  }

  let { eyebrow = 'Specimen', title, body = '', variant = 'paper', meta = '', action = '', onaction, children, footer, class: className = '', ...rest }: Props = $props();
</script>

<article class={`ds-card ds-card-${variant} ${className}`} {...rest}>
  <span class="ds-card-mark" aria-hidden="true"><WeBaseIcon name="sparkles" size={18} strokeWidth={1.45} /></span>
  <p class="ds-card-eyebrow">{eyebrow}</p>
  <h3>{title}</h3>
  <div class="ds-card-body">{#if children}{@render children()}{:else}{body}{/if}</div>
  {#if meta || (action && onaction) || footer}
    <footer>
      {#if footer}
        {@render footer()}
      {:else}
        {#if meta}<span>{meta}</span>{/if}
        {#if action && onaction}<button type="button" onclick={onaction}>{action}<WeBaseIcon name="arrow-up-right" size={14} /></button>{/if}
      {/if}
    </footer>
  {/if}
</article>

<style>
  .ds-card { position: relative; display: flex; min-height: var(--webase-component-card-min-height); flex-direction: column; padding: var(--webase-component-card-padding); overflow: hidden; border: var(--webase-border-thin) solid var(--hairline); box-shadow: var(--webase-component-card-shadow-offset) var(--webase-component-card-shadow-offset) 0 color-mix(in srgb, var(--brand) 12%, transparent); transition: border-color var(--duration-ui) var(--ease-out), transform var(--duration-ui) var(--ease-out), box-shadow var(--duration-ui) var(--ease-out); }
  .ds-card-paper { background: var(--surface); }
  .ds-card-outline { background: transparent; box-shadow: none; }
  .ds-card-ink { border-color: var(--brand); background: var(--brand); color: var(--paper); box-shadow: var(--webase-component-card-shadow-offset) var(--webase-component-card-shadow-offset) 0 color-mix(in srgb, var(--ink) 20%, transparent); }
  .ds-card-mark { position: absolute; top: var(--webase-space-6); inset-inline-end: var(--webase-space-8); color: var(--brand); font-size: var(--webase-size-icon); }
  .ds-card-ink .ds-card-mark { color: var(--paper); }
  .ds-card-eyebrow { margin: 0 0 var(--webase-space-9); color: var(--ink-muted); font-family: var(--mono); font-size: var(--webase-font-size-overline); letter-spacing: var(--webase-letter-spacing-kicker); text-transform: uppercase; }
  .ds-card-ink .ds-card-eyebrow { color: color-mix(in srgb, var(--paper) 72%, transparent); }
  h3 { max-width: 18ch; margin: 0 0 var(--webase-space-6); font-family: var(--font); font-size: var(--webase-font-size-title); font-weight: 500; letter-spacing: var(--webase-component-card-title-letter-spacing); line-height: var(--webase-line-height-tight); }
  .ds-card-body { max-width: 32ch; margin: 0; color: var(--ink-muted); font-size: var(--webase-font-size-body); line-height: var(--webase-line-height-reading); }
  .ds-card-ink .ds-card-body { color: color-mix(in srgb, var(--paper) 78%, transparent); }
  footer { display: flex; align-items: end; justify-content: space-between; gap: var(--webase-space-6); margin-top: auto; padding-top: var(--webase-component-card-padding); color: var(--ink-muted); font-family: var(--mono); font-size: var(--webase-font-size-meta); letter-spacing: var(--webase-letter-spacing-meta); text-transform: uppercase; }
  footer button { display: inline-flex; max-width: 100%; min-height: var(--webase-interactive-target-min); align-items: center; gap: var(--webase-space-3); padding: 0; border: 0; color: var(--brand); background: transparent; cursor: pointer; font-family: var(--sans); font-size: var(--webase-font-size-overline); letter-spacing: var(--webase-letter-spacing-label); overflow-wrap: anywhere; text-transform: uppercase; white-space: normal; }
  :global([dir='rtl']) footer button :global(svg) { transform: scaleX(-1); }
  .ds-card-ink footer, .ds-card-ink footer button { color: var(--paper); }
  /* Deliberately currentColor, not --focus-ring: the ink variant inverts, so a brand-blue ring would vanish into it. */
  footer button:focus-visible { outline: var(--webase-border-emphasis) solid currentColor; outline-offset: var(--focus-ring-offset); }
  @media (hover: hover) and (pointer: fine) { .ds-card:hover { border-color: var(--brand); transform: translate(var(--webase-component-card-hover-offset), var(--webase-component-card-hover-offset)); box-shadow: var(--webase-component-card-hover-shadow-offset) var(--webase-component-card-hover-shadow-offset) 0 color-mix(in srgb, var(--brand) 16%, transparent); } }
  @media (prefers-reduced-motion: reduce) { .ds-card { transition: none; } }
</style>
