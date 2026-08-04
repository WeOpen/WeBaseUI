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
    children?: Snippet;
    footer?: Snippet;
  }

  let { eyebrow = 'Specimen', title, body = '', variant = 'paper', meta = '', action = '', children, footer, class: className = '', ...rest }: Props = $props();
</script>

<article class={`ds-card ds-card-${variant} ${className}`} {...rest}>
  <span class="ds-card-mark" aria-hidden="true"><WeBaseIcon name="sparkles" size={18} strokeWidth={1.45} /></span>
  <p class="ds-card-eyebrow">{eyebrow}</p>
  <h3>{title}</h3>
  <div class="ds-card-body">{#if children}{@render children()}{:else}{body}{/if}</div>
  {#if meta || action || footer}
    <footer>
      {#if footer}
        {@render footer()}
      {:else}
        {#if meta}<span>{meta}</span>{/if}
        {#if action}<button type="button">{action}<WeBaseIcon name="arrow-up-right" size={14} /></button>{/if}
      {/if}
    </footer>
  {/if}
</article>

<style>
  .ds-card { position: relative; display: flex; min-height: 220px; flex-direction: column; padding: 22px; overflow: hidden; border: 1px solid var(--hairline); box-shadow: 8px 8px 0 color-mix(in srgb, var(--brand) 12%, transparent); transition: border-color var(--duration-ui) var(--ease-out), transform var(--duration-ui) var(--ease-out), box-shadow var(--duration-ui) var(--ease-out); }
  .ds-card:hover { border-color: var(--brand); transform: translate(-2px, -2px); box-shadow: 10px 10px 0 color-mix(in srgb, var(--brand) 16%, transparent); }
  .ds-card-paper { background: var(--surface); }
  .ds-card-outline { background: transparent; box-shadow: none; }
  .ds-card-ink { border-color: var(--brand); background: var(--brand); color: var(--paper); box-shadow: 8px 8px 0 color-mix(in srgb, var(--ink) 20%, transparent); }
  .ds-card-mark { position: absolute; top: 12px; right: 16px; color: var(--brand); font-size: 18px; }
  .ds-card-ink .ds-card-mark { color: var(--paper); }
  .ds-card-eyebrow { margin: 0 0 18px; color: var(--ink-muted); font-family: var(--mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; }
  .ds-card-ink .ds-card-eyebrow { color: color-mix(in srgb, var(--paper) 72%, transparent); }
  h3 { max-width: 18ch; margin: 0 0 12px; font-family: var(--font); font-size: 28px; font-weight: 500; letter-spacing: -.035em; line-height: .98; }
  .ds-card-body { max-width: 32ch; margin: 0; color: var(--ink-muted); font-size: 14px; line-height: 1.5; }
  .ds-card-ink .ds-card-body { color: color-mix(in srgb, var(--paper) 78%, transparent); }
  footer { display: flex; align-items: end; justify-content: space-between; gap: 12px; margin-top: auto; padding-top: 22px; color: var(--ink-muted); font-family: var(--mono); font-size: 9px; letter-spacing: .1em; text-transform: uppercase; }
  footer button { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; color: var(--brand); background: transparent; cursor: pointer; font-family: var(--sans); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
  .ds-card-ink footer, .ds-card-ink footer button { color: var(--paper); }
  /* Deliberately currentColor, not --focus-ring: the ink variant inverts, so a brand-blue ring would vanish into it. */
  footer button:focus-visible { outline: 2px solid currentColor; outline-offset: var(--focus-ring-offset); }
  @media (prefers-reduced-motion: reduce) { .ds-card { transition: none; } }
</style>
