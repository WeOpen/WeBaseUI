<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { findRovingFocusIndex } from '../internal/roving-focus.js';
  import type { WeBaseAccordionItem, WeBaseNumberFormatter } from '../types.js';
  import WeBaseIcon from './WeBaseIcon.svelte';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> { items: WeBaseAccordionItem[]; open?: number; id?: string; formatIndex?: WeBaseNumberFormatter; }

  const uid = $props.id();
  let { items, open = $bindable(0), id = uid, formatIndex = (value) => String(value).padStart(2, '0'), class: className = '', ...rest }: Props = $props();
  let root: HTMLDivElement;

  $effect(() => {
    if (!Number.isInteger(open) || open < -1 || open >= items.length) open = -1;
  });

  function toggle(index: number) {
    open = open === index ? -1 : index;
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    const next = findRovingFocusIndex(items, index, event.key, 'vertical');
    if (next === undefined || next < 0) return;
    event.preventDefault();
    const buttons = root.querySelectorAll<HTMLButtonElement>('.ds-accordion-trigger');
    buttons[next]?.focus();
  }
</script>

<div class={`ds-accordion ${className}`} bind:this={root} {...rest}>
  {#each items as item, index (index)}
    <section class:open={open === index}>
      <h3>
        <button
          class="ds-accordion-trigger"
          type="button"
          id={`${id}-trigger-${index}`}
          aria-expanded={open === index}
          aria-controls={`${id}-panel-${index}`}
          onclick={() => toggle(index)}
          onkeydown={(event) => handleKeydown(event, index)}
        >
          <span><small>{formatIndex(index + 1)}</small>{item.title}</span>
          <WeBaseIcon name="chevron-down" size={18} strokeWidth={1.6} />
        </button>
      </h3>
      <!-- Panels stay mounted so each trigger's aria-controls resolves to a real element. -->
      <div class="ds-accordion-panel" id={`${id}-panel-${index}`} role="region" aria-labelledby={`${id}-trigger-${index}`} hidden={open !== index}>
        <p>{item.content}</p>
      </div>
    </section>
  {/each}
</div>

<style>
  .ds-accordion { border-top: var(--webase-border-thin) solid var(--hairline-strong); }
  section { border-bottom: var(--webase-border-thin) solid var(--hairline-strong); }
  h3 { margin: 0; }
  .ds-accordion-trigger { display: flex; width: 100%; min-height: var(--webase-component-accordion-trigger-height); align-items: center; justify-content: space-between; gap: var(--webase-space-9); padding: 0 var(--webase-space-2); border: 0; color: var(--ink); background: transparent; cursor: pointer; font-family: var(--font); font-size: var(--webase-component-accordion-title-font-size); text-align: start; }
  .ds-accordion-trigger > span { display: flex; align-items: center; gap: var(--webase-space-8); }
  small { color: var(--brand); font-family: var(--mono); font-size: var(--webase-font-size-meta); letter-spacing: var(--webase-letter-spacing-meta); }
  .ds-accordion-trigger :global(svg) { flex: none; color: var(--brand); transition: transform var(--duration-ui) var(--ease-out); }
  section.open .ds-accordion-trigger :global(svg) { transform: rotate(var(--webase-component-accordion-icon-open-rotation)); }
  .ds-accordion-trigger:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  .ds-accordion-panel { padding: 0 var(--webase-component-accordion-panel-padding-inline) var(--webase-space-10); animation: ds-accordion-in var(--duration-ui) var(--ease-out) both; }
  .ds-accordion-panel[hidden] { display: none; }
  p { max-width: 58ch; margin: 0; color: var(--ink-muted); font-size: var(--webase-font-size-body); line-height: var(--webase-line-height-relaxed); }
  @keyframes ds-accordion-in { from { opacity: 0; transform: translateY(var(--webase-component-accordion-enter-offset)); } to { opacity: 1; transform: translateY(0); } }
  @media (hover: hover) and (pointer: fine) { .ds-accordion-trigger:hover { color: var(--brand); } }
  @media (prefers-reduced-motion: reduce) { .ds-accordion-trigger :global(svg), .ds-accordion-panel { animation: none; transition: none; } }
</style>
