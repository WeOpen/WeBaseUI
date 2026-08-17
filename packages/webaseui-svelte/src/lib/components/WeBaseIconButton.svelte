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

  let { label, icon = 'arrow-up-right', pressed = $bindable(), disabled = false, onclick, class: className = '', ...rest }: Props = $props();
  const isPressed = $derived(pressed === true);
</script>

<button class:pressed={isPressed} class={`ds-icon-button ${className}`} type="button" aria-label={label} aria-pressed={pressed} {disabled} {onclick} {...rest}>
  <!-- fill only reads on closed shapes like bookmark and heart; on stroke-only glyphs it is a no-op. -->
  <WeBaseIcon name={icon} size={18} fill={isPressed ? 'currentColor' : 'none'} />
</button>

<style>
  .ds-icon-button { display: inline-grid; width: var(--webase-component-icon-button-size); height: var(--webase-component-icon-button-size); place-items: center; border: var(--webase-component-control-border-width) solid var(--hairline-strong); border-radius: var(--webase-component-icon-button-radius); color: var(--brand); background: transparent; cursor: pointer; font-family: var(--font); font-size: var(--webase-component-icon-button-font-size); transition: background-color var(--duration-ui) var(--ease-out), color var(--duration-ui) var(--ease-out), transform var(--duration-fast) var(--ease-out); }
  .ds-icon-button.pressed { background: var(--brand); color: var(--paper); transform: rotate(var(--webase-component-icon-button-hover-rotation)); }
  .ds-icon-button:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  .ds-icon-button:disabled { cursor: not-allowed; opacity: .4; transform: none; }
  @media (hover: hover) and (pointer: fine) { .ds-icon-button:hover { background: var(--brand); color: var(--paper); transform: rotate(var(--webase-component-icon-button-hover-rotation)); } }
  @media (prefers-reduced-motion: reduce) { .ds-icon-button { transition: none; } }
</style>
