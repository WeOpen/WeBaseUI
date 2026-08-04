<script lang="ts">
  import type { HTMLLabelAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLLabelAttributes, 'children' | 'for'> { label: string; id?: string; placeholder?: string; value?: string; help?: string; maxLength?: number; error?: string; }
  const uid = $props.id();
  let { label, id = uid, placeholder = '', value = $bindable(''), help = '', maxLength = 240, error = '', class: className = '', ...rest }: Props = $props();
  const descriptionId = $derived(`${id}-${error ? 'error' : 'help'}`);
</script>

<label class={`ds-textarea ${className}`} for={id} {...rest}>
  <span>{label}<em>{value.length} / {maxLength}</em></span>
  <textarea {id} {placeholder} bind:value rows="4" maxlength={maxLength} aria-invalid={error ? 'true' : undefined} aria-describedby={error || help ? descriptionId : undefined}></textarea>
  {#if error}<small class="error" id={descriptionId}>{error}</small>{:else if help}<small id={descriptionId}>{help}</small>{/if}
</label>

<style>
  .ds-textarea { display: grid; gap: 8px; }
  .ds-textarea > span { display: flex; justify-content: space-between; gap: 12px; color: var(--ink); font-family: var(--sans); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
  em { color: var(--ink-muted); font-family: var(--mono); font-size: 9px; font-style: normal; font-weight: 400; }
  textarea { width: 100%; min-height: 110px; padding: 12px; resize: vertical; border: 1px solid var(--hairline-strong); outline: none; color: var(--ink); background: var(--surface); font-family: var(--font); font-size: 16px; line-height: 1.45; }
  textarea:focus { border-color: var(--brand); box-shadow: 4px 4px 0 color-mix(in srgb, var(--brand) 16%, transparent); }
  textarea[aria-invalid='true'] { border-color: var(--status-error); }
  small { color: var(--ink-muted); font-size: 12px; line-height: 1.4; }
  small.error { color: var(--status-error); }
</style>
