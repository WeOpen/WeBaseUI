<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import WeBaseIcon, { type WeBaseIconName } from './WeBaseIcon.svelte';

  type Variant = 'ink' | 'outline' | 'quiet' | 'text';
  type Size = 'sm' | 'md';

  interface Props extends Omit<HTMLButtonAttributes, 'children' | 'disabled' | 'onclick' | 'size' | 'type'> {
    label: string;
    variant?: Variant;
    size?: Size;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    loadingLabel?: string;
    icon?: WeBaseIconName;
    full?: boolean;
    onclick?: (event: MouseEvent) => void;
  }

  let { label, variant = 'outline', size = 'md', type = 'button', disabled = false, loading = false, loadingLabel = 'Working', icon, full = false, onclick, class: className = '', ...rest }: Props = $props();
</script>

<button class={`ds-button ds-button-${variant} ds-button-${size} ${className}`} class:full {type} disabled={disabled || loading} aria-busy={loading} {onclick} {...rest}>
  {#if loading}
    <WeBaseIcon class="ds-button-spinner" name="loader-circle" size={15} strokeWidth={1.8} />
  {:else if icon}
    <WeBaseIcon name={icon} size={15} strokeWidth={1.8} />
  {/if}
  <span>{loading ? loadingLabel : label}</span>
</button>

<style>
  .ds-button {
    display: inline-flex;
    min-height: var(--webase-component-button-height);
    align-items: center;
    justify-content: center;
    gap: var(--webase-component-button-gap);
    padding: 0 var(--webase-component-button-padding-inline);
    border: var(--webase-component-control-border-width) solid transparent;
    border-radius: var(--webase-component-button-radius);
    cursor: pointer;
    font-family: var(--sans);
    font-size: var(--webase-component-button-font-size);
    letter-spacing: var(--track-nav);
    line-height: 1;
    text-transform: uppercase;
    transition: background-color var(--duration-ui) var(--ease-out), color var(--duration-ui) var(--ease-out), border-color var(--duration-ui) var(--ease-out), transform var(--duration-fast) var(--ease-out);
  }
  .ds-button-sm { min-height: var(--webase-component-button-height-sm); padding-inline: var(--webase-component-button-padding-inline-sm); font-size: var(--webase-component-button-font-size-sm); }
  .ds-button.full { width: 100%; }
  .ds-button:active { transform: translateY(0); }
  .ds-button:disabled { cursor: not-allowed; opacity: .45; transform: none; }
  .ds-button-ink { border-color: var(--brand); background: var(--brand); color: var(--paper); }
  .ds-button-outline { border-color: var(--hairline-strong); color: var(--ink); background: transparent; }
  .ds-button-quiet { border-color: var(--hairline); color: var(--ink-soft); background: var(--surface-muted); }
  .ds-button-text { min-height: var(--webase-component-button-height-sm); padding-inline: 0; color: var(--brand); background: transparent; text-decoration: underline; text-decoration-color: var(--hairline-strong); text-underline-offset: var(--webase-component-button-text-underline-offset); }
  .ds-button:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  .ds-button :global(.ds-button-spinner) { animation: ds-button-spin var(--webase-component-button-spinner-duration) linear infinite; }
  @keyframes ds-button-spin { to { transform: rotate(var(--webase-component-button-spinner-rotation)); } }
  @media (hover: hover) and (pointer: fine) { .ds-button:hover { transform: translateY(var(--webase-component-button-hover-offset)); } .ds-button-ink:hover { background: var(--brand-light); border-color: var(--brand-light); } .ds-button-outline:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-tint); } .ds-button-quiet:hover { color: var(--ink); border-color: var(--hairline-strong); } .ds-button-text:hover { text-decoration-color: var(--brand); } }
  @media (prefers-reduced-motion: reduce) { .ds-button { transition: none; } .ds-button :global(.ds-button-spinner) { animation: none; } }
</style>
