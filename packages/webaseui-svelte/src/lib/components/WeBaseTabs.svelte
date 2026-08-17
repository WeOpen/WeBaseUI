<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { findRovingFocusIndex } from '../internal/roving-focus.js';
  import { normalizeIndex } from '../utils/collection.js';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> { items: string[]; active?: number; panels?: string[]; label?: string; id?: string; }
  const uid = $props.id();
  let { items, active = $bindable(0), panels = [], label = 'Tabs', id = uid, class: className = '', ...rest }: Props = $props();
  let root: HTMLDivElement;

  $effect(() => {
    if (items.length === 0) {
      if (active !== -1) active = -1;
    } else if (active !== normalizeIndex(active, items.length)) {
      active = normalizeIndex(active, items.length);
    }
  });

  function handleKeydown(event: KeyboardEvent, index: number) {
    const direction = getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr';
    const next = findRovingFocusIndex(items, index, event.key, 'horizontal', undefined, direction);
    if (next === undefined || next < 0) return;
    event.preventDefault();
    active = next;
    root.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }
</script>

<div class={`ds-tabs ${className}`} bind:this={root} {...rest}>
  <div class="ds-tab-list" role="tablist" aria-label={label}>
    {#each items as item, index (index)}
      <button type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={active === index} tabindex={active === index ? 0 : -1} class:active={active === index} onclick={() => (active = index)} onkeydown={(event) => handleKeydown(event, index)}>{item}</button>
    {/each}
  </div>
  <!-- Every panel stays mounted so each tab's aria-controls resolves to a real element. -->
  {#each items as item, index (index)}
    <div class="ds-tab-panel" id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} tabindex="0" hidden={active !== index}>{panels[index] ?? item}</div>
  {/each}
</div>

<style>
  .ds-tabs { display: grid; gap: var(--webase-space-7); }
  .ds-tab-list { display: flex; flex-wrap: wrap; gap: var(--webase-space-2); border-bottom: var(--webase-border-thin) solid var(--hairline-strong); }
  .ds-tab-list button { min-width: 0; min-height: var(--webase-component-tabs-trigger-height); padding: 0 var(--webase-space-6); border: 0; border-bottom: var(--webase-border-emphasis) solid transparent; color: var(--ink-muted); background: transparent; cursor: pointer; font-family: var(--sans); font-size: var(--webase-font-size-label); letter-spacing: var(--webase-letter-spacing-label); overflow-wrap: anywhere; text-transform: uppercase; white-space: normal; }
  .ds-tab-list button.active { border-bottom-color: var(--brand); color: var(--brand); }
  .ds-tab-list button:focus-visible, .ds-tab-panel:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  .ds-tab-panel { padding: var(--webase-space-9); border: var(--webase-border-thin) solid var(--hairline); background: var(--surface); color: var(--ink-muted); font-size: var(--webase-font-size-option); }
  .ds-tab-panel[hidden] { display: none; }
  @media (hover: hover) and (pointer: fine) { .ds-tab-list button:hover { border-bottom-color: var(--brand); color: var(--brand); } }
</style>
