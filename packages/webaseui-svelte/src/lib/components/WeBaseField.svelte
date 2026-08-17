<script lang="ts">
  import type { HTMLInputAttributes, HTMLLabelAttributes } from 'svelte/elements';

  type NativeInputProps = Omit<HTMLInputAttributes, 'disabled' | 'id' | 'placeholder' | 'readonly' | 'required' | 'type' | 'value'>;

  interface Props extends Omit<HTMLLabelAttributes, 'children' | 'for'> {
    label: string;
    id?: string;
    placeholder?: string;
    help?: string;
    error?: string;
    type?: 'text' | 'email' | 'search';
    value?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    requiredLabel?: string;
    inputProps?: NativeInputProps;
  }

  const uid = $props.id();
  let { label, id = uid, placeholder = '', help = '', error = '', type = 'text', value = $bindable(''), required = false, disabled = false, readonly = false, requiredLabel = 'Required', inputProps = {}, class: className = '', ...rest }: Props = $props();
  const descriptionId = $derived(`${id}-${error ? 'error' : 'help'}`);
  const describedBy = $derived([inputProps['aria-describedby'], error || help ? descriptionId : undefined].filter(Boolean).join(' ') || undefined);
  const invalid = $derived(error ? 'true' : inputProps['aria-invalid']);
</script>

<label class={`ds-field ${className}`} for={id} {...rest}>
  <span class="ds-field-label">{label}{#if required}<em>{requiredLabel}</em>{/if}</span>
  <input {...inputProps} {id} {type} {placeholder} bind:value {required} {disabled} {readonly} aria-invalid={invalid} aria-describedby={describedBy} />
  {#if error}<span class="ds-field-error" id={descriptionId}>{error}</span>{:else if help}<span class="ds-field-help" id={descriptionId}>{help}</span>{/if}
</label>

<style>
  .ds-field { display: grid; gap: var(--webase-space-4); }
  .ds-field-label { display: flex; min-width: 0; flex-wrap: wrap; justify-content: space-between; gap: var(--webase-space-6); color: var(--ink); font-family: var(--sans); font-size: var(--webase-font-size-label); letter-spacing: var(--webase-letter-spacing-label); overflow-wrap: anywhere; text-transform: uppercase; }
  .ds-field-label em { color: var(--ink-muted); font-family: var(--mono); font-size: var(--webase-font-size-meta); font-style: normal; font-weight: 400; }
  input { width: 100%; min-height: var(--webase-component-control-height); padding: 0 var(--webase-component-control-padding-inline); border: var(--webase-component-control-border-width) solid var(--hairline-strong); border-radius: var(--webase-component-control-radius); outline: none; color: var(--ink); background: var(--surface); font-family: var(--font); font-size: var(--webase-component-control-font-size); transition: border-color var(--duration-ui) var(--ease-out), box-shadow var(--duration-ui) var(--ease-out); }
  input::placeholder { color: var(--ink-muted); }
  input:focus { border-color: var(--brand); box-shadow: var(--webase-component-control-focus-shadow-offset) var(--webase-component-control-focus-shadow-offset) 0 color-mix(in srgb, var(--brand) 16%, transparent); }
  input[aria-invalid='true'] { border-color: var(--status-error); box-shadow: var(--webase-component-control-focus-shadow-offset) var(--webase-component-control-focus-shadow-offset) 0 color-mix(in srgb, var(--status-error) 14%, transparent); }
  input:disabled { cursor: not-allowed; opacity: .55; }
  .ds-field-help, .ds-field-error { color: var(--ink-muted); font-size: var(--webase-component-control-help-font-size); line-height: var(--webase-component-control-help-line-height); }
  .ds-field-error { color: var(--status-error); }
  @media (hover: hover) and (pointer: fine) { input:hover { border-color: var(--brand); } }
  @media (prefers-reduced-motion: reduce) { input { transition: none; } }
</style>
