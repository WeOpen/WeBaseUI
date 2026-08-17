<script lang="ts">
  import type { HTMLLabelAttributes, HTMLTextareaAttributes } from 'svelte/elements';
  import type { WeBaseCountFormatter } from '../types.js';

  type NativeTextareaProps = Omit<HTMLTextareaAttributes, 'disabled' | 'id' | 'maxlength' | 'placeholder' | 'readonly' | 'required' | 'value'>;

  interface Props extends Omit<HTMLLabelAttributes, 'children' | 'for'> { label: string; id?: string; placeholder?: string; value?: string; help?: string; maxLength?: number; error?: string; required?: boolean; disabled?: boolean; readonly?: boolean; requiredLabel?: string; formatCount?: WeBaseCountFormatter; textareaProps?: NativeTextareaProps; }
  const uid = $props.id();
  let { label, id = uid, placeholder = '', value = $bindable(''), help = '', maxLength = 240, error = '', required = false, disabled = false, readonly = false, requiredLabel = 'Required', formatCount = (current, maximum) => `${current} / ${maximum}`, textareaProps = {}, class: className = '', ...rest }: Props = $props();
  const descriptionId = $derived(`${id}-${error ? 'error' : 'help'}`);
  const describedBy = $derived([textareaProps['aria-describedby'], error || help ? descriptionId : undefined].filter(Boolean).join(' ') || undefined);
  const invalid = $derived(error ? 'true' : textareaProps['aria-invalid']);
</script>

<label class={`ds-textarea ${className}`} for={id} {...rest}>
  <span>{label}<span class="ds-textarea-meta">{#if required}<em>{requiredLabel}</em>{/if}<em>{formatCount(value.length, maxLength)}</em></span></span>
  <textarea {...textareaProps} {id} {placeholder} bind:value rows={textareaProps.rows ?? 4} maxlength={maxLength} {required} {disabled} {readonly} aria-invalid={invalid} aria-describedby={describedBy}></textarea>
  {#if error}<small class="error" id={descriptionId}>{error}</small>{:else if help}<small id={descriptionId}>{help}</small>{/if}
</label>

<style>
  .ds-textarea { display: grid; gap: var(--webase-space-4); }
  .ds-textarea > span { display: flex; min-width: 0; flex-wrap: wrap; justify-content: space-between; gap: var(--webase-space-6); color: var(--ink); font-family: var(--sans); font-size: var(--webase-font-size-label); letter-spacing: var(--webase-letter-spacing-label); overflow-wrap: anywhere; text-transform: uppercase; }
  .ds-textarea-meta { display: inline-flex; gap: var(--webase-space-5); }
  em { color: var(--ink-muted); font-family: var(--mono); font-size: var(--webase-font-size-meta); font-style: normal; font-weight: 400; }
  textarea { width: 100%; min-height: var(--webase-component-textarea-min-height); padding: var(--webase-component-control-padding-inline); resize: vertical; border: var(--webase-component-control-border-width) solid var(--hairline-strong); outline: none; color: var(--ink); background: var(--surface); font-family: var(--font); font-size: var(--webase-component-control-font-size); line-height: var(--webase-line-height-body); }
  textarea:focus { border-color: var(--brand); box-shadow: var(--webase-component-control-focus-shadow-offset) var(--webase-component-control-focus-shadow-offset) 0 color-mix(in srgb, var(--brand) 16%, transparent); }
  textarea[aria-invalid='true'] { border-color: var(--status-error); }
  small { color: var(--ink-muted); font-size: var(--webase-component-control-help-font-size); line-height: var(--webase-component-control-help-line-height); }
  small.error { color: var(--status-error); }
</style>
