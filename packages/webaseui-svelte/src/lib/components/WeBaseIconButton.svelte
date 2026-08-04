<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import WeBaseIcon, { type WeBaseIconName } from './WeBaseIcon.svelte';

  interface Props extends Omit<HTMLButtonAttributes, 'children' | 'disabled' | 'onclick'> {
    label: string;
    icon?: WeBaseIconName;
    pressed?: boolean;
    disabled?: boolean;
    onclick?: (event: MouseEvent) => void;
  }

  let { label, icon = 'arrow-up-right', pressed = $bindable(false), disabled = false, onclick, class: className = '', ...rest }: Props = $props();
</script>

<button class:pressed class={`ds-icon-button ${className}`} type="button" aria-label={label} aria-pressed={pressed} {disabled} {onclick} {...rest}>
  <!-- fill only reads on closed shapes like bookmark and heart; on stroke-only glyphs it is a no-op. -->
  <WeBaseIcon name={icon} size={18} fill={pressed ? 'currentColor' : 'none'} />
</button>

<style>
  .ds-icon-button { display: inline-grid; width: 44px; height: 44px; place-items: center; border: 1px solid var(--hairline-strong); border-radius: 50%; color: var(--brand); background: transparent; cursor: pointer; font-family: var(--font); font-size: 20px; transition: background-color var(--duration-ui) var(--ease-out), color var(--duration-ui) var(--ease-out), transform var(--duration-fast) var(--ease-out); }
  .ds-icon-button:hover, .ds-icon-button.pressed { background: var(--brand); color: var(--paper); transform: rotate(4deg); }
  .ds-icon-button:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  .ds-icon-button:disabled { cursor: not-allowed; opacity: .4; transform: none; }
  @media (prefers-reduced-motion: reduce) { .ds-icon-button { transition: none; } }
</style>
