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
    gap: var(--webase-component-badge-gap);
    min-height: var(--webase-component-badge-min-height);
    padding: var(--webase-component-badge-padding-block) var(--webase-component-badge-padding-inline);
    border: var(--webase-border-thin) solid currentColor;
    border-radius: var(--webase-radius-pill);
    font-family: var(--sans);
    font-size: var(--webase-font-size-overline);
    letter-spacing: var(--webase-letter-spacing-meta);
    line-height: 1;
    text-transform: uppercase;
  }
  .ds-badge-canonical { color: var(--brand); background: var(--brand-tint); }
  .ds-badge-one-off { color: var(--ink-muted); background: var(--surface-muted); }
  .ds-badge-experiment { color: var(--status-warning); background: var(--status-warning-field); }
  i { display: block; width: var(--webase-component-badge-dot-size); height: var(--webase-component-badge-dot-size); border-radius: var(--webase-radius-circle); background: currentColor; }
</style>
