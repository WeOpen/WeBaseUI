<script lang="ts">
  import type { HTMLInputAttributes, HTMLLabelAttributes } from 'svelte/elements';

  type NativeInputProps = Omit<HTMLInputAttributes, 'checked' | 'disabled' | 'name' | 'type' | 'value'>;

  interface Props extends Omit<HTMLLabelAttributes, 'children'> { name: string; label: string; value: string; selected?: string; disabled?: boolean; description?: string; inputProps?: NativeInputProps; }
  let { name, label, value, selected = $bindable(''), disabled = false, description = '', inputProps = {}, class: className = '', ...rest }: Props = $props();
</script>

<label class={`ds-radio ${className}`} class:disabled {...rest}>
  <input {...inputProps} type="radio" {name} value={value} bind:group={selected} {disabled} />
  <span class="ds-radio-dot" aria-hidden="true"></span>
  <span class="ds-radio-copy"><span>{label}</span>{#if description}<small>{description}</small>{/if}</span>
</label>

<style>
  .ds-radio { display: inline-flex; min-height: var(--webase-interactive-target-min); align-items: center; gap: var(--webase-component-choice-gap); color: var(--ink-soft); cursor: pointer; font-size: var(--webase-font-size-body); }
  .ds-radio.disabled { cursor: not-allowed; opacity: .45; }
  input { position: absolute; width: var(--webase-component-visually-hidden-size); height: var(--webase-component-visually-hidden-size); opacity: 0; }
  .ds-radio-dot { display: grid; width: var(--webase-component-choice-size); height: var(--webase-component-choice-size); place-items: center; border: var(--webase-component-control-border-width) solid var(--hairline-strong); border-radius: var(--webase-radius-circle); }
  .ds-radio-dot::after { width: var(--webase-component-radio-mark-size); height: var(--webase-component-radio-mark-size); border-radius: var(--webase-radius-circle); background: var(--brand); content: ''; opacity: 0; transform: scale(.6); transition: opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out); }
  input:checked + .ds-radio-dot::after { opacity: 1; transform: scale(1); }
  input:focus-visible + .ds-radio-dot { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  .ds-radio-copy { display: grid; gap: var(--webase-component-choice-copy-gap); }
  small { color: var(--ink-muted); font-size: var(--webase-font-size-label); line-height: var(--webase-line-height-meta); }
  @media (prefers-reduced-motion: reduce) { .ds-radio-dot::after { transition: none; } }
</style>
