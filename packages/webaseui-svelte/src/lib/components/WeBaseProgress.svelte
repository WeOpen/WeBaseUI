<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { WeBaseNumberFormatter } from '../types.js';

  type Tone = 'brand' | 'success';
  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> { value?: number; label?: string; tone?: Tone; compact?: boolean; formatValue?: WeBaseNumberFormatter; }
  let { value = 62, label = 'Progress', tone = 'brand', compact = false, formatValue = (current) => `${current}%`, class: className = '', ...rest }: Props = $props();
  const safeValue = $derived(Math.max(0, Math.min(100, value)));
</script>

<div class={`ds-progress-wrap ds-progress-${tone} ${className}`} class:compact {...rest}>
  <div class="ds-progress-label"><span>{label}</span><span>{formatValue(safeValue)}</span></div>
  <div class="ds-progress" role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={safeValue}><span style={`width:${safeValue}%`}></span></div>
</div>

<style>
  .ds-progress-wrap { --progress-color: var(--brand); display: grid; gap: var(--webase-space-4); }
  .ds-progress-success { --progress-color: var(--status-success); }
  .ds-progress-label { display: flex; justify-content: space-between; color: var(--ink-muted); font-family: var(--mono); font-size: var(--webase-font-size-overline); letter-spacing: var(--webase-letter-spacing-label); text-transform: uppercase; }
  .ds-progress { height: var(--webase-component-progress-height); overflow: hidden; border: var(--webase-border-thin) solid var(--hairline-strong); background: var(--surface-muted); }
  .ds-progress span { display: block; height: 100%; background: var(--progress-color); transition: width var(--duration-ui) var(--ease-out); }
  .compact .ds-progress { height: var(--webase-component-progress-height-compact); border: 0; }
  @media (prefers-reduced-motion: reduce) { .ds-progress span { transition: none; } }
</style>
