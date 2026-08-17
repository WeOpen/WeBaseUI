<script lang="ts">
  import type { HTMLInputAttributes, HTMLLabelAttributes } from 'svelte/elements';
  import WeBaseIcon from './WeBaseIcon.svelte';

  type NativeInputProps = Omit<HTMLInputAttributes, 'checked' | 'disabled' | 'indeterminate' | 'type'>;

  interface Props extends Omit<HTMLLabelAttributes, 'children'> { label: string; checked?: boolean; disabled?: boolean; indeterminate?: boolean; description?: string; inputProps?: NativeInputProps; }
  let { label, checked = $bindable(false), disabled = false, indeterminate = $bindable(false), description = '', inputProps = {}, class: className = '', ...rest }: Props = $props();
  let input: HTMLInputElement;
  $effect(() => { if (input) input.indeterminate = indeterminate; });

  function handleChange(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    indeterminate = false;
    inputProps.onchange?.(event);
  }
</script>

<label class:disabled class={`ds-check ${className}`} {...rest}>
  <input {...inputProps} bind:this={input} type="checkbox" bind:checked {disabled} onchange={handleChange} />
  <span class="ds-check-box" aria-hidden="true">{#if indeterminate}<WeBaseIcon name="minus" size={13} strokeWidth={2} />{:else if checked}<WeBaseIcon name="check" size={13} strokeWidth={2} />{/if}</span>
  <span class="ds-check-copy"><span>{label}</span>{#if description}<small>{description}</small>{/if}</span>
</label>

<style>
  .ds-check { display: inline-flex; min-height: var(--webase-interactive-target-min); align-items: center; gap: var(--webase-component-choice-gap); color: var(--ink-soft); cursor: pointer; font-size: var(--webase-font-size-body); }
  .ds-check.disabled { cursor: not-allowed; opacity: .45; }
  input { position: absolute; width: var(--webase-component-visually-hidden-size); height: var(--webase-component-visually-hidden-size); opacity: 0; }
  .ds-check-box { display: grid; width: var(--webase-component-choice-size); height: var(--webase-component-choice-size); place-items: center; border: var(--webase-component-control-border-width) solid var(--hairline-strong); color: var(--paper); background: transparent; font-family: var(--sans); font-size: var(--webase-font-size-caption); }
  input:checked + .ds-check-box { border-color: var(--brand); background: var(--brand); }
  input:indeterminate + .ds-check-box { border-color: var(--brand); color: var(--paper); background: var(--brand); }
  input:focus-visible + .ds-check-box { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  .ds-check-copy { display: grid; gap: var(--webase-component-choice-copy-gap); }
  small { color: var(--ink-muted); font-size: var(--webase-font-size-label); line-height: var(--webase-line-height-meta); }
</style>
