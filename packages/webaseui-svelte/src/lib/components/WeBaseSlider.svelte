<script lang="ts">
  import type { HTMLInputAttributes, HTMLLabelAttributes } from 'svelte/elements';
  import type { WeBaseSliderValueFormatter } from '../types.js';

  type NativeInputProps = Omit<HTMLInputAttributes, 'disabled' | 'id' | 'max' | 'min' | 'step' | 'style' | 'type' | 'value'>;

  interface Props extends Omit<HTMLLabelAttributes, 'children' | 'for'> { label: string; value?: number; min?: number; max?: number; step?: number; unit?: string; id?: string; disabled?: boolean; formatValue?: WeBaseSliderValueFormatter; inputProps?: NativeInputProps; }
  const uid = $props.id();
  let { label, value = $bindable(48), min = 0, max = 100, step = 1, unit = '%', id = uid, disabled = false, formatValue = (current, suffix) => `${current}${suffix}`, inputProps = {}, class: className = '', ...rest }: Props = $props();
  const safeMin = $derived(Number.isFinite(min) ? min : 0);
  const safeMax = $derived(Number.isFinite(max) && max > safeMin ? max : safeMin + 1);
  const safeStep = $derived(Number.isFinite(step) && step > 0 ? step : 1);
  const safeValue = $derived(Math.min(safeMax, Math.max(safeMin, Number.isFinite(value) ? value : safeMin)));
  const position = $derived(((safeValue - safeMin) / (safeMax - safeMin)) * 100);

  $effect(() => {
    if (value !== safeValue) value = safeValue;
  });
</script>

<label class={`ds-slider ${className}`} for={id} {...rest}>
  <span class="ds-slider-label"><span>{label}</span><output for={id}>{formatValue(safeValue, unit)}</output></span>
  <input {...inputProps} {id} type="range" min={safeMin} max={safeMax} step={safeStep} bind:value {disabled} style={`--slider-position:${position}%`} />
  <span class="ds-slider-scale" aria-hidden="true"><span>{formatValue(safeMin, unit)}</span><span>{formatValue(safeMax, unit)}</span></span>
</label>

<style>
  .ds-slider { display: grid; gap: var(--webase-space-5); }
  .ds-slider-label, .ds-slider-scale { display: flex; align-items: center; justify-content: space-between; gap: var(--webase-space-8); }
  .ds-slider-label { color: var(--ink); font-family: var(--sans); font-size: var(--webase-font-size-label); letter-spacing: var(--webase-letter-spacing-label); text-transform: uppercase; }
  output { color: var(--brand); font-family: var(--mono); }
  input { width: 100%; height: var(--webase-interactive-target-min); margin: 0; appearance: none; background: transparent; cursor: pointer; touch-action: pan-y; }
  input::-webkit-slider-runnable-track { height: var(--webase-component-slider-track-height); border: var(--webase-border-thin) solid var(--hairline-strong); background: linear-gradient(to right, var(--brand) 0 var(--slider-position), var(--surface-muted) var(--slider-position) 100%); }
  :global([dir='rtl']) input::-webkit-slider-runnable-track { background: linear-gradient(to left, var(--brand) 0 var(--slider-position), var(--surface-muted) var(--slider-position) 100%); }
  input::-webkit-slider-thumb { width: var(--webase-size-icon); height: var(--webase-size-icon); margin-top: var(--webase-component-slider-thumb-offset); appearance: none; border: var(--webase-border-emphasis) solid var(--surface); border-radius: var(--webase-radius-circle); background: var(--brand); box-shadow: 0 0 0 var(--webase-border-thin) var(--brand); }
  input::-moz-range-track { height: var(--webase-component-slider-track-height); border: var(--webase-border-thin) solid var(--hairline-strong); background: var(--surface-muted); }
  input::-moz-range-progress { height: var(--webase-component-slider-track-height); background: var(--brand); }
  input::-moz-range-thumb { width: var(--webase-component-slider-thumb-size-firefox); height: var(--webase-component-slider-thumb-size-firefox); border: var(--webase-border-emphasis) solid var(--surface); border-radius: var(--webase-radius-circle); background: var(--brand); box-shadow: 0 0 0 var(--webase-border-thin) var(--brand); }
  input:focus-visible { outline: var(--focus-ring); outline-offset: var(--webase-space-2); }
  input:disabled { cursor: not-allowed; opacity: .45; }
  .ds-slider-scale { color: var(--ink-muted); font-family: var(--mono); font-size: var(--webase-font-size-meta); letter-spacing: var(--webase-letter-spacing-label); }
</style>
