<script lang="ts">
  import type { HTMLInputAttributes, HTMLLabelAttributes } from 'svelte/elements';

  type NativeInputProps = Omit<HTMLInputAttributes, 'checked' | 'disabled' | 'role' | 'type'>;

  interface Props extends Omit<HTMLLabelAttributes, 'children'> { label: string; checked?: boolean; disabled?: boolean; description?: string; inputProps?: NativeInputProps; }
  let { label, checked = $bindable(false), disabled = false, description = '', inputProps = {}, class: className = '', ...rest }: Props = $props();
</script>

<label class={`ds-switch ${className}`} class:disabled {...rest}>
  <input {...inputProps} type="checkbox" role="switch" bind:checked aria-label={label} {disabled} />
  <span class="ds-switch-track" aria-hidden="true"><span></span></span>
  <span class="ds-switch-copy"><span>{label}</span>{#if description}<small>{description}</small>{/if}</span>
</label>

<style>
  .ds-switch { display: inline-flex; align-items: center; gap: var(--webase-space-5); color: var(--ink-soft); cursor: pointer; font-size: var(--webase-font-size-body); }
  .ds-switch.disabled { cursor: not-allowed; opacity: .45; }
  input { position: absolute; width: var(--webase-component-visually-hidden-size); height: var(--webase-component-visually-hidden-size); opacity: 0; }
  .ds-switch-track { display: inline-flex; width: var(--webase-component-switch-width); height: var(--webase-component-switch-height); align-items: center; padding: var(--webase-component-switch-padding); border: var(--webase-component-control-border-width) solid var(--hairline-strong); border-radius: var(--webase-radius-pill); background: var(--surface-muted); transition: background-color var(--duration-ui) var(--ease-out), border-color var(--duration-ui) var(--ease-out); }
  .ds-switch-track span { display: block; width: var(--webase-component-switch-thumb-size); height: var(--webase-component-switch-thumb-size); border-radius: var(--webase-radius-circle); background: var(--paper); box-shadow: var(--webase-component-switch-thumb-shadow); transition: transform var(--duration-ui) var(--ease-out); }
  input:checked + .ds-switch-track { border-color: var(--brand); background: var(--brand); }
  input:checked + .ds-switch-track span { transform: translateX(var(--webase-component-switch-thumb-translate)); }
  :global([dir='rtl']) input:checked + .ds-switch-track span { transform: translateX(calc(var(--webase-component-switch-thumb-translate) * -1)); }
  input:focus-visible + .ds-switch-track { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  .ds-switch-copy { display: grid; gap: var(--webase-component-choice-copy-gap); }
  small { color: var(--ink-muted); font-size: var(--webase-font-size-label); line-height: var(--webase-line-height-meta); }
  @media (prefers-reduced-motion: reduce) { .ds-switch-track, .ds-switch-track span { transition: none; } }
</style>
