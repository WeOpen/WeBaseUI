<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  /*
    `variant`, not `tone`. Across the rest of the set `tone` means semantic status
    (info / success / warning / error, as in WeBaseAlert and WeBaseToast). These three
    values are a catalogue taxonomy, so reusing `tone` here would overload one
    prop name with two unrelated meanings.
  */
  type Variant = 'canonical' | 'one-off' | 'experiment';

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
    label: string;
    variant?: Variant;
    dot?: boolean;
  }

  let { label, variant = 'canonical', dot = false, class: className = '', ...rest }: Props = $props();
</script>

<span class={`ds-badge ds-badge-${variant} ${className}`} {...rest}>{#if dot}<i aria-hidden="true"></i>{/if}{label}</span>

<style>
  .ds-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 24px;
    padding: 3px 8px;
    border: 1px solid currentColor;
    border-radius: 999px;
    font-family: var(--sans);
    font-size: 10px;
    letter-spacing: .1em;
    line-height: 1;
    text-transform: uppercase;
  }
  .ds-badge-canonical { color: var(--brand); background: var(--brand-tint); }
  .ds-badge-one-off { color: var(--ink-muted); background: var(--surface-muted); }
  .ds-badge-experiment { color: var(--status-warning); background: var(--status-warning-field); }
  i { display: block; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
</style>
